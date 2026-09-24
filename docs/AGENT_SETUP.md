# Vercel Plugin para agentes

O projeto usa o plugin oficial da Vercel como ferramenta de desenvolvimento para agentes de código.

Instalação no ambiente local do agente:

```bash
npx plugins add vercel/vercel-plugin
```

Atalho disponível no projeto:

```bash
npm run agent:vercel
```

O comando não é executado em `postinstall` nem durante o build da aplicação porque o plugin pertence ao ambiente do agente de desenvolvimento, não ao runtime do PulseBI.
