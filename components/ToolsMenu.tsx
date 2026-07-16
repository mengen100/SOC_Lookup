"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const tools = [
  { href: "/tools/timestamp-converter/", title: "Timestamp Converter", description: "Unix, FileTime, and ISO 8601" },
  { href: "/tools/sigma-converter/", title: "Sigma Converter", description: "Simple Sigma to KQL or SPL" },
  { href: "/tools/cvss-calculator/", title: "CVSS Calculator", description: "CVSS 3.1 base scores" },
];

const menuItemHrefs = [...tools.map((tool) => tool.href), "/tools/"];

export function ToolsMenu() {
  const pathname = usePathname();
  const isActive = Boolean(pathname?.startsWith("/tools/"));
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
  }, [isOpen]);

  const focusItemAt = (index: number) => {
    const count = menuItemHrefs.length;
    const nextIndex = ((index % count) + count) % count;
    itemRefs.current[nextIndex]?.focus();
  };

  const openMenu = (focusIndex: number) => {
    setIsOpen(true);
    requestAnimationFrame(() => focusItemAt(focusIndex));
  };

  const handleButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === " " || event.key === "Enter") {
      event.preventDefault();
      openMenu(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(menuItemHrefs.length - 1);
    }
  };

  const handleItemKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItemAt(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItemAt(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItemAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItemAt(menuItemHrefs.length - 1);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-current={isActive ? "page" : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={
          isActive
            ? "rounded border border-line bg-white px-2.5 py-1.5 font-semibold text-ink"
            : "rounded border border-transparent px-2.5 py-1.5 text-steel hover:border-line hover:bg-white"
        }
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleButtonKeyDown}
        ref={buttonRef}
        type="button"
      >
        Tools
      </button>
      {isOpen ? (
        <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded border border-line bg-white shadow-lg" role="menu">
          {tools.map((tool, index) => (
            <Link
              className="block border-b border-line px-4 py-3 hover:bg-panel focus-visible:bg-panel"
              href={tool.href}
              key={tool.href}
              onClick={() => setIsOpen(false)}
              onKeyDown={(event) => handleItemKeyDown(event, index)}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              role="menuitem"
            >
              <span className="block font-semibold text-ink">{tool.title}</span>
              <span className="mt-0.5 block text-xs text-steel">{tool.description}</span>
            </Link>
          ))}
          <Link
            className="block px-4 py-3 font-semibold text-accent hover:bg-panel focus-visible:bg-panel"
            href="/tools/"
            onClick={() => setIsOpen(false)}
            onKeyDown={(event) => handleItemKeyDown(event, tools.length)}
            ref={(node) => {
              itemRefs.current[tools.length] = node;
            }}
            role="menuitem"
          >
            All tools
          </Link>
        </div>
      ) : null}
    </div>
  );
}
