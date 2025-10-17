# ⚡ Configuração Rápida do Sistema

Siga estes passos para deixar o sistema totalmente funcional:

## 📋 Checklist

- [ ] 1. Configurar Firebase Database Rules
- [ ] 2. Configurar Firebase Authentication
- [ ] 3. Importar dados de teste
- [ ] 4. Fazer redeploy no Vercel

---

## 1️⃣ Configurar Firebase Database Rules (2 minutos)

### Link Direto:
🔗 https://console.firebase.google.com/project/suad-44036/database/suad-44036-default-rtdb/rules

### Passos:
1. Clique no link acima
2. Clique na aba **"Rules"**
3. Copie e cole este código:

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

4. Clique em **"Publish"** (Publicar)
5. ✅ Pronto! O erro `PERMISSION_DENIED` será resolvido

---

## 2️⃣ Configurar Firebase Authentication (3 minutos)

### Link Direto:
🔗 https://console.firebase.google.com/project/suad-44036/authentication/providers

### Passos:
1. Clique em **"Get Started"** (se aparecer) ou **"Add provider"**
2. Selecione **"Email/Password"**
3. Ative a primeira opção **"Email/Password"**
4. Clique em **"Save"**

### Criar usuário de teste:
🔗 https://console.firebase.google.com/project/suad-44036/authentication/users

1. Clique em **"Add user"**
2. Preencha:
   - **Email:** admin@cbmerj.rj.gov.br
   - **Password:** admin123
3. Clique em **"Add user"**
4. ✅ Pronto! Agora você pode fazer login

---

## 3️⃣ Importar Dados de Teste (1 minuto)

### Após configurar as regras do Firebase:

1. **Localmente:**
   - Acesse: http://localhost:3000/configuracoes
   - Role até "Importar Dados de Teste"
   - Clique em **"Importar Dados de Teste"**

2. **Em produção (após redeploy):**
   - Acesse: https://suadbm.vercel.app/configuracoes
   - Role até "Importar Dados de Teste"
   - Clique em **"Importar Dados de Teste"**

### Dados que serão importados:
- ✅ 3 Créditos (Descentralizações)
- ✅ 3 Despesas com diferentes status
- ✅ 2 Prestações de Contas
- ✅ 5 Metas/Ações

---

## 4️⃣ Redeploy no Vercel (1 minuto)

### Opção A - Redeploy Automático:
O Vercel detectará o novo commit automaticamente e fará o deploy.

### Opção B - Redeploy Manual:
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **suadbm**
3. Vá em **"Deployments"**
4. Clique em **"Redeploy"** no último deployment

---

## 🎉 Verificação Final

Após completar todos os passos:

### ✅ Sistema Funcionando:
- Login funciona em https://suadbm.vercel.app/login
- Dashboard mostra dados em https://suadbm.vercel.app
- Sem erros de `PERMISSION_DENIED` no console
- Descentralizações aparecem na listagem

### 🔐 Credenciais de Acesso:
```
Email: admin@cbmerj.rj.gov.br
Senha: admin123
```

---

## 🆘 Problemas Comuns

### Erro: "PERMISSION_DENIED"
- ❌ As regras do Firebase não foram publicadas
- ✅ Siga o **Passo 1** novamente e clique em "Publish"

### Erro: "Email ou senha incorretos"
- ❌ O usuário demo não foi criado
- ✅ Siga o **Passo 2** novamente

### Dashboard vazio / sem dados
- ❌ Os dados de teste não foram importados
- ✅ Siga o **Passo 3** novamente

### Página de login não aparece em produção
- ❌ O redeploy não foi feito
- ✅ Siga o **Passo 4** novamente

---

## 📚 Documentação Completa

Para informações mais detalhadas, consulte:

- `INSTRUCOES_FIREBASE.md` - Detalhes sobre Firebase Database
- `INSTRUCOES_LOGIN.md` - Detalhes sobre Firebase Authentication
- `CLAUDE.md` - Arquitetura completa do projeto
- `GUIA_IMPORTACAO_CSV.md` - Como importar dados via CSV

---

## 🚀 Próximos Passos (Opcional)

Após o sistema estar funcionando:

1. **Segurança:** Configure regras de segurança do Firebase para produção
2. **Usuários:** Adicione mais usuários além do admin demo
3. **Dados Reais:** Importe dados reais via CSV
4. **Backup:** Configure backup automático do Firebase
5. **Monitoramento:** Configure alertas no Firebase Console

---

**Última atualização:** 2025-10-16
**Versão:** 1.0
