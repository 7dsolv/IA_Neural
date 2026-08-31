<div align="center">
  <img src="web/assets/brand-mark.svg" width="82" alt="Símbolo do Neural IA" />

  # Neural IA

  **Laboratório visual de redes neurais — aberto, verificável e executado no navegador.**

  [![Página online](https://img.shields.io/badge/ABRIR_LABORATÓRIO-16dcef?style=for-the-badge&logo=githubpages&logoColor=041018)](https://7dsolv.github.io/IA_Neural/)
  [![CI](https://img.shields.io/github/actions/workflow/status/7dsolv/IA_Neural/ci.yml?branch=main&style=for-the-badge&label=TESTES)](https://github.com/7dsolv/IA_Neural/actions/workflows/ci.yml)
  [![Pages](https://img.shields.io/github/actions/workflow/status/7dsolv/IA_Neural/pages.yml?branch=main&style=for-the-badge&label=PAGES)](https://github.com/7dsolv/IA_Neural/actions/workflows/pages.yml)
  [![Licença MIT](https://img.shields.io/badge/LICENÇA-MIT-a87bff?style=for-the-badge)](LICENSE)

  [Demo](https://7dsolv.github.io/IA_Neural/) · [Arquitetura](documentation/ARCHITECTURE.md) · [Matemática](documentation/MATH.md) · [Contribuir](CONTRIBUTING.md) · [Issues](https://github.com/7dsolv/IA_Neural/issues)
</div>

![Núcleo neural do Neural IA](web/assets/neural-core-hero-v1.png)

## O que é

Neural IA é um laboratório educacional de classificação binária. Ele permite montar e treinar uma pequena rede neural, observar sua fronteira de decisão, acompanhar a curva de perda, inspecionar conexões e exportar os pesos — tudo localmente no navegador, sem backend e sem enviar dados.

Não é uma alegação de AGI nem um chatbot disfarçado. É uma implementação pequena e legível de *multilayer perceptron* (MLP), feita para estudo, experimentação e contribuições reproduzíveis.

### O que já funciona

- Treinamento real por backpropagation diretamente no navegador.
- Datasets XOR, AND, OR, anéis concêntricos e diagonal com ruído.
- Ajuste de seed, taxa de aprendizado, épocas e neurônios ocultos.
- Superfície de decisão, grafo de conexões e curva de perda em tempo real.
- Console de inferência com duas entradas e probabilidade de saída.
- Exportação de snapshot JSON com configuração, métricas e pesos.
- Aplicação instalável e cache offline por Service Worker.
- Motor de referência equivalente em Python, sem dependências externas.
- Testes determinísticos em JavaScript e Python.
- CI, CodeQL, revisão de dependências, Dependabot e deploy automático no GitHub Pages.
- Contexto próprio para GitHub Copilot e agentes de contribuição.

## Experimente em 30 segundos

1. Abra **[7dsolv.github.io/IA_Neural](https://7dsolv.github.io/IA_Neural/)**.
2. Escolha `XOR` e clique em **Treinar rede**.
3. Observe a fronteira se separar enquanto a perda cai.
4. Mude `Entrada X` e `Entrada Y` para consultar o modelo.
5. Exporte o snapshot para examinar os pesos.

## Arquitetura

```text
amostra [x₁, x₂]
       │
       ▼
camada densa (2 × N) ── tanh
       │
       ▼
camada densa (N × 1) ── sigmoid
       │
       ▼
probabilidade ŷ ∈ [0, 1]
```

O forward pass é:

$$
h = \tanh(W_1x + b_1)
$$

$$
\hat{y} = \sigma(W_2h + b_2)
$$

A perda usada no treinamento é a entropia cruzada binária:

$$
L = -\left[y\log(\hat{y}) + (1-y)\log(1-\hat{y})\right]
$$

Os parâmetros são atualizados por gradiente descendente:

$$
W \leftarrow W - \eta\nabla_W L
$$

Detalhes e derivação: [documentation/MATH.md](documentation/MATH.md).

## Executar localmente

O site não precisa de build:

```bash
python -m http.server 4173 --directory web
```

Depois acesse `http://localhost:4173`.

### Testes JavaScript

Requer Node.js 20 ou superior. Não há pacotes para instalar.

```bash
npm run check
npm test
```

### Motor Python

Requer Python 3.10 ou superior e apenas a biblioteca padrão.

```bash
# Linux/macOS
PYTHONPATH=python python -m neural_ia --epochs 1500

# PowerShell
$env:PYTHONPATH="python"; python -m neural_ia --epochs 1500
```

Saída esperada com seed 7: acurácia `1.0` no XOR e perda inferior a `0.02`.

## Estrutura pública

```text
IA_Neural/
├── web/                       # aplicação publicada pelo GitHub Pages
│   ├── core/                  # engine neural JavaScript
│   └── assets/                # identidade visual
├── python/neural_ia/          # implementação de referência em Python
├── tests/                     # testes Node.js
├── python_tests/              # testes unittest
├── documentation/             # arquitetura e matemática
└── .github/                   # CI, Pages, segurança e Copilot
```

Pesos de modelos, ambientes virtuais e experimentos locais antigos são deliberadamente excluídos. Isso mantém o clone leve, auditável e dentro dos limites do GitHub.

## GitHub Copilot

O repositório contém [`.github/copilot-instructions.md`](.github/copilot-instructions.md) e instruções específicas por linguagem. Assim, o Copilot Chat, code review e cloud agent recebem automaticamente a arquitetura, os comandos de teste e as regras de precisão deste projeto.

> O antigo **GitHub Models** foi encerrado pelo GitHub em 30 de julho de 2026. Por isso o app não depende de uma API aposentada nem expõe tokens no navegador.

## Contribua

Há espaço para novos datasets, visualizações, ativações, testes de gradiente, acessibilidade e documentação. Leia [CONTRIBUTING.md](CONTRIBUTING.md), escolha uma [issue](https://github.com/7dsolv/IA_Neural/issues) e envie um pull request.

Ao participar, você concorda com o [Código de Conduta](CODE_OF_CONDUCT.md). Vulnerabilidades devem seguir [SECURITY.md](SECURITY.md), sem issue pública.

## Licença

Distribuído sob a [Licença MIT](LICENSE). A arte `neural-core-hero-v1.png` foi criada especificamente para este projeto e é distribuída junto dele sob a mesma licença.
