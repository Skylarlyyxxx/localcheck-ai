# LocalCheck AI

An automated, market-specific localization readiness audit for ecommerce websites.

**[Live Demo](https://localcheck-ai.vercel.app/)** · **[Product Case Study (中文)](docs/product-case-study.md)**

## Problem

When an ecommerce store enters a new market, familiar signals such as local currency, payment methods, language, trust content, and policy links can be easy to miss. Those gaps can create friction before a shopper reaches checkout.

## Solution

**URL + Target Market → Automated Audit → Rule-based Score + Optional LLM Review → Localization Report**

LocalCheck AI scans the public homepage of a store, detects transparent rule-based signals, and turns them into an explainable localization report.

## Core Features

- Market-specific audit for the United States, Germany, and Japan
- Localization Score across six dimensions
- Evidence-first diagnosis with detected and missing signals
- Prioritized recommendations and positive practices
- Optional LLM language and cultural-readiness review
- Homepage-only scope notice
- Demo fallback when a website cannot be accessed

## Localization Framework

LocalCheck evaluates six homepage signal areas:

- Currency
- Payment
- Trust
- SEO
- Legal & Policy Signals
- Language & Cultural Readiness

The MVP combines deterministic website signal detection with a transparent scoring framework.

When Cloudflare Workers AI credentials are configured, a separate optional semantic-review layer can add bounded language and cultural-readiness observations using an open-weight Llama model. It does not change the deterministic six-dimension score, and the report falls back safely if the service is unavailable.

The rules are intentionally conservative: a detected keyword is treated as a homepage signal, not proof that a payment method works or that a store is compliant.

## Product Flow

**URL → Homepage Scan → Signal Detection → Market Rules → Scoring → Report**

## MVP Scope

The current MVP evaluates signals available on the public homepage only. Dynamically loaded content, checkout flows, and product pages may not be included.

## Tech Stack

- Next.js
- TypeScript
- Cheerio
- Tailwind CSS
- Cloudflare Workers AI (optional Llama semantic review)

## Optional LLM Setup

The application runs fully without an LLM key. To enable the optional server-side semantic review, create a Cloudflare Workers AI API token and add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_AI_TOKEN` to `.env.local` for local development or to Vercel Project Settings → Environment Variables for production. Never commit these credentials. Cloudflare's free plan has a daily usage allocation; if it is unavailable or exhausted, LocalCheck returns the deterministic report instead.

## Quality Checks

The rule engine is covered by fixed HTML fixtures for the US, Germany, and Japan. Run the checks locally with:

```bash
npm run test
npm run lint
npm run build
```

GitHub Actions runs the same checks for pushes and pull requests to `main`.

## Future Roadmap

- Cultural image analysis
- Multi-page audits
- Competitor benchmarking
- Continuous monitoring

## Disclaimer

LocalCheck provides localization guidance only and does not constitute legal advice.
