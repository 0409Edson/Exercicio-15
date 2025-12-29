# 🚀 Life Matriz - Guia de Implementação e Deploy

## 📋 Visão Geral do Projeto

**Nome:** Life Matriz  
**Versão:** 1.0.0  
**Tipo:** Progressive Web App (PWA)  
**Framework:** Next.js 14 + React 18  
**Autor:** Edson de Azevedo Martins  

---

## 🏗️ Estrutura do Projeto

```
lifeos/
├── public/                 # Arquivos estáticos
│   ├── icons/             # Ícones do PWA
│   ├── manifest.json      # Configuração PWA
│   └── sw.js              # Service Worker
├── src/
│   ├── app/               # Páginas da aplicação
│   │   ├── ai/            # Chat IA Juliana
│   │   ├── backup/        # Sistema de backup
│   │   ├── calendar/      # Agenda inteligente
│   │   ├── career/        # Carreira
│   │   ├── finance/       # Finanças
│   │   ├── goals/         # Objetivos
│   │   ├── habits/        # Hábitos
│   │   ├── health/        # Saúde
│   │   ├── journal/       # Diário
│   │   ├── links/         # Redes Sociais
│   │   ├── notifications/ # Notificações
│   │   ├── security/      # Segurança
│   │   ├── simulator/     # Simulador de dispositivos
│   │   ├── tips/          # Dicas
│   │   └── layout.tsx     # Layout principal
│   ├── components/        # Componentes reutilizáveis
│   │   ├── auth/          # Autenticação
│   │   ├── layout/        # Layout
│   │   └── pwa/           # PWA
│   ├── hooks/             # React Hooks customizados
│   └── lib/               # Stores e utilitários
│       ├── aiStore.ts     # Estado da IA
│       ├── habitStore.ts  # Estado dos hábitos
│       ├── notificationStore.ts  # Notificações
│       └── syncStore.ts   # Sincronização
├── electron/              # Versão Desktop
├── .github/workflows/     # CI/CD
├── package.json
└── README.md
```

---

## 🔧 Requisitos do Sistema

### Para Desenvolvimento
- Node.js 18+ (recomendado: 20 LTS)
- npm 9+ ou yarn 1.22+
- Git

### Para Produção
- Conta no Vercel, Netlify ou servidor próprio
- (Opcional) Chaves API para IA

---

## 📦 Instalação Local

### 1. Clonar o Projeto
```bash
git clone https://github.com/seu-usuario/lifematriz.git
cd lifematriz
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Criar arquivo `.env.local` na raiz:
```env
# IA (opcional - o app funciona sem estas chaves)
OPENAI_API_KEY=sua_chave_openai
ANTHROPIC_API_KEY=sua_chave_anthropic
GOOGLE_API_KEY=sua_chave_gemini

# Busca (opcional)
SERPAPI_KEY=sua_chave_serpapi

# Google Calendar (opcional)
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Executar em Desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:3000

---

## 🌐 Deploy na Vercel (Recomendado)

### Método 1: Via GitHub
1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe seu repositório
5. Configure as variáveis de ambiente
6. Clique em "Deploy"

### Método 2: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Variáveis de Ambiente na Vercel
No painel da Vercel, vá em Settings > Environment Variables e adicione:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- (outras conforme necessário)

---

## 📱 Configuração PWA

O app já está configurado como PWA. Para instalar:

### Desktop (Chrome/Edge)
1. Acesse o app
2. Clique no ícone de instalar na barra de endereço
3. Confirme a instalação

### Mobile
1. Acesse o app no navegador
2. Toque em "Adicionar à tela inicial"
3. O app aparecerá como um aplicativo nativo

---

## 🖥️ Build para Produção

### Build Web
```bash
npm run build
npm run start
```

### Build Desktop (Electron)
```bash
cd electron
npm install
npm run build
```

---

## 🔐 Segurança

### Autenticação
- Sistema de senha local
- Suporte a biometria (onde disponível)
- Dados salvos localmente com criptografia

### Dados
- Todos os dados são salvos no localStorage
- Backup automático a cada 24h
- Exportação manual disponível

---

## 📊 Funcionalidades Implementadas

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Dashboard | ✅ | Visão geral do dia |
| IA Juliana | ✅ | Chat com IA (local ou via API) |
| Redes Sociais | ✅ | Links rápidos para plataformas |
| Objetivos | ✅ | Gestão de metas SMART |
| Diário | ✅ | Registro diário |
| Hábitos | ✅ | Tracking com streak |
| Agenda | ✅ | Calendário inteligente |
| Finanças | ✅ | Controle financeiro |
| Saúde | ✅ | Monitoramento de saúde |
| Carreira | ✅ | Gestão de carreira |
| Backup | ✅ | Sistema de backup |
| Segurança | ✅ | Autenticação e proteção |
| Notificações | ✅ | Central de notificações push |
| Dicas | ✅ | Sugestões personalizadas |
| Simulador | ✅ | Teste em diferentes dispositivos |
| PWA | ✅ | Instalável em qualquer dispositivo |

---

## 🔄 Atualizações Futuras (Roadmap)

### v1.1 (Próxima)
- [ ] Tema claro/escuro
- [ ] Widgets personalizáveis
- [ ] Gráficos de progresso
- [ ] Integração com clima

### v1.2
- [ ] Sincronização na nuvem
- [ ] Múltiplos perfis
- [ ] Gamificação (XP e conquistas)

### v2.0
- [ ] App nativo iOS/Android
- [ ] Integração com wearables
- [ ] Assistente de voz

---

## 🐛 Solução de Problemas

### Erro: "API key not configured"
O app funciona sem chaves API usando respostas locais. Para IA avançada, configure as chaves no `.env.local`.

### Erro: "Service Worker registration failed"
Limpe o cache do navegador: Ctrl+Shift+Delete

### App não carrega
```bash
rm -rf .next
npm run build
npm run start
```

---

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato:
- Desenvolvido por: Edson de Azevedo Martins
- Assistente: Juliana (IA do Life Matriz)

---

## 📄 Licença

Este projeto é de uso privado.  
© 2024 Life Matriz - Todos os direitos reservados.
