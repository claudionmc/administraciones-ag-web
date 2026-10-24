# Administraciones AG SpA — Agent Instructions

## Project
Build a premium, institutional corporate website for Administraciones AG SpA,
a Chilean firm focused on tax, personal financial and patrimonial analysis
services for individuals and investors. The corporate motto is
"Pasión por la excelencia." The website language is Spanish (Chile),
using formal address (usted). Do not fabricate company history, credentials,
team members, performance figures, testimonials or regulatory approvals.

## Technology
- Next.js with App Router, TypeScript in strict mode and Tailwind CSS.
- Use responsive, accessible, semantic HTML and reusable components.
- Prefer server components; use client components only when necessary.
- Keep dependencies minimal and maintained.
- Use npm and document commands in README.md.
- Do not introduce a Python backend or database without an actual need.
- Do not publish or deploy without explicit user approval.

## Visual identity
- Style: exclusive, institutional, sober, minimalist; inspired by private
  banking and professional advisory firms, not flashy fintech marketing.
- Typeface: Inter. Prefer weights 400, 500 and 600.
- Primary palette, in order:
  #05132A, #0B2859, #10408D, #195AB4, #307AE0,
  #549CFE, #6BAAFF, #87BAFF, #B1D2FF, #D2E5FF.
- Secondary palette, in order:
  #373737, #484848, #626262, #808080, #909090,
  #9A9A9A, #B2B2B2, #CACACA, #E5E5E5, #F2F2F2, #FFFFFF.
- Main logo: original geometry, solid #05132A on white.
- Reversed logo: original geometry, white on #05132A.
- Never redraw or distort the logo; use supplied original logo assets.
- Header: white background with navy logo.
- Hero: #05132A background with white text.
- Primary buttons/links: #10408D, subject to accessible contrast.
- Avoid gradients, orange/copper accents, excessive motion, generic
  stock-photo cliches, exaggerated claims and decorative clutter.
- Do not assume final logo assets are already in the repository.

## Information architecture
- Home (/)
- Services (/servicios) with three areas and detail pages as appropriate
- Our Firm (/nuestra-firma)
- Perspectives (/perspectivas): optional later phase; do not invent articles
- Contact (/contacto)
- Navigation, footer and service calls-to-action should be consistent.
- Contact options: online and in-person by prior coordination.
- Do not invent phone numbers, addresses, emails or office locations.

## Approved service catalogue
### Tax advisory / Asesoría tributaria
1. Declaración y revisión de impuestos.
2. Planificación tributaria personal.
3. Tributación inmobiliaria.
4. Tributación de inversiones y ganancias de capital.

### Financial planning / Planificación financiera
5. Diagnóstico financiero personal.
6. Presupuesto y planificación de flujos de caja.
7. Planificación de objetivos financieros.
8. Análisis de endeudamiento y financiamiento, for the client's own
   financial understanding and planning only.

### Patrimonial planning and analysis
9. Diagnóstico patrimonial.
10. Estructura y evolución del patrimonio.
11. Análisis financiero descriptivo de cartera existente.
12. Seguimiento y reportes patrimoniales.

## Regulatory guardrails — Chile
The company currently does NOT have CMF authorization to provide regulated
investment advice. Do not market personalized investment recommendations,
buy/sell/hold advice, discretionary portfolio management, or evaluations
of the suitability of specific investments for clients.
Portfolio analytics must remain objective and descriptive, not prescriptive.
Do not imply that disclaimers alone resolve regulated-activity issues.
Do not market credit scoring, certifications of repayment capacity or
creditworthiness reports to lenders, or assessments provided to third parties
for obtaining, changing or renegotiating credit. Financial planning and
loan-cost comparisons for a client's own use may be described cautiously.
Flag borderline activities for Chilean legal/regulatory review before launch.
Do not claim CMF registration, authorization or supervision.

## Homepage sections
1. Institutional hero with corporate identity, value proposition and CTA.
2. Three service areas.
3. Philosophy with the motto "Pasión por la excelencia."
4. Four-stage advisory process: understand, diagnose, propose, deliver/follow up.
5. Contact CTA, with online and in-person options.

## Content and quality
- Clear, precise, professional Chilean Spanish; use "usted" consistently.
- Avoid promises of guaranteed outcomes, returns or tax savings.
- Do not invent business facts, qualifications, licenses or client results.
- SEO: useful titles, metadata, descriptions and Open Graph metadata.
- Accessibility: keyboard navigation, visible focus, alt text, semantic
  landmarks, appropriate contrast and responsive layouts.
- Performance: optimize assets, use Next.js image/font tooling where suitable.
- Privacy: do not collect or transmit personal data without an approved
  privacy notice and secure backend/integration. A form may initially be UI-only
  and must clearly indicate that submission is not yet enabled.
- Never commit secrets, API keys or personal client data.
- After code changes, run relevant lint, type checks and build, report results.
- Keep README.md updated with setup and development instructions.

## Workflow
- Inspect existing files before changing them.
- Make focused, reversible changes and explain major architecture decisions.
- Request approval before adding significant dependencies, services,
  authentication, databases or deployment infrastructure.
- Preserve the original logo proportions and approved design tokens.
- First milestone: scaffold and implement a responsive homepage locally.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
