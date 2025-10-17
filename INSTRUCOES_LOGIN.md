# Instruções para Configurar Login no Firebase

## 🔐 Configuração da Autenticação

### Passo 1: Ativar Autenticação por Email/Senha

1. Acesse: https://console.firebase.google.com/project/suad-44036/authentication/providers

2. Clique em **"Get Started"** (se for a primeira vez) ou **"Add provider"**

3. Selecione **"Email/Password"**

4. Ative a opção **"Email/Password"** (primeira opção)

5. Clique em **"Save"**

### Passo 2: Criar Usuário de Teste

1. Vá para: https://console.firebase.google.com/project/suad-44036/authentication/users

2. Clique em **"Add user"**

3. Preencha:
   - **Email:** admin@cbmerj.rj.gov.br
   - **Password:** admin123 (ou escolha outra senha)

4. Clique em **"Add user"**

## ✅ Testar o Login

1. Acesse: http://localhost:3000/login

2. Use as credenciais:
   - **Email:** admin@cbmerj.rj.gov.br
   - **Senha:** admin123

3. Ou clique em **"Acessar com conta demo"**

## 🔄 Fluxo de Autenticação

### Como funciona:

1. **Usuário não autenticado:**
   - Navbar mostra "Saindo..." (loading state)
   - Ao clicar em "Sair", é redirecionado para `/login`

2. **Login bem-sucedido:**
   - Usuário é redirecionado para `/` (dashboard)
   - Firebase mantém a sessão persistente

3. **Proteção de rotas:**
   - Todas as rotas (exceto `/login`) mostram o sistema normalmente
   - Para adicionar proteção real, implemente middleware ou guards

## 📝 Credenciais Demo

```
Email: admin@cbmerj.rj.gov.br
Senha: admin123
```

## 🔒 Segurança - Próximos Passos

Para produção, considere:

1. **Email Verification:**
   ```javascript
   // Ativar no Firebase Console
   // Authentication > Settings > User account management
   ```

2. **Password Reset:**
   ```javascript
   import { sendPasswordResetEmail } from 'firebase/auth';
   await sendPasswordResetEmail(auth, email);
   ```

3. **Multi-factor Authentication (MFA):**
   - Configurar 2FA no Firebase Console
   - Implementar UI para gerenciar 2FA

4. **Regras de Segurança:**
   - Atualizar Database Rules para verificar autenticação
   - Exemplo em `INSTRUCOES_FIREBASE.md`

## 🚀 Status Atual

- ✅ Página de login criada (`/login`)
- ✅ Integração com Firebase Auth
- ✅ Redirecionamento automático
- ✅ Mensagens de erro amigáveis
- ✅ Botão de login demo
- ⚠️ Proteção de rotas (opcional - implementar se necessário)

## 🎨 Customização

Para customizar a página de login, edite:
- `/app/login/page.tsx` - Interface do login
- `/hooks/use-auth.ts` - Lógica de autenticação
