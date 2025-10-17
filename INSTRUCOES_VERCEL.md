# 🚀 Configurar Variáveis de Ambiente no Vercel

## ⚠️ Problema

O arquivo `.env.local` **NÃO** é enviado para o Vercel (e nem deve ser, por segurança). Você precisa configurar as variáveis de ambiente diretamente no painel do Vercel.

## 📋 Passo a Passo

### 1. Acessar Configurações do Projeto

**Link direto (se o projeto se chama "suadbm"):**
👉 https://vercel.com/thiagopvns-projects/suadbm/settings/environment-variables

**OU manualmente:**
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **suadbm**
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)

### 2. Adicionar Variáveis de Ambiente

Clique em **"Add New"** para cada variável abaixo:

#### Variável 1: NEXT_PUBLIC_FIREBASE_API_KEY
```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyDhLLzcqgM26plgH7eL5mWms3EDeJqHpMY
Environment: Production, Preview, Development (marcar todas)
```

#### Variável 2: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: suad-44036.firebaseapp.com
Environment: Production, Preview, Development (marcar todas)
```

#### Variável 3: NEXT_PUBLIC_FIREBASE_DATABASE_URL
```
Name: NEXT_PUBLIC_FIREBASE_DATABASE_URL
Value: https://suad-44036-default-rtdb.firebaseio.com
Environment: Production, Preview, Development (marcar todas)
```

#### Variável 4: NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: suad-44036
Environment: Production, Preview, Development (marcar todas)
```

#### Variável 5: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: suad-44036.firebasestorage.app
Environment: Production, Preview, Development (marcar todas)
```

#### Variável 6: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 33344546339
Environment: Production, Preview, Development (marcar todas)
```

#### Variável 7: NEXT_PUBLIC_FIREBASE_APP_ID
```
Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:33344546339:web:4de36f2ebaa4e4ea11f396
Environment: Production, Preview, Development (marcar todas)
```

#### Variável 8: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```
Name: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
Value: G-SNDT989PZE
Environment: Production, Preview, Development (marcar todas)
```

### 3. Fazer Redeploy

Após adicionar todas as variáveis:

#### Opção A - Redeploy Automático (Recomendado)
1. Na página do projeto, vá em **Deployments**
2. Clique nos 3 pontinhos (...) no último deployment
3. Clique em **"Redeploy"**
4. Marque a opção **"Use existing Build Cache"** (mais rápido)
5. Clique em **"Redeploy"**

#### Opção B - Trigger via Git
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

### 4. Aguardar Deploy

O deploy leva entre 1-3 minutos. Você pode acompanhar em:
- https://vercel.com/thiagopvns-projects/suadbm/deployments

Quando aparecer **"Ready"** com ✅ verde, está pronto!

### 5. Testar em Produção

1. Acesse: https://suadbm.vercel.app
2. Deve redirecionar para: https://suadbm.vercel.app/login
3. Faça login com:
   - Email: `admin@cbmerj.rj.gov.br`
   - Senha: `admin123`
4. Dashboard deve carregar sem erros!

## 🔍 Verificar se as Variáveis Estão Configuradas

No painel do Vercel, em **Environment Variables**, você deve ver 8 variáveis listadas:

- ✅ NEXT_PUBLIC_FIREBASE_API_KEY
- ✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- ✅ NEXT_PUBLIC_FIREBASE_DATABASE_URL
- ✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID
- ✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- ✅ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- ✅ NEXT_PUBLIC_FIREBASE_APP_ID
- ✅ NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

## ❌ Problemas Comuns

### Erro: "Permission Denied" em produção
- ❌ Variáveis não foram adicionadas
- ✅ Siga o **Passo 2** novamente e faça redeploy

### Erro: "Failed to fetch credits" em produção
- ❌ Variáveis foram adicionadas, mas não foi feito redeploy
- ✅ Siga o **Passo 3** para fazer redeploy

### Site ainda mostra versão antiga
- ❌ Cache do navegador
- ✅ Faça hard refresh: `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac)

### Deploy falhou
- ❌ Erro de build
- ✅ Verifique os logs em: https://vercel.com/thiagopvns-projects/suadbm/deployments
- ✅ Se necessário, faça um novo push:
  ```bash
  git commit --allow-empty -m "Rebuild"
  git push
  ```

## 📊 Checklist Final

Após configurar tudo:

- [ ] 8 variáveis de ambiente adicionadas no Vercel
- [ ] Redeploy feito e concluído com sucesso (✅ Ready)
- [ ] Site abre em https://suadbm.vercel.app/login
- [ ] Login funciona
- [ ] Dashboard carrega sem erros no console
- [ ] Descentralizações aparecem na página

## 🔐 Segurança

**IMPORTANTE:** As variáveis com prefixo `NEXT_PUBLIC_*` são expostas no navegador. Isso é necessário para o Firebase funcionar, mas significa que:

- ✅ As chaves do Firebase são visíveis no código do cliente
- ✅ Isso é **normal e esperado** para apps Firebase
- ✅ A segurança vem das **Firebase Rules** (que você já configurou)
- ⚠️ Nunca coloque chaves privadas ou senhas em variáveis `NEXT_PUBLIC_*`

## 📚 Referências

- Documentação Vercel: https://vercel.com/docs/environment-variables
- Firebase Web Setup: https://firebase.google.com/docs/web/setup

---

**Última atualização:** 2025-10-16
**Versão:** 1.0
