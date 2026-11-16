# Search investigation pilot

The November Search Console audit found 25 crawled-but-not-indexed URLs. This pilot makes three existing event pages more useful for incident responders. It does not assume content caused the coverage drop or promise rankings or AI citations.

## Research and implementation

- [Google Search generative AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): focus on distinctive, useful content and clear structure. Google Search does not need a special AI markup or `llms.txt` for discovery.
- [Google link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) and the [Ultimate Windows Security 4624 reference](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventID=4624): use field-specific explanations, concrete examples, and meaningful links at the point where readers need the next event. Borrow the structure, not the text.
- Technical evidence: Microsoft references for [4624](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624), [4768](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4768), [4771](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4771), [5140](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-5140), [5145](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-5145), and [4663](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4663). Examples are illustrative, not production incident records or default detection thresholds.

4624 examines a network logon followed by share access; 4771 separates stale credentials from a spraying hypothesis; 5140 distinguishes share access, checked rights, and a file write. Each example appears in the existing static event HTML, with a deep-link anchor and descriptive links to the next investigation step. No new URLs, schema changes, or indexing requests.

## Measurement

Start the measurement window after confirming production deployment and record the next crawl time per pilot URL. Compare indexing and complete 28-day windows for clicks, impressions, and matched queries per page. Use 4768 as a nearby reference page from the same previous content refresh that does not receive the worked-example treatment; this is an observational comparison, not a controlled experiment. Check the Search Console generative AI performance report separately if the property has data. Record a missing report or insufficient volume rather than treating it as a zero or extrapolating from a handful of impressions.
