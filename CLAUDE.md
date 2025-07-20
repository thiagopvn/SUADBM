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
2. Custom hooks (`/hooks`) handle Firebase subscriptions and state
3. Components consume data via hooks
4. All mutations go through firebase-service.ts

### Key Architectural Decisions

1. **Firebase Integration**: All data operations go through `/lib/firebase-service.ts`. Never access Firebase directly from components.

2. **Type Safety**: All data models are defined in `/types/index.ts`. Always use these types when working with:
   - Credito (budget credits)
   - Despesa (expenses)
   - PrestacaoContas (account reports)
   - MetaAcao (goals/actions)
   - FechamentoAnual (annual closures)

3. **Component Structure**:
   - `/components/ui/` - Base UI components (Card, Badge, etc.)
   - `/components/forms/` - Form components with validation
   - `/components/dashboard/` - Dashboard-specific features
   - `/components/charts/` - Recharts-based visualizations
   - `/components/prestacao-contas/` - Account reporting components

4. **Routing**: File-based routing in `/app` directory:
   - `/` - Dashboard with overview metrics
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
      dataLancamento: string,
      despesas: {
        [despesaId]: {
          processoSEI: string,
          objeto: string,
          valorTotal: number,
          status: string,
          metaAssociada: string,
          acaoAssociada: string
          // ... other fields
        }
      }
    }
  },
  prestacoesContas: {
    [prestacaoId]: {
      creditoId: string,
      ano: number,
      periodoLabel: string,
      prazoFinal: string,
      status: 'Pendente' | 'Em Atraso' | 'Entregue',
      despesasVinculadas: string[]
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

### Development Guidelines

1. **Adding New Features**:
   - Create types in `/types/index.ts` first
   - Add Firebase service methods in `/lib/firebase-service.ts`
   - Create custom hook in `/hooks/` for data management
   - Build UI components using existing patterns

2. **Working with Forms**:
   - Use existing form components from `/components/forms/`
   - Always validate data before Firebase operations
   - Handle loading and error states

3. **Styling**:
   - Use Tailwind classes exclusively
   - Follow existing color scheme (primary colors defined in tailwind.config.ts)
   - Use CSS variables for dynamic theming

4. **Path Imports**:
   - Use `@/` alias for imports from root
   - Example: `import { Credito } from '@/types'`