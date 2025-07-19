# SICOF - Sistema Integrado de Controle Orçamentário e Financeiro

Sistema desenvolvido para a Coordenadoria de Controle da Superintendência Administrativa do Corpo de Bombeiros Militar do Estado do Rio de Janeiro (CBMERJ).

## Funcionalidades

- **Dashboard Principal**: Visão consolidada de todos os exercícios com cards informativos e gráficos
- **Gestão de Créditos**: Listagem e gerenciamento de descentralizações de crédito
- **Detalhes de Crédito**: Visualização detalhada de cada crédito com suas despesas associadas
- **Controle de Despesas**: Acompanhamento do ciclo completo (empenho, liquidação, pagamento, prestação de contas)

## Tecnologias Utilizadas

- **Frontend**: Next.js 15 com TypeScript
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **Banco de Dados**: Firebase Realtime Database
- **Autenticação**: Firebase Authentication

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=sua-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-auth-domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=sua-database-url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=seu-app-id
```

4. Execute o projeto:
```bash
npm run dev
```

## Estrutura do Projeto

```
/app                # Páginas da aplicação
/components         # Componentes reutilizáveis
  /ui              # Componentes de UI (Card, Badge, etc)
  /layout          # Componentes de layout (Navbar)
  /dashboard       # Componentes do dashboard
  /charts          # Componentes de gráficos
/firebase          # Configuração e mock data do Firebase
/lib               # Utilitários e funções auxiliares
```

## Próximas Implementações (Fase 2)

- Formulários para adicionar/editar créditos e despesas
- Integração completa com Firebase Realtime Database
- Sistema de autenticação e controle de acesso
- Funcionalidade de fechamento de exercício
- Relatórios com exportação para CSV/Excel