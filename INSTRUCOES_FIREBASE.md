# Instruções para Configurar o Firebase Database

## ⚠️ Problema Identificado

O erro `PERMISSION_DENIED` ocorre porque as regras do Firebase Realtime Database no console não permitem leitura/escrita.

## 🔧 Solução: Atualizar Regras no Console do Firebase

### Passo 1: Acessar o Console do Firebase

1. Abra https://console.firebase.google.com/
2. Selecione o projeto **suad-44036**
3. No menu lateral, clique em **Realtime Database**
4. Vá para a aba **Rules** (Regras)

### Passo 2: Atualizar as Regras

Substitua as regras atuais por:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "creditos": {
      ".indexOn": ["anoExercicio", "acaoEixo", "creditoCodigo"],
      "$creditoId": {
        "despesas": {
          ".indexOn": ["status", "dataEmpenho", "dataPagamento"]
        }
      }
    }
  }
}
```

**⚠️ IMPORTANTE:** Estas regras permitem acesso total (leitura e escrita) sem autenticação. São adequadas APENAS para desenvolvimento. Para produção, implemente regras de segurança adequadas.

### Passo 3: Publicar as Regras

1. Clique no botão **Publish** (Publicar)
2. Aguarde a confirmação de que as regras foram aplicadas

## ✅ Após Atualizar as Regras

1. Acesse http://localhost:3000/configuracoes
2. Role até a seção **"Importar Dados de Teste"**
3. Clique no botão **"Importar Dados de Teste"**
4. Os dados serão importados com sucesso!

## 📊 Dados de Teste Incluídos

- **3 Créditos** (Descentralizações)
  - 2025-001-VPS (R$ 500.000)
  - 2025-002-ECV (R$ 750.000)
  - 2025-003-VPS (R$ 300.000)

- **3 Despesas**
  - Aquisição de equipamentos (Empenhado)
  - Manutenção de viaturas (Pago)
  - Treinamento de bombeiros (Planejado)

- **2 Prestações de Contas** (Pendentes)
- **5 Metas/Ações**

## 🔒 Regras de Segurança para Produção (Exemplo)

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null && auth.token.admin === true",
    "creditos": {
      ".indexOn": ["anoExercicio", "acaoEixo", "creditoCodigo"],
      "$creditoId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.token.admin === true"
      }
    }
  }
}
```

## 📝 Notas Adicionais

- As regras em `database.rules.json` no projeto são apenas um template
- As regras efetivas são as configuradas no console do Firebase
- Para deploy automático de regras, use Firebase CLI: `firebase deploy --only database:rules`
