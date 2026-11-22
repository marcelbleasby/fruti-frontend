# Campos numéricos de quantidade e valor sobre o TextInput, não sobre o NumberInput

O `NumberInput` do design system, em pt-BR, arredonda o valor ao sair do campo para a precisão do `step` (1,5 vira 1; 10,5 some sem aviso) e mantém "1.5" como texto cru, que um leitor pt-BR entende como 15. Em estoque isso grava quantidade errada. Decidimos que os campos de quantidade, peso e dinheiro (estoque, processamentos, destinações, catálogo e as medidas de áreas e unidades de cultivo no `AreaMeasurementFields`) usam o `DecimalInput` (`src/components/forms/decimal-input.tsx`, no design system; o nome antigo `CampoNumero` ainda é reexportado), feito sobre o `TextInput`: a pessoa vê exatamente o que digitou, a leitura aceita "1,5", "1.5", "1.234,5" e "1.500", e o erro aparece como mensagem no campo em vez de o valor ser trocado em silêncio.

## Consequências

- Não trocar esses campos de volta pelo `NumberInput` sem antes corrigir o arredondamento e a leitura em pt-BR do componente.
- Esses campos não têm os botões de mais e menos do `NumberInput`.
- Se o `NumberInput` do design system for corrigido, esta decisão pode ser revista e o `DecimalInput` removido.
