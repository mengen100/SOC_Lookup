import type { Metadata } from "next";
import Link from "next/link";
import { HeaderSearch } from "../components/HeaderSearch";
import { ToolsMenu } from "../components/ToolsMenu";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://soc-event-lookup.vercel.app"),
  title: {
    default: "SOC Event Lookup",
    template: "%s | SOC Event Lookup"
  },
  description: "Structured Windows Security and Sysmon event ID reference for SOC analysts.",
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
            <Link href="/" className="shrink-0 text-lg font-semibold tracking-normal text-ink">
              SOC Event Lookup
            </Link>
            <HeaderSearch />
            <nav className="flex flex-wrap items-center gap-1 text-sm text-steel lg:ml-auto">
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
