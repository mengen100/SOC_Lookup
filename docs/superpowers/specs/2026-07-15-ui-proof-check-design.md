# UI Proof Check And Polish

## Goal

Improve the existing SOC Event Lookup interface for balanced desktop presentation and reliable mobile scanning without changing routes, data contracts, or search behavior.

## Scope

- Recompose the homepage hero so the search area and coverage metrics share a clear alignment line.
- Use the wide-screen space beside the primary lookup flow for a compact list of common investigations linked to existing event guides.
- Keep the header readable at narrow widths with a stable brand lockup, full-width search control, and predictable navigation wrapping.
- Keep the global footer at the bottom of short pages without adding artificial height to individual tools.
- Make empty and incomplete-search states truthful instead of rendering an empty result panel.
- Add resilient wrapping and focus-visible treatment to repeated cards, navigation, and controls.
- Verify representative homepage, collection, event-detail, and tool surfaces at desktop and mobile viewport sizes.

## Non-goals

- No new routes, data fields, dependencies, or localization work.
- No changes to event content or SEO metadata beyond correcting user-facing search guidance.

## Acceptance checks

- The desktop homepage has no visually misaligned hero panel.
- Common-investigation links use existing event routes and do not claim popularity without analytics evidence.
- The footer reaches the bottom of a 900px-tall viewport on short tool pages.
- Mobile screenshots show no horizontal overflow, clipped controls, or wrapped brand text.
- Search results do not claim results when only incomplete records match.
- Long labels and event names remain readable without pushing adjacent controls out of bounds.
- `npm test`, `npm run typecheck`, and `npm run build` pass.
