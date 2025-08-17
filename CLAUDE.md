# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SUAD CBMERJ (Sistema Unificado de Acompanhamento de Despesas) is a financial control and tracking system for the Brazilian Military Fire Department. It manages budget credits, expenses tracking, account reporting (prestação de contas), and provides comprehensive tracking of SEI processes, empenho notes, and banking orders.

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
- **Charts**: Recharts for data visualization

### Data Flow Pattern
1. Firebase Realtime Database stores all data
2. FirebaseService singleton (`/lib/firebase-service.ts`) handles all database operations
3. Custom hooks (`/hooks`) manage Firebase subscriptions and state
4. Components consume data via hooks
5. All mutations go through firebase-service.ts

### Key Architectural Decisions

1. **Firebase Integration**: All data operations go through `/lib/firebase-service.ts`. Never access Firebase directly from components. Firebase config is in `/firebase/config.ts`.

2. **Type Safety**: All data models are defined in `/types/index.ts`. Always use these types when working with:
   - `Credito` - Budget credits with multiple eixos support
   - `Despesa` - Independent expense entities with multiple funding sources
   - `FonteDeRecurso` - Links expenses to credits with transaction details (empenho, payment)
   - `PrestacaoContas` - Auto-generated account reports with 4-month cycles
   - `MetaAcao` - Goals/actions
   - `FechamentoAnual` - Annual closures

3. **Component Structure**:
   - `/components/ui/` - Base UI components (Card, Badge, Dialog, Tabs)
   - `/components/forms/` - Form components with validation
   - `/components/dashboard/` - Dashboard-specific features
   - `/components/charts/` - Recharts-based visualizations
   - `/components/prestacao-contas/` - Account reporting components
   - `/components/layout/` - Layout components (Navbar)

4. **Routing**: File-based routing in `/app` directory:
   - `/` - Dashboard with overview metrics
   - `/creditos` - Credits listing and management
   - `/creditos/[id]` - Credit detail pages
   - `/rastreamento` - SEI process and financial tracking
   - `/relatorios` - Reports page
   - `/configuracoes` - Settings page

### Firebase Structure

```javascript
{
  creditos: {
    [creditoId]: {
      id: string,
      creditoCodigo: string,
      valorGlobal: number,
      anoExercicio: number,
      eixos: string[],  // Multiple axes support (VPS, ECV, etc.)
      origem: OrigemCredito,  // Traceability for credit origin
      natureza: string,
      dataLancamento: string  // Triggers account reporting
    }
  },
  despesas: {
    [despesaId]: {
      id: string,
      processoSEI: string,
      objeto: string,
      valorTotal: number,
      status: 'Planejado' | 'Empenhado' | 'Liquidado' | 'Pago' | 'Cancelado',
      fontesDeRecurso: [
        {
          id: string,
          creditoId: string,
          valorUtilizado: number,
          notaEmpenho?: string,
          dataEmpenho?: string,
          ordemBancaria?: string,
          dataPagamento?: string
        }
      ],
      metaAssociada: string,
      acaoAssociada: string
    }
  },
  prestacoesContas: {
    [prestacaoId]: {
      id: string,
      creditoId: string,
      ano: number,
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
   - Each `FonteDeRecurso` tracks individual transaction details (empenho, payment)
   - Balance validation happens across all linked credits
   - Dynamic calculation of available balance per credit

2. **Prestação de Contas Lifecycle**:
   - First obligation auto-generated on credit creation via `gerarPrimeiraObrigacao()`
   - New obligations created when previous is marked as delivered
   - 4-month reporting cycles
   - Automatic late status based on current date comparison

3. **Financial Calculations**:
   - `CreditoWithCalculations` includes computed fields (valorEmpenhado, valorPago, saldoDisponivel)
   - `DespesaWithCreditos` includes full credit objects for display
   - Dashboard aggregates values across all entities
   - Empenho status determined by presence of `notaEmpenho` in `FonteDeRecurso`
   - Payment status determined by presence of `ordemBancaria` in `FonteDeRecurso`

4. **Search and Tracking**:
   - `/rastreamento` page provides comprehensive search by:
     - SEI process number
     - Nota de Empenho
     - Ordem Bancária
     - Object description
     - Credit code

### Development Guidelines

1. **Adding New Features**:
   - Create types in `/types/index.ts` first
   - Add Firebase service methods in `/lib/firebase-service.ts`
   - Create custom hook in `/hooks/` for data management
   - Build UI components using existing patterns from `/components/`

2. **Working with Forms**:
   - Use existing form components from `/components/forms/`
   - Validate balances before expense operations
   - Handle loading and error states
   - Support multi-source funding in expense forms
   - Include transaction details (empenho, payment) in FonteDeRecurso

3. **Styling**:
   - Use Tailwind classes exclusively
   - Follow existing color scheme (primary colors defined in tailwind.config.ts)
   - Main container uses full width with 2rem padding
   - Use CVA (class-variance-authority) for component variants

4. **Path Imports**:
   - Use `@/` alias for imports from root
   - Example: `import { Credito } from '@/types'`

5. **Error Handling**:
   - Use `FirebaseServiceError` for service-level errors
   - Display user-friendly error messages
   - Handle loading states in all async operations
   - Validate required fields before operations

6. **Hook Patterns**:
   - `useFirebase()` - General Firebase data subscription
   - `useCreditos()` - Credit-specific operations
   - `useDespesas()` - Expense-specific operations
   - `usePrestacaoContas()` - Account reporting operations
   - All hooks handle real-time updates via Firebase listeners