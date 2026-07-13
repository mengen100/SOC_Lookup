"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const tools = [
  { href: "/tools/timestamp-converter/", title: "Timestamp Converter", description: "Unix, FileTime, and ISO 8601" },
  { href: "/tools/sigma-converter/", title: "Sigma Converter", description: "Simple Sigma to KQL or SPL" },
  { href: "/tools/cvss-calculator/", title: "CVSS Calculator", description: "CVSS 3.1 base scores" },
];

export function ToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="rounded border border-transparent px-2.5 py-1.5 hover:border-line hover:bg-white"
        onClick={() => setIsOpen((open) => !open)}
        ref={buttonRef}
        type="button"
      >
        Tools
      </button>
      {isOpen ? (
        <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded border border-line bg-white shadow-lg" role="menu">
          {tools.map((tool) => (
            <Link
              className="block border-b border-line px-4 py-3 hover:bg-panel"
              href={tool.href}
              key={tool.href}
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <span className="block font-semibold text-ink">{tool.title}</span>
              <span className="mt-0.5 block text-xs text-steel">{tool.description}</span>
            </Link>
          ))}
          <Link
            className="block px-4 py-3 font-semibold text-accent hover:bg-panel"
            href="/tools/"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            All tools
          </Link>
        </div>
      ) : null}
    </div>
  );
}
