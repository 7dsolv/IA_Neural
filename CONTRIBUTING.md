# Como contribuir

Obrigado por melhorar o Neural IA. O objetivo é manter um laboratório visual pequeno, correto, reproduzível e fácil de estudar.

## Antes de começar

1. Procure uma issue existente ou abra uma proposta.
2. Para mudanças maiores, descreva primeiro o comportamento e como será testado.
3. Não adicione pesos de modelos, datasets pessoais, segredos ou artefatos gerados.

## Ambiente

- Node.js 20 ou superior para o motor web e testes.
- Python 3.10 ou superior para a implementação de referência.
- Nenhuma dependência de runtime é necessária.

```bash
git clone https://github.com/7dsolv/IA_Neural.git
cd IA_Neural
npm run check
npm test
```

No PowerShell, rode também:

```powershell
$env:PYTHONPATH="python"
python -m unittest discover -s python_tests -v
```

## Fluxo recomendado

1. Crie um fork e uma branch curta: `feat/nome-da-melhoria`.
2. Faça uma mudança focada.
3. Adicione ou atualize testes.
4. Rode todos os checks localmente.
5. Abra um pull request explicando problema, solução, validação e impacto visual.

## Regras de engenharia

- Preserve o funcionamento sem build e sem backend.
- Use JavaScript nativo e APIs estáveis do navegador.
- Toda aleatoriedade de experimentos precisa aceitar seed.
- Não altere fórmulas sem teste numérico e justificativa.
- Evite alegações de consciência, AGI ou desempenho sem evidência.
- Mantenha teclado, contraste, textos alternativos e `prefers-reduced-motion`.
- Não use `innerHTML` com conteúdo fornecido pelo usuário.
- Nunca coloque token, e-mail privado ou dado pessoal no código cliente.

## Commits

Prefira mensagens no formato:

```text
feat: adicionar dataset de duas luas
fix: corrigir derivada da ativação tanh
docs: explicar cálculo do gradiente
test: cobrir exportação determinística
```

## Critérios de aceitação

Um pull request está pronto quando:

- `npm run check` passa;
- `npm test` passa;
- `python -m unittest discover -s python_tests -v` passa;
- a interface funciona em desktop e mobile;
- a documentação acompanha a mudança;
- não há arquivos grandes, segredos nem dependências desnecessárias.
