# Matemática do Neural IA

## Notação

- $x \in \mathbb{R}^{2}$: vetor de entrada.
- $W_1 \in \mathbb{R}^{N \times 2}$ e $b_1 \in \mathbb{R}^{N}$: parâmetros da camada oculta.
- $W_2 \in \mathbb{R}^{1 \times N}$ e $b_2 \in \mathbb{R}$: parâmetros da saída.
- $y \in \{0,1\}$: classe correta.
- $\hat{y} \in (0,1)$: probabilidade prevista.
- $\eta > 0$: taxa de aprendizado.

## Forward pass

A pré-ativação oculta é:

$$
z_1 = W_1x + b_1
$$

A ativação `tanh` é aplicada elemento a elemento:

$$
h = \tanh(z_1)
$$

A camada de saída calcula:

$$
z_2 = W_2h + b_2
$$

$$
\hat{y} = \sigma(z_2) = \frac{1}{1 + e^{-z_2}}
$$

## Entropia cruzada binária

Para uma amostra:

$$
L(y,\hat{y}) = -\left[y\log(\hat{y}) + (1-y)\log(1-\hat{y})\right]
$$

Na implementação, $\hat{y}$ é limitado numericamente ao intervalo $[10^{-9}, 1-10^{-9}]$ antes do logaritmo. Isso evita infinito sem alterar a decisão observável.

## Gradientes

A combinação de sigmoid com entropia cruzada simplifica o gradiente da pré-ativação de saída:

$$
\frac{\partial L}{\partial z_2} = \hat{y} - y
$$

Logo:

$$
\frac{\partial L}{\partial W_2} = (\hat{y}-y)h^T
$$

$$
\frac{\partial L}{\partial b_2} = \hat{y}-y
$$

O gradiente propagado à camada oculta é:

$$
\frac{\partial L}{\partial h} = W_2^T(\hat{y}-y)
$$

Como:

$$
\frac{d}{dz}\tanh(z) = 1-\tanh^2(z)
$$

temos:

$$
\frac{\partial L}{\partial z_1} =
\frac{\partial L}{\partial h} \odot (1-h^2)
$$

onde $\odot$ representa multiplicação elemento a elemento.

Finalmente:

$$
\frac{\partial L}{\partial W_1} =
\frac{\partial L}{\partial z_1}x^T
$$

$$
\frac{\partial L}{\partial b_1} =
\frac{\partial L}{\partial z_1}
$$

## Atualização

Para cada parâmetro $\theta$:

$$
\theta \leftarrow \theta - \eta\frac{\partial L}{\partial \theta}
$$

O laboratório usa descida estocástica: atualiza após cada amostra e embaralha a ordem a cada época com um gerador determinado pela seed.

## Por que XOR exige não linearidade

Os pontos positivos de XOR ficam em quadrantes opostos. Nenhuma reta separa as duas classes no espaço original. A camada oculta com `tanh` cria novas coordenadas; a saída combina essas coordenadas para formar uma fronteira não linear.

## Critério reproduzível

Com a configuração padrão:

- seed: 7;
- camada oculta: 5 neurônios;
- taxa: 0,12;
- épocas: 1.500;

os testes JavaScript e Python exigem acurácia de 100% no conjunto XOR e perda final inferior a 0,02.
