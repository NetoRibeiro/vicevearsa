# ViceVearsa

Crie departmens de agentes de IA que trabalham juntos — direto do seu IDE.

## Como Usar

Abra esta pasta no seu IDE e digite:

```
/vicevearsa
```

Isso abre o menu principal. De lá você pode criar departmens, executá-los e mais.

Você também pode ser direto — descreva o que quer em linguagem natural:

```
/vicevearsa crie um departmen para escrever posts no LinkedIn sobre IA
/vicevearsa execute o departmen meu-departmen
```

## Criar um Departmen

Digite `/vicevearsa` e escolha "Criar departmen" no menu, ou seja direto:

```
/vicevearsa crie um departmen para [o que você precisa]
```

O Arquiteto fará algumas perguntas, projetará o departmen e configurará tudo automaticamente.

## Executar um Departmen

Digite `/vicevearsa` e escolha "Executar departmen" no menu, ou seja direto:

```
/vicevearsa execute o departmen <nome-do-departmen>
```

O departmen executa automaticamente, pausando apenas nos checkpoints de decisão.

## Escritório Virtual

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando em tempo real.

**Passo 1 — Gere o dashboard** (no seu IDE):

```
/vicevearsa dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve departmens/<nome-do-departmen>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

---

# ViceVearsa (English)

Create AI departmens that work together — right from your IDE.

## How to Use

Open this folder in your IDE and type:

```
/vicevearsa
```

This opens the main menu. From there you can create departmens, run them, and more.

You can also be direct — describe what you want in plain language:

```
/vicevearsa create a departmen for writing LinkedIn posts about AI
/vicevearsa run my-departmen
```

## Create a Departmen

Type `/vicevearsa` and choose "Create departmen" from the menu, or be direct:

```
/vicevearsa create a departmen for [what you need]
```

The Architect will ask a few questions, design the departmen, and set everything up automatically.

## Run a Departmen

Type `/vicevearsa` and choose "Run departmen" from the menu, or be direct:

```
/vicevearsa run the <departmen-name> departmen
```

The departmen runs automatically, pausing only at decision checkpoints.

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
