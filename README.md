# InsurePlus — Enterprise Insurance Management Platform

A production-ready, dark-mode, glassmorphism insurance platform built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **React Hook Form + Zod**, and **Excel (SheetJS) as the database**.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The Excel database (`data/insurance.xlsx`) is created automatically with seed data on first run.

Production:

```bash
npm run build
npm run start
```

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom design system |
| Animation | Framer Motion + GSAP-ready |
| Forms | React Hook Form + Zod (`mode: onBlur`) |
| Database | Excel via `xlsx` (SheetJS), server-only, write-locked |

## Pages

1. **Home** (`/`) — hero, animated counters, floating cards, why-choose-us, categories, popular plans, testimonials, FAQ.
2. **Insurance Plans** (`/plans`) — filter by category/premium, search, sort, side-by-side compare.
3. **Policy Details** (`/policy/[id]`) — coverage, benefits, eligibility, T&Cs, documents, live premium calculator, brochure download, coverage comparison, FAQ.
4. **Claims Portal** (`/claims`) — submit a claim (RHF+Zod) and track it on a live status timeline (Submitted → Under Review → Approved / Rejected).
5. **Customer Dashboard** (`/dashboard`) — email login, profile, policies, renewals, payment history, claims, documents, notifications, charts.
6. **Contact Us** (`/contact`) — validated contact form with ticket generation.

Plus the **Buy Policy wizard** (`/buy/[id]`): Personal → Plan → Nominee → Premium → Payment → Success.

## Excel database

`data/insurance.xlsx` with six sheets: **Customers, Policies, Claims, Payments, Agents, Documents**. All reads/writes go through server route handlers in `src/app/api/*`, backed by `src/lib/excel.ts` (an in-process write-lock serialises writes so concurrent requests never corrupt the workbook).

## Payment (demo only)

Dummy card payment with Luhn-free format validation. **Test card:** `4111 1111 1111 1111`, expiry `12/30`, CVV `123`.
On success the platform generates a policy number (`POL-2026-00001`), a payment reference and a receipt. **Only the last 4 digits** are ever stored — never the full card number or CVV.

## Design system

- 1440px max-width container (`.container-1440`) used on every page for identical alignment.
- Dark banking palette, blue gradients, glassmorphism (`.glass`, `.glass-strong`), animated ambient backdrop.
- Reusable primitives in `src/components/ui` (Button, Card, Input, Select, Field, Accordion, Badge, Reveal, Counter).

## Notes

- Forms validate on blur and submit only — no validation before first interaction, no page reloads, no focus loss.
- `data/` is git-ignored-friendly; delete `data/insurance.xlsx` to regenerate fresh seed data.
