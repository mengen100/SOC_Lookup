"""Read-only audit of sitemap pages and links in server-rendered HTML."""

import concurrent.futures
from html.parser import HTMLParser
import json
import sys
import urllib.request
from urllib.parse import urljoin, urlsplit
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.canonical = None
        self.noindex = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag == "link" and "canonical" in attrs.get("rel", "").split():
            self.canonical = attrs.get("href")
        if tag == "meta" and attrs.get("name", "").lower() in ("robots", "googlebot"):
            self.noindex |= "noindex" in attrs.get("content", "").lower()


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "SOC-Lookup-Discovery-Audit/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, response.url, response.headers, response.read().decode("utf-8")


def main():
    origin = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "https://soceventlookup.com"
    if urlsplit(origin).scheme != "https" or urlsplit(origin).path:
        raise ValueError("Expected a public HTTPS origin without a path")
    root = ET.fromstring(fetch(origin + "/sitemap.xml")[3])
    urls = [node.text for node in root.findall("{*}url/{*}loc")]
    targets = set(urls)
    errors = []
    if len(targets) != len(urls):
        errors.append("Sitemap contains duplicate URLs")
    graph = {}
    inbound = {url: 0 for url in urls}

    def inspect(url):
        status, final_url, headers, body = fetch(url)
        page = Page()
        page.feed(body)
        links = set()
        for href in page.links:
            parts = urlsplit(urljoin(url, href))
            links.add(parts._replace(query="", fragment="").geturl())
        return url, status, final_url, headers, page, links & targets

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(inspect, url): url for url in urls}
        for future in concurrent.futures.as_completed(futures):
            url = futures[future]
            try:
                url, status, final_url, headers, page, links = future.result()
                graph[url] = links
                for target in links:
                    if target != url:
                        inbound[target] += 1
                if status != 200 or final_url != url:
                    errors.append(f"{url}: HTTP {status}, final URL {final_url}")
                if page.canonical != url:
                    errors.append(f"{url}: canonical {page.canonical}")
                if page.noindex or "noindex" in headers.get("X-Robots-Tag", "").lower():
                    errors.append(f"{url}: noindex")
            except Exception as error:
                errors.append(f"{url}: {error}")

    reached = set()
    queue = [origin + "/"]
    while queue:
        url = queue.pop()
        if url not in reached:
            reached.add(url)
            queue.extend(graph.get(url, set()) - reached)
    unreachable = sorted(targets - reached)
    errors.extend(f"{url}: unreachable through static HTML links" for url in unreachable)
    print(json.dumps({"sitemap_count": len(urls), "checked": len(graph),
                      "reachable_from_home": len(reached & targets),
                      "inbound_links": dict(sorted(inbound.items())),
                      "errors": errors}, indent=2))
    return bool(errors)


if __name__ == "__main__":
    sys.exit(main())
