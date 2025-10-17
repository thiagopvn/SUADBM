# 📋 Guia de Importação de Dados CSV - SUAD CBMERJ

Este guia fornece instruções completas para importar dados de um arquivo CSV para o Firebase Realtime Database do projeto SUAD CBMERJ.

## 🔧 Pré-requisitos

Antes de iniciar, certifique-se de que você tem:
- Node.js instalado (versão 16 ou superior)
- Acesso ao console do Firebase do projeto
- Permissões de administrador no projeto Firebase

## 📦 1. Instalação das Dependências

Execute o comando abaixo na raiz do projeto para instalar as dependências necessárias:

```bash
npm install firebase-admin csv-parse
```

## 🔑 2. Configuração do Firebase Admin SDK

### 2.1 Obtenção da Chave de Serviço

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto SUAD CBMERJ
3. Vá em **Configurações do Projeto** (ícone de engrenagem) → **Contas de serviço**
4. Clique em **Gerar nova chave privada**
5. Salve o arquivo JSON baixado como `serviceAccountKey.json`

### 2.2 Posicionamento do Arquivo

Coloque o arquivo `serviceAccountKey.json` na **raiz do projeto** (mesmo nível do `package.json`):

```
/root/projetos/SUAD/
├── serviceAccountKey.json  ← Aqui
├── package.json
├── scripts/
│   └── importFromCSV.js
└── data/
    └── suad_para_firebase.csv
```

⚠️ **IMPORTANTE**: Nunca commite este arquivo no Git. Ele já está no `.gitignore`.

## 📊 3. Preparação dos Dados CSV

### 3.1 Verificação do Arquivo CSV

O arquivo de dados já foi criado em `/data/suad_para_firebase.csv` com os dados fornecidos. Você pode:

1. **Usar os dados de exemplo**: Os dados já estão prontos para importação
2. **Substituir pelos seus dados**: Edite o arquivo mantendo a estrutura das colunas

### 3.2 Estrutura do CSV

O arquivo deve conter as seguintes colunas (nesta ordem):

```
ANO,EIXO,DESCENTRALIZAÇÃO DE CRÉTITO,SALDO DC,VALOR EMPENHADO,NATUREZA,PROCESSO SEI,OBJETO,QUANTIDADE ADQUIRIDA,VALOR UNITÁRIO,VALOR DETALHADO EM NE,NOTA DE EMPENHO,NOTA DE LIQUIDAÇÃO,VALOR LIQUIDADO (R$),PLANO DE TRABALHO
```

## 🚀 4. Execução da Importação

### 4.1 Comando de Importação

Na raiz do projeto, execute:

```bash
node scripts/importFromCSV.js
```

### 4.2 Saída Esperada

Você verá uma saída similar a esta:

```
Iniciando importação de dados...
Processando 41 registros...
Processados 15 créditos únicos
Processadas 28 despesas
Importando créditos...
Importando despesas...
✅ Importação concluída com sucesso!
- 15 créditos importados
- 28 despesas importadas

📊 Resumo por ano:
2024: 4 créditos - R$ 8.970.666,93
2023: 3 créditos - R$ 12.464.293,43
2022: 2 créditos - R$ 1.420.878,00
2021: 2 créditos - R$ 2.049.561,68
2020: 2 créditos - R$ 2.259.927,39
2019: 1 crédito - R$ 2.328.318,16
```

## 🎯 5. Regras de Mapeamento

### 5.1 Créditos

| Campo Firebase | Origem CSV | Observações |
|----------------|------------|-------------|
| `creditoCodigo` | `DESCENTRALIZAÇÃO DE CRÉTITO` | Identificador único |
| `anoExercicio` | `ANO` | Ano do exercício |
| `valorGlobal` | `SALDO DC` | Valor convertido automaticamente |
| `eixos` | `EIXO` | Array com o eixo do crédito |
| `natureza` | `NATUREZA` | Natureza da despesa |
| `dataLancamento` | Data atual | Formato YYYY-MM-DD |
| `origem.tipo` | Calculado | 'Ano vigente' ou 'Anos anteriores' |

### 5.2 Despesas

| Campo Firebase | Origem CSV | Observações |
|----------------|------------|-------------|
| `processoSEI` | `PROCESSO SEI` | Número do processo |
| `objeto` | `OBJETO` | Descrição do objeto (obrigatório) |
| `valorTotal` | `VALOR DETALHADO EM NE` | Valor convertido |
| `status` | Fixo: 'Empenhado' | Status padrão |
| `planoDeTrabalho` | `PLANO DE TRABALHO` | Campo opcional |

### 5.3 Fontes de Recurso

| Campo Firebase | Origem CSV | Observações |
|----------------|------------|-------------|
| `valorUtilizado` | `VALOR DETALHADO EM NE` | Valor da fonte |
| `notaEmpenho` | `NOTA DE EMPENHO` | Se diferente de '---' |
| `notaLiquidacao` | `NOTA DE LIQUIDAÇÃO` | Se diferente de '---' |
| `valorLiquidado` | `VALOR LIQUIDADO (R$)` | Se maior que 0 |

## 🔍 6. Verificação da Importação

### 6.1 No Console Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Vá para **Realtime Database**
3. Verifique se as coleções `creditos` e `despesas` foram criadas
4. Confira alguns registros para validar os dados

### 6.2 Na Aplicação

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Acesse a aplicação em `http://localhost:3000`
3. Verifique se os dados aparecem no dashboard
4. Teste a página de rastreamento com os dados importados

## ⚠️ 7. Tratamento de Erros

### 7.1 Arquivo não encontrado

**Erro**: `Arquivo CSV não encontrado`
**Solução**: Verifique se `/data/suad_para_firebase.csv` existe

### 7.2 Chave de serviço inválida

**Erro**: `serviceAccountKey.json não encontrado`
**Solução**: Baixe novamente a chave do Firebase Console

### 7.3 Erro de conexão

**Erro**: `ENOTFOUND` ou erro de rede
**Solução**: Verifique sua conexão com a internet e configurações de proxy

### 7.4 Dados inválidos

**Erro**: Falha na conversão de valores
**Solução**: Verifique o formato dos valores monetários no CSV

## 🧹 8. Limpeza (Opcional)

Para remover todos os dados importados:

```bash
# Acesse o Firebase Console
# Vá para Realtime Database
# Delete manualmente as coleções 'creditos' e 'despesas'
```

## 📝 9. Personalizações

### 9.1 Modificar Mapeamentos

Edite o arquivo `/scripts/importFromCSV.js` para alterar:
- Campos de mapeamento
- Regras de validação
- Formatação de dados

### 9.2 Adicionar Novos Campos

1. Atualize `/types/index.ts` com novos campos
2. Modifique o script de importação
3. Ajuste as interfaces conforme necessário

## 🆘 10. Suporte

Em caso de problemas:

1. Verifique os logs de erro no terminal
2. Confirme as configurações do Firebase
3. Teste com um subconjunto menor de dados
4. Consulte a documentação do Firebase Admin SDK

---

✅ **Importação concluída!** Seus dados estão agora disponíveis no Firebase e na aplicação SUAD CBMERJ.