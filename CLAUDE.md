# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SICOF (Sistema Integrado de Controle Orçamentário e Financeiro) is a budget and financial control system for CBMERJ (Corpo de Bombeiros Militar do Estado do Rio de Janeiro). The system manages the complete lifecycle of public budget allocations, from initial credit decentralization through payment and accountability.

## Commands

```bash
# Development
npm run dev       # Start development server on http://localhost:3000

# Production
npm run build     # Create production build
npm run start     # Start production server

# Code Quality
npm run lint      # Run ESLint checks
```

## Architecture

### Core Business Concepts

1. **Crédito (Budget Credit)**: Initial budget allocation with properties:
   - `creditoCodigo`: Unique identifier (e.g., "2019DC00005")
   - `anoExercicio`: Fiscal year
   - `valorGlobal`: Total allocated amount
   - `acaoEixo`: Budget action/axis category
   - `natureza`: Expense nature code

2. **Despesa (Expense)**: Individual expense within a credit following the public spending lifecycle:
   - **Empenho** (Commitment): Budget reservation (`notaEmpenho`, `dataEmpenho`)
   - **Liquidação** (Verification): Service/product delivery confirmation
   - **Pagamento** (Payment): Actual payment (`ordemBancaria`, `dataPagamento`)
   - **Prestação de Contas** (Accountability): Documentation and justification

3. **Fiscal Year Management**: 
   - Budget credits are strictly tied to fiscal years
   - Year-end balances cannot be automatically carried forward
   - Remaining balances must be returned to central fund and redistributed

### Technical Architecture

The project is split across two directories (needs consolidation):
- `/root/projetos/SUAD/` - Contains the main application code
- `/root/projetos/SUAD/sicof-cbmerj/` - Contains Firebase config and package files

Key architectural decisions:
- **Client Components**: Using "use client" directive for interactive features
- **Mock Data**: Currently using `mockData.ts` instead of live Firebase
- **Component Structure**: Atomic design with ui/, layout/, dashboard/, and charts/ components
- **Styling**: Tailwind CSS with custom color schemes and CVA for component variants
- **State Management**: React hooks (useState, useEffect) for local state

### Data Flow

1. Dashboard aggregates data from all credits to show:
   - Total global values, spent amounts, and available balances
   - Charts showing evolution by year and distribution by action/axis
   - Recent expenses across all credits

2. Credit Management provides:
   - Filterable list of all budget credits
   - Detailed view of individual credit with all associated expenses
   - Status tracking through the expense lifecycle

## Firebase Integration

Currently configured but not actively used. The system is prepared for:
- **Realtime Database**: For live data synchronization
- **Authentication**: User access control (not implemented)
- **Analytics**: Usage tracking (implemented with SSR safety checks)

Firebase credentials are stored in:
- `/sicof-cbmerj/firebase/config.ts` (hardcoded)
- `/sicof-cbmerj/.env.local` (environment variables)

## Key Files and Their Purposes

- `app/page.tsx`: Dashboard with summary cards and charts
- `app/creditos/page.tsx`: Credit list with search/filter capabilities  
- `app/creditos/[id]/page.tsx`: Detailed credit view with expense table
- `lib/utils.ts`: Currency formatting, date handling, status colors
- `firebase/mockData.ts`: Sample data structure matching Firebase schema

## Development Notes

- The project uses Next.js 15 with App Router
- TypeScript is configured for type safety with strict mode enabled
- ESLint is configured with Next.js recommended rules
- Recharts is used for data visualization
- All currency values are in Brazilian Reais (BRL)
- Date formats follow Brazilian convention (DD/MM/YYYY)
- Status workflow: Planejado → Empenhado → Liquidado → Pago
- All integration and typing errors have been resolved
- The project builds successfully without warnings or errors