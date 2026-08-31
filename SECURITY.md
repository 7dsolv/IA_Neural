# Política de segurança

## Versões suportadas

A branch `main` e a versão publicada no GitHub Pages recebem correções de segurança.

## Relatar vulnerabilidade

Não abra uma issue pública. Use **Security → Report a vulnerability** no repositório:

https://github.com/7dsolv/IA_Neural/security/advisories/new

Inclua o componente afetado, passos para reproduzir, impacto estimado e uma sugestão de correção, se houver. Evite anexar tokens, dados pessoais ou material de terceiros.

O recebimento será confirmado assim que possível. Depois da validação, a correção será preparada de forma privada e divulgada com crédito ao pesquisador, se ele desejar.

## Escopo

São relevantes, entre outros:

- execução de script não esperado no site;
- exposição de dados ou credenciais;
- vulnerabilidade no Service Worker ou cache;
- alteração maliciosa do artefato publicado;
- falha que permita snapshot adulterado ser tratado como confiável.

Resultados matemáticos imprecisos sem impacto de segurança podem ser relatados como bug normal.
