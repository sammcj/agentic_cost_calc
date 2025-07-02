# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development
- `pnpm dev` - Start both client (port 3000) and server (port 3001) in development mode
- `pnpm dev:client` - Start only the client (Vite dev server)
- `pnpm dev:server` - Start only the server (Express with TypeScript)

### Building
- `pnpm build` - Build both client and server for production
- `pnpm build:server` - Build only the server

### Testing & Quality
- `pnpm test` - Run Jest tests
- `pnpm lint` - Run ESLint with auto-fix

### Package Management
- Uses `pnpm` as package manager (configured in package.json)
- `pnpm i` - Install dependencies

## Architecture

This is a full-stack TypeScript application for calculating AI/LLM development costs:

### Client-Side (React + Vite)
- **Location**: `src/client/`
- **Entry Point**: `src/client/main.tsx`
- **Build Output**: `dist/`
- **Dev Server**: Port 3000 with API proxy to port 3001

### Server-Side (Express + TypeScript)
- **Location**: `src/server/`
- **Entry Point**: `src/server/index.ts`
- **API Routes**: `src/server/routes/api.ts`
- **Dev Server**: Port 3001

### Shared Code
- **Location**: `src/shared/`
- **Types**: `src/shared/types/models.ts` - Core data structures
- **Calculations**: `src/shared/utils/calculations.ts` - Main calculation engine
- **Model Config**: `src/shared/utils/modelConfig.ts` - LLM model profiles and pricing
- **Templates**: `src/shared/utils/projectTemplates.ts` - Pre-configured project settings

## Key Components

### Calculation Engine (`src/shared/utils/calculations.ts`)
The core `calculateCosts` function that processes:
- Project parameters (hours, rates, token usage)
- Model configurations (pricing, capabilities)
- Global settings (currency rates, multipliers)
- Returns comprehensive cost analysis and savings projections

### Form Management (`src/client/hooks/useCalculatorForm.ts`)
Central hook managing:
- Form state and validation
- API calls to calculation endpoint
- Error handling and loading states
- Result caching

### UI Modes
- **Wizard Mode**: Step-by-step guided interface (default)
- **Advanced Mode**: Single-page form for power users
- Toggle between modes preserved in localStorage

### Data Flow
1. User inputs → Form state → Validation
2. Valid data → API call (`/api/calculate`)
3. Server validation (Zod schemas) → Calculation engine
4. Results → Client state → UI display (charts, summaries, export)

## TypeScript Configuration

- **Main**: `tsconfig.json` - Client-side config
- **Server**: `tsconfig.server.json` - Server-side config
- **Node**: `tsconfig.node.json` - Build tools config
- **Path Aliases**: `@/*` maps to `src/*`

## Testing

- **Framework**: Jest with jsdom environment
- **Setup**: `src/setupTests.ts`
- **Location**: Co-located `__tests__/` directories
- **Testing Library**: React Testing Library for components

## Key Data Structures

All defined in `src/shared/types/models.ts`:
- `CalculationFormState` - Complete form input state
- `CalculationResult` - API response with costs, savings, projections
- `ModelProfile` - LLM pricing and capability data
- `ProjectTemplate` - Pre-configured project settings

## Important Notes

- **Monorepo Structure**: Client and server in same repo with shared code
- **Proxy Setup**: Client dev server proxies `/api` to server
- **Currency Support**: USD/AUD with configurable exchange rates
- **Persistent State**: Form progress saved to localStorage (wizard mode)
- **Export Features**: PDF and JSON export of calculation results