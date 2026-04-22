# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Warning: Next.js Breaking Changes

This project uses **Next.js 16** — APIs, conventions, and file structure differ from older versions in your training data. Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices. Also refer to context7 mcp to fetch new docs.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture

Next.js 16 App Router project with React 19 and TypeScript 5. Styling via Tailwind CSS v4.

Use server side components whenever possible.

**Key directories:**
- `app/` — App Router pages and layouts (file-based routing)
- `lib/components/` — Reusable React components
- `lib/hooks/` — Custom React hooks
- `lib/models/` — TypeScript data models/types
- `lib/utils/` — Utility functions
- `lib/constants/` — App-wide constants

**Path alias:** `@/*` resolves to the project root.

## Context

This is the frontend client for the `maichess` project — a chess platform built as a microservices architecture. The parent project's `maichess-api-contracts/` repo defines all service interfaces (gRPC proto files and REST specs). When implementing API integration, refer to those contracts rather than inferring from other service implementations.

## Code Style

- Keep functions concise and readable
- Any behaviour in components should be abstracted away behind a specialized hook for the component. Avoid code duplication by composing hooks with shared code
- If functions in hooks get too long create util files.
