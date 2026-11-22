# Propriedade atual guardada em cookie, não na URL

Todo dado da API é por Propriedade (`/propriedades/{id}/…`), e um usuário pode ter vínculo com várias. Decidimos guardar a **Propriedade atual** num cookie HttpOnly (`fruti_propriedade`), trocado pelo seletor da barra lateral, em vez de colocar o id na URL. Assim as rotas ficam curtas (`/plantios`, `/estoque-vegetal`), e o servidor lê o cookie e confere contra os vínculos do usuário antes de usar; se o cookie apontar para uma propriedade sem vínculo, vale a primeira da lista e o cookie é corrigido.

## Considered Options

- **Propriedade na URL (`/p/{id}/plantios`):** permitiria abrir propriedades diferentes em abas diferentes e compartilhar links entre propriedades, mas deixaria todas as rotas mais longas. Descartada por escolha de produto.

## Consequências

- Um link compartilhado abre na Propriedade atual de quem clica, não na de quem enviou.
- Todas as abas do navegador usam a mesma Propriedade atual; trocar numa troca em todas na próxima navegação.
- Telas que leem a Propriedade atual dependem de cookie e por isso renderizam por requisição, dentro de `<Suspense>`.
