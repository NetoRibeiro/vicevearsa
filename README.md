# vicevearsa

Crie departmens de agentes de IA que trabalham juntos — direto da sua IDE.

vicevearsa é um framework de orquestração multi-agente. Descreva o que você precisa em linguagem natural, e o vicevearsa cria uma equipe de agentes especializados que trabalham juntos automaticamente.

## Veja em ação

[![Assista ao vídeo de lançamento](https://img.youtube.com/vi/CL1ppI4qHeU/maxresdefault.jpg)](https://www.youtube.com/watch?v=CL1ppI4qHeU)

## O que é um Departmen?

Um departmen é uma equipe de agentes de IA que colaboram em uma tarefa. Cada agente tem um papel específico. Eles executam em pipeline — você só intervém nos checkpoints de decisão.

Exemplo:

- **Pesquisador** coleta informações e tendências do setor
- **Estrategista** gera ideias e define a abordagem
- **Redator** produz o conteúdo final
- **Designer** cria as imagens para redes sociais
- **Revisor** garante qualidade antes da entrega

## Instalação

**Pré-requisito:** Node.js 20+

```bash
npx vicevearsa init
```

Para atualizar uma instalação existente:

```bash
npx vicevearsa update
```

## IDEs Suportadas

| IDE | Status |
|-----|--------|
| Antigravity | Disponível |
| Claude Code | Disponível |
| Codex (OpenAI) | Disponível |
| Open Code | Disponível |
| Cursor | Disponível |
| VS Code + Copilot | Disponível |

## Escritório Virtual

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando em tempo real.

**Passo 1 — Gere o dashboard** (na sua IDE):

```
/vicevearsa dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve departmens/<nome-do-departmen>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

## Criando seu Departmen

Abra o menu:

```
/vicevearsa
```

O **ViceVearsa** vai te mostrar todas as opções disponíveis. 

Para criar um novo departmen, basta selecionar a opção, e o **Arquiteto** faz algumas perguntas, projeta o departmen e configura tudo automaticamente. Você aprova o design antes de qualquer execução.

## Executando um Departmen

Você pode executar o departmen novamente com /vicevearsa, ou pedindo diretamente:

```
/vicevearsa rode o departmen <nome-do-departmen>
```

O departmen executa automaticamente, pausando apenas nos checkpoints onde sua decisão é necessária.

## Exemplos

```
/vicevearsa
/vicevearsa crie um Departmen que gera carrosséis de Instagram a partir de notícias quentes, cria as imagens e publica automaticamente
/vicevearsa quero um Departmen que produz todos os materiais de lançamento de infoproduto: páginas de vendas, mensagens de WhatsApp, emails e roteiros de CPL
/vicevearsa crie um Departmen que escreve tutoriais completos com prints de tela para treinamento de colaboradores
/vicevearsa crie um "Departmen que pega vídeos do YouTube e gera cortes virais automaticamente"
/vicevearsa roda o departmen carrosseis-instagram

```

## Comandos

| Comando | O que faz |
|---------|-----------|
| `/vicevearsa` | Abre o menu principal |
| `/vicevearsa help` | Mostra todos os comandos |
| `/vicevearsa create` | Cria um novo departmen |
| `/vicevearsa run <nome>` | Executa um departmen |
| `/vicevearsa list` | Lista seus departmens |
| `/vicevearsa edit <nome>` | Modifica um departmen |
| `/vicevearsa skills` | Navega pelas skills instaladas |
| `/vicevearsa install <nome>` | Instala uma skill do catálogo |
| `/vicevearsa uninstall <nome>` | Remove uma skill instalada |

## Licença

MIT — use como quiser.

---

# vicevearsa (English)

Create AI departmens that work together — right from your IDE.

vicevearsa is a multi-agent orchestration framework. Describe what you need in plain language, and vicevearsa creates a team of specialized agents that work together automatically.

## See it in action

[![Watch the launch video](https://img.youtube.com/vi/CL1ppI4qHeU/maxresdefault.jpg)](https://www.youtube.com/watch?v=CL1ppI4qHeU)

## What is a Departmen?

A departmen is a team of AI agents that collaborate on a task. Each agent has a specific role. They run in a pipeline — you only step in at decision checkpoints.

Example:

- **Researcher** gathers information and industry trends
- **Strategist** generates ideas and defines the approach
- **Writer** produces the final content
- **Reviewer** ensures quality before delivery

## Installation

**Prerequisite:** Node.js 20+

```bash
npx vicevearsa init
```

To update an existing installation:

```bash
npx vicevearsa update
```

## Supported IDEs

| IDE | Status |
|-----|--------|
| Antigravity | Available |
| Claude Code | Available |
| Codex (OpenAI) | Available |
| Open Code | Available |
| Cursor | Available |
| VS Code + Copilot | Available |

## Virtual Office

The Virtual Office is a 2D visual interface that shows your agents working in real time.

**Step 1 — Generate the dashboard** (in your IDE):

```
/vicevearsa dashboard
```

**Step 2 — Serve it locally** (in terminal):

```bash
npx serve departmens/<departmen-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.

## Creating your Departmen

Describe what you need:

```
/vicevearsa create "A departmen that writes LinkedIn posts about AI trends"
```

The **Architect** asks a few questions, designs the departmen, and sets everything up automatically. You approve the design before any execution begins.

## Running a Departmen

```
/vicevearsa run <departmen-name>
```

The departmen runs automatically, pausing only at checkpoints where your decision is needed.

## Examples

```
/vicevearsa create "Departmen that generates Instagram carousels from trending news, creates the images, and publishes automatically"
/vicevearsa create "Departmen that produces all infoproduct launch materials: sales pages, WhatsApp messages, emails, and CPL scripts"
/vicevearsa create "Departmen that writes complete tutorials with screenshots for employee training"
/vicevearsa create "Departmen that takes YouTube videos and automatically generates viral clips"
```

## Commands

| Command | What it does |
|---------|-------------|
| `/vicevearsa` | Open the main menu |
| `/vicevearsa help` | Show all commands |
| `/vicevearsa create` | Create a new departmen |
| `/vicevearsa run <name>` | Run a departmen |
| `/vicevearsa list` | See all your departmens |
| `/vicevearsa edit <name>` | Modify a departmen |
| `/vicevearsa skills` | Browse installed skills |
| `/vicevearsa install <name>` | Install a skill from catalog |
| `/vicevearsa uninstall <name>` | Remove an installed skill |

## License

MIT — use it however you want.
