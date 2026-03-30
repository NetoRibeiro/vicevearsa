# ViceVearsa

Crie departments de agentes de IA que trabalham juntos — direto do seu IDE ou do Dashboard.

## Instalacao Rapida

Cole no terminal e pronto:

**macOS / Linux:**
```bash
curl -fsSL https://vicevearsa.com/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://vicevearsa.com/install.ps1 | iex
```

O instalador verifica o Node.js (instala se necessario), cria a workspace e abre o Dashboard automaticamente.

Ou instale manualmente:
```bash
mkdir meu-projeto && cd meu-projeto
npx vicevearsa init --quick
```

## Como Usar

### Pelo IDE

Abra esta pasta no seu IDE e digite:

```
/vicevearsa
```

Isso abre o menu principal. De la voce pode criar departments, executa-los e mais.

Voce tambem pode ser direto — descreva o que quer em linguagem natural:

```
/vicevearsa crie um department para escrever posts no LinkedIn sobre IA
/vicevearsa execute o department meu-department
```

### Pelo Dashboard

O Dashboard e a interface visual para quem prefere nao usar terminal. Inicie com:

```bash
cd dashboard
npm run dev
```

Abra `http://localhost:5173` no navegador. De la voce pode:

- **Gerenciar departments** — ver, selecionar e deletar departments
- **Importar bundles** — arraste e solte arquivos `.vicevearsa-bundle` para instalar departments prontos
- **Acompanhar execucao** — barra de progresso, timeline de etapas e tempo decorrido em tempo real
- **Aprovar checkpoints** — popup de aprovacao com opcao de aprovar ou revisar com instrucoes
- **Configuracoes** — alterar nome, idioma e notificacoes do navegador

## Criar um Department

**Pelo IDE:** Digite `/vicevearsa` e escolha "Criar department" no menu, ou seja direto:

```
/vicevearsa crie um department para [o que voce precisa]
```

O Arquiteto fara algumas perguntas, projetara o department e configurara tudo automaticamente.

**Pelo Dashboard:** Importe um bundle pronto arrastando o arquivo `.vicevearsa-bundle` para a area de importacao.

## Executar um Department

**Pelo IDE:**

```
/vicevearsa execute o department <nome-do-department>
```

**Pelo Dashboard:** Selecione o department na barra lateral e acompanhe o progresso em tempo real.

O department executa automaticamente, pausando apenas nos checkpoints de decisao. Aprovacoes podem ser feitas pelo IDE ou pelo Dashboard.

## Escritorio Virtual

O Dashboard inclui o Escritorio Virtual — uma interface 2D pixel art que mostra seus agentes trabalhando em tempo real com animacoes de status e efeitos visuais.

---

# ViceVearsa (English)

Create AI departments that work together — right from your IDE or the Dashboard.

## Quick Install

Paste in your terminal and you're done:

**macOS / Linux:**
```bash
curl -fsSL https://vicevearsa.com/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://vicevearsa.com/install.ps1 | iex
```

The installer checks for Node.js (installs it if needed), creates the workspace, and opens the Dashboard automatically.

Or install manually:
```bash
mkdir my-project && cd my-project
npx vicevearsa init --quick
```

## How to Use

### From your IDE

Open this folder in your IDE and type:

```
/vicevearsa
```

This opens the main menu. From there you can create departments, run them, and more.

You can also be direct — describe what you want in plain language:

```
/vicevearsa create a department for writing LinkedIn posts about AI
/vicevearsa run my-department
```

### From the Dashboard

The Dashboard is the visual interface for those who prefer not to use the terminal. Start it with:

```bash
cd dashboard
npm run dev
```

Open `http://localhost:5173` in your browser. From there you can:

- **Manage departments** — view, select, and delete departments
- **Import bundles** — drag and drop `.vicevearsa-bundle` files to install ready-made departments
- **Track execution** — progress bar, step timeline, and elapsed time in real time
- **Approve checkpoints** — approval popup with options to approve or revise with instructions
- **Settings** — change name, language, and browser notifications

## Create a Department

**From your IDE:** Type `/vicevearsa` and choose "Create department" from the menu, or be direct:

```
/vicevearsa create a department for [what you need]
```

The Architect will ask a few questions, design the department, and set everything up automatically.

**From the Dashboard:** Import a ready-made bundle by dragging a `.vicevearsa-bundle` file into the import area.

## Run a Department

**From your IDE:**

```
/vicevearsa run the <department-name> department
```

**From the Dashboard:** Select the department in the sidebar and track progress in real time.

The department runs automatically, pausing only at decision checkpoints. Approvals can be done from the IDE or the Dashboard.

## Virtual Office

The Dashboard includes the Virtual Office — a 2D pixel art interface that shows your agents working in real time with status animations and visual effects.
