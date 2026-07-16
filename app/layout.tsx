import type { Metadata } from "next";
import Link from "next/link";
import { HeaderSearch } from "../components/HeaderSearch";
import { NavLink } from "../components/NavLink";
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
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <header className="sticky top-0 z-40 border-b border-line bg-[#fbfcf8]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 lg:flex-nowrap">
            <Link
              className="shrink-0 whitespace-nowrap text-lg font-semibold tracking-normal text-ink"
              href="/"
            >
              SOC Event Lookup
            </Link>
            <div className="order-3 w-full lg:order-none lg:w-auto lg:max-w-sm lg:flex-1">
              <HeaderSearch />
            </div>
            <nav className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 text-sm lg:ml-auto lg:shrink-0">
              {navItems.map((item) => (
                <NavLink href={item.href} key={item.href}>
                  {item.label}
                </NavLink>
              ))}
              <ToolsMenu />
              <NavLink href="/about/">About</NavLink>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
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
