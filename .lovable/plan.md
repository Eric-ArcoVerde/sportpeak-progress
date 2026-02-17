

# SportPeak — PWA Mobile-First para Evolução Esportiva 🏆

## Visão Geral
App progressivo (PWA) mobile-first para registrar e acompanhar evolução em esportes híbridos como Cheerleading, Ginástica e Musculação. Design moderno, escuro e esportivo.

---

## Fase 1: Infraestrutura & Autenticação

### Supabase + Banco de Dados
- Configurar Lovable Cloud (Supabase integrado)
- Criar tabelas: **profiles**, **movements**, **logs** conforme schema especificado
- Criar bucket público **evidence-media** para fotos/vídeos
- Configurar RLS: logs privados por usuário, movements com leitura pública e escrita para autenticados
- Trigger para criar profile automaticamente no signup

### Autenticação
- Tela de Login/Cadastro com email e senha
- Redirecionamento automático pós-login
- Proteção de rotas autenticadas

### PWA
- Configurar vite-plugin-pwa com manifest, ícones e service worker
- Meta tags mobile-otimizadas
- Página `/install` para instalação no dispositivo

---

## Fase 2: Formulário Inteligente de Registro (LogForm)

### Creatable Select para Movimentos
- Componente de busca que lista movimentos existentes do banco
- Se o movimento digitado não existir, opção de criar automaticamente
- Categorização: skill ou strength

### Input de Carga com Calculadora
- Campo principal em KG
- Botão "Calculadora" ao lado que abre modal de conversão Lbs ↔ Kg
- Sempre salva em Kg no banco

### Upload de Mídia (MediaUploader)
- Botão para upload de foto ou vídeo ao bucket evidence-media
- Preview do arquivo antes de salvar
- URL salva automaticamente no log

### Feedback Visual de PR
- Checkbox "É um PR / Primeira vez?"
- Ao salvar com PR marcado: animação de confetti na tela inteira
- Modal de parabéns: "Novo Recorde Registrado! 🏆"

---

## Fase 3: Dashboard & Histórico

### Feed de Logs (MovementCard)
- Lista cronológica dos registros do usuário
- Cards com: nome do movimento, carga, reps, data, badge de PR
- Se houver vídeo: player/thumbnail inline
- Se não houver mídia: ícone estilizado da categoria (haltere para strength, silhueta para skill)

### Filtros
- Barra fixa no topo do feed
- Filtro "Todos" ou por movimento específico
- Permite ver a evolução isolada de um movimento (ex: só Back Tuck)

---

## Fase 4: Navegação & Estrutura

### Layout Mobile-First
- Bottom navigation bar com: Home (Dashboard), Novo Log (+), Perfil
- Design escuro e esportivo com acentos vibrantes
- Componentes modulares: MovementCard, LogForm, UnitConverter, MediaUploader

### Perfil
- Avatar, username
- Resumo de stats (total de logs, PRs registrados)

