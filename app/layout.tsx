import type { Metadata } from "next";
import Link from "next/link";
import { HeaderSearch } from "../components/HeaderSearch";
import { ToolsMenu } from "../components/ToolsMenu";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

const navItems = [
  { href: "/windows-events/", label: "Windows Events" },
  { href: "/sysmon-events/", label: "Sysmon Events" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-line bg-[#fbfcf8]/95">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
            <Link href="/" className="shrink-0 self-start whitespace-nowrap text-lg font-semibold tracking-normal text-ink">
              SOC Event Lookup
            </Link>
            <HeaderSearch />
            <nav className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 border-t border-line pt-2 text-sm text-steel lg:ml-auto lg:border-t-0 lg:pt-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded border border-transparent px-2.5 py-1.5 hover:border-line hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
              <ToolsMenu />
              <Link
                className="rounded border border-transparent px-2.5 py-1.5 hover:border-line hover:bg-white"
                href="/about/"
              >
                About
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-line bg-panel">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-steel sm:flex-row sm:justify-between">
            <p>Structured event knowledge for human review and machine reuse.</p>
            <div className="flex gap-4">
              <Link href="/privacy-policy/">Privacy</Link>
              <Link href="/disclaimer/">Disclaimer</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
