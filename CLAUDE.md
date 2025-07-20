# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SICOF (Sistema Integrado de Controle Orçamentário e Financeiro) is a budgetary and financial control system for CBMERJ (Brazilian Military Fire Department). It manages budget credits, expenses, goals, and annual closures.

## Essential Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Build & Production
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Data Import (development only)
node scripts/importData.js  # Import mock data to Firebase (requires admin SDK)
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router (React 19)
- **Language**: TypeScript with strict mode
- **Database**: Firebase Realtime Database
- **Styling**: Tailwind CSS with custom theme
- **State**: React hooks + Firebase real-time sync

### Data Flow Pattern
1. Firebase Realtime Database stores all data
2. FirebaseService singleton handles all database operations
3. Custom hooks (`/hooks`) manage Firebase subscriptions and state
4. Components consume data via hooks
5. All mutations go through firebase-service.ts

### Key Architectural Decisions

1. **Firebase Integration**: All data operations go through `/lib/firebase-service.ts`. Never access Firebase directly from components.

2. **Type Safety**: All data models are defined in `/types/index.ts`. Always use these types when working with:
   - Credito (budget credits)
   - Despesa (expenses) - Now independent entities with multiple funding sources
   - PrestacaoContas (account reports) - Auto-generated with 4-month cycles
   - MetaAcao (goals/actions)
   - FechamentoAnual (annual closures)
   - FonteDeRecurso (funding sources) - Links expenses to credits

3. **Component Structure**:
   - `/components/ui/` - Base UI components (Card, Badge, etc.)
   - `/components/forms/` - Form components with validation
   - `/components/dashboard/` - Dashboard-specific features
   - `/components/charts/` - Recharts-based visualizations
   - `/components/prestacao-contas/` - Account reporting components

4. **Routing**: File-based routing in `/app` directory:
   - `/` - Dashboard with overview metrics
   - `/creditos` - Credits listing page
   - `/creditos/[id]` - Credit detail pages
   - `/relatorios` - Reports page
   - `/configuracoes` - Settings page

### Firebase Structure

```javascript
{
  creditos: {
    [creditoId]: {
      creditoCodigo: string,
      valorGlobal: number,
      anoExercicio: number,
      origem: 'Ano vigente' | 'Anos anteriores',
      dataLancamento: string,
      // No longer contains nested despesas
    }
  },
  despesas: {
    [despesaId]: {
      processoSEI: string,
      objeto: string,
      valorTotal: number,
      status: 'Planejado' | 'Empenhado' | 'Liquidado' | 'Pago',
      fontesDeRecurso: [
        {
          creditoId: string,
          valor: number
        }
      ],
      metaAssociada: string,
      acaoAssociada: string,
      // ... other fields
    }
  },
  prestacoesContas: {
    [prestacaoId]: {
      creditoId: string,
      ano: number,
      numeroObrigacao: number,
      periodoLabel: string,
      prazoFinal: string,
      status: 'Pendente' | 'Em Atraso' | 'Entregue',
      despesasVinculadas: string[],
      processoSEI?: string,
      dataEntrega?: string
    }
  },
  metasAcoes: {
    [metaId]: { descricao: string }
  },
  fechamentosAnuais: {
    [fechamentoId]: {
      totalDevolvido: number,
      dataFechamento: string,
      usuarioResponsavel: string
    }
  }
}
```

### Critical Implementation Details

1. **Expense-Credit Relationship**:
   - Expenses can be funded by multiple credits through `fontesDeRecurso`
   - Balance validation happens across all linked credits
   - Dynamic calculation of available balance per credit

2. **Prestação de Contas Lifecycle**:
   - First obligation auto-generated on credit creation
   - New obligations created when previous is marked as delivered
   - 4-month reporting cycles
   - Automatic late status based on current date

3. **Financial Calculations**:
   - `CreditoWithCalculations` includes computed fields (valorUtilizado, valorDisponivel)
   - `DespesaWithCreditos` includes full credit objects for display
   - Dashboard aggregates values across all entities

### Development Guidelines

1. **Adding New Features**:
   - Create types in `/types/index.ts` first
   - Add Firebase service methods in `/lib/firebase-service.ts`
   - Create custom hook in `/hooks/` for data management
   - Build UI components using existing patterns

2. **Working with Forms**:
   - Use existing form components from `/components/forms/`
   - Validate balances before expense operations
   - Handle loading and error states
   - Support multi-source funding in expense forms

3. **Styling**:
   - Use Tailwind classes exclusively
   - Follow existing color scheme (primary colors defined in tailwind.config.ts)
   - Main container uses full width with 2rem padding

4. **Path Imports**:
   - Use `@/` alias for imports from root
   - Example: `import { Credito } from '@/types'`

5. **Error Handling**:
   - Use FirebaseServiceError for service-level errors
   - Display user-friendly error messages
   - Handle loading states in all async operations