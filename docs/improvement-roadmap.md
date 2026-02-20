# Improvement Roadmap

## Implemented in this pass

1. CI quality gate for build, internal link checks, and smoke tests.
2. Route smoke tests for critical EN/FR pages and /go endpoints.
3. FR localization pass for responsible gambling page.
4. Header/menu accessibility improvements (ARIA labels and expanded state).
5. Shared affiliate card component for consistent outbound CTA behavior.
6. Article JSON-LD for EN/FR post pages.
7. Content lint script (non-strict by default).
8. Outbound observability hooks on /go pages (custom event + optional plausible call).
9. Last-reviewed workflow support:
   - Last reviewed timestamp displayed on post pages.
   - Stale content report script to flag old posts.

## Recommended next steps

1. Calibrate `content-lint` rules with current editorial baseline and move to strict mode in CI.
2. Add a dedicated accessibility audit step (axe/playwright) to CI.
3. Add unit checks for structured data validity (required fields per schema type).
4. Add per-page performance budget checks for Core Web Vitals-sensitive templates.
5. Add an editorial checklist template for new posts (disclaimer, metadata, links, review date).
