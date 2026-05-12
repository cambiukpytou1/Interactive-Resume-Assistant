# Source Precedence

1. Latest enterprise-AI-styled resume
2. Client-facing RSM resume screenshots (public-safe enrichment)
3. Direct user-provided seed knowledge
4. Interactive resume PRD for product scope and guardrails
5. Older legacy resume for historical detail
6. Claude-generated seed as lowest-trust reference

## Operational Rule
If newer, more authoritative content conflicts with older material, prefer the higher-ranked source and move the lower-ranked detail into staging or `needs-confirmation.json`.
