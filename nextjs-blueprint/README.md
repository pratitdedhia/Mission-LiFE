# Next.js 15 App Router Architecture Blueprint (Roadmap)

> [!NOTE]
> **Status:** Architectural Reference / Future Production Roadmap.
> This directory contains the planned SSR & Server Actions migration architecture for **Mission LiFE**.
> It is **not** active code in the current Vite + React 19 production bundle.

## Architecture Blueprint Overview

This blueprint documents the target state for migrating the client-side SPA to a hybrid Next.js 15 (App Router) deployment:

- **Server-Side Rendering (SSR):** Fast initial paint for public landing and citizen dashboards with localized Gujarat DISCOM baselines.
- **Server Actions:** Moving client-side calculation triggers to server-side mutations with built-in CSRF protection.
- **Route Handlers (`/api/*`):** Direct serverless API handlers for IoT hardware telemetry and webhooks, augmenting the FastAPI microservice.
- **Zero-Client Secrets:** Firebase Admin SDK initialization confined strictly to server components and actions.

