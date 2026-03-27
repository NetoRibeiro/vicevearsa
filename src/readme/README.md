# ViceVearsa

Crie departments de agentes de IA que trabalham juntos — direto do seu IDE.

## Como Usar

Abra esta pasta no seu IDE e digite:

```
/vicevearsa
```

Isso abre o menu principal. De lá você pode criar departments, executá-los e mais.

Você também pode ser direto — descreva o que quer em linguagem natural:

```
/vicevearsa crie um department para escrever posts no LinkedIn sobre IA
/vicevearsa execute o department meu-department
```

## Criar um Department

Digite `/vicevearsa` e escolha "Criar department" no menu, ou seja direto:

```
/vicevearsa crie um department para [o que você precisa]
```

O Arquiteto fará algumas perguntas, projetará o department e configurará tudo automaticamente.

## Executar um Department

Digite `/vicevearsa` e escolha "Executar department" no menu, ou seja direto:

```
/vicevearsa execute o department <nome-do-department>
```

O department executa automaticamente, pausando apenas nos checkpoints de decisão.

## Escritório Virtual

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando em tempo real.

**Passo 1 — Gere o dashboard** (no seu IDE):

```
/vicevearsa dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve departments/<nome-do-department>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

---

# ViceVearsa (English)

Create AI departments that work together — right from your IDE.

## How to Use

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

## Create a Department

Type `/vicevearsa` and choose "Create department" from the menu, or be direct:

```
/vicevearsa create a department for [what you need]
```

The Architect will ask a few questions, design the department, and set everything up automatically.

## Run a Department

Type `/vicevearsa` and choose "Run department" from the menu, or be direct:

```
/vicevearsa run the <department-name> department
```

The department runs automatically, pausing only at decision checkpoints.

## Virtual Office

The Virtual Office is a 2D visual interface that shows your agents working in real time.

**Step 1 — Generate the dashboard** (in your IDE):

```
/vicevearsa dashboard
```

**Step 2 — Serve it locally** (in terminal):

```bash
npx serve departments/<department-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.
