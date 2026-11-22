"use client";

import { Input, SimpleGrid, Stack } from "@chakra-ui/react";
import { Calendar, Hash, Sprout, Sun, Moon, Trees } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/forms/checkbox";
import { CheckboxGroup } from "@/components/forms/checkbox-group";
import { DatePicker } from "@/components/forms/date-picker";
import { DateRangePicker, type DateRangeValue } from "@/components/forms/date-range-picker";
import { FileUpload } from "@/components/forms/file-upload";
import { FormErrorSummary } from "@/components/forms/form-error-summary";
import { FormField } from "@/components/forms/form-field";
import { FormFieldset } from "@/components/forms/form-fieldset";
import { InputGroup } from "@/components/forms/input-group";
import { MultiCombobox } from "@/components/forms/multi-combobox";
import { NativeSelectField } from "@/components/forms/native-select-field";
import { NumberInput } from "@/components/forms/number-input";
import { PasswordInput } from "@/components/forms/password-input";
import { RadioCardGroup } from "@/components/forms/radio-card-group";
import { RadioGroup } from "@/components/forms/radio-group";
import { SearchField, type SearchResult } from "@/components/forms/search-field";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { Select } from "@/components/forms/select";
import { Slider } from "@/components/forms/slider";
import { Switch } from "@/components/forms/switch";
import { TextInput } from "@/components/forms/text-input";
import { Textarea } from "@/components/forms/textarea";
import type { FieldOption } from "@/components/forms/types";
import { Demo, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const SPECIES_OPTIONS: FieldOption[] = [
  { value: "manga", label: "Manga", description: "Mangifera indica" },
  { value: "caju", label: "Caju", description: "Anacardium occidentale" },
  { value: "acerola", label: "Acerola", description: "Malpighia emarginata" },
  { value: "goiaba", label: "Goiaba", description: "Psidium guajava" },
  { value: "maracuja", label: "Maracujá", description: "Passiflora edulis", disabled: true },
];

const AREA_OPTIONS: FieldOption[] = [
  { value: "a-01", label: "A-01 · Talhão Sul" },
  { value: "a-03", label: "A-03 · Talhão Norte" },
  { value: "a-05", label: "A-05 · Encosta" },
  { value: "a-07", label: "A-07 · Viveiro" },
];

const SEARCH_RESULTS: SearchResult[] = [
  { value: "acerola", label: "Acerola", description: "Malpighia emarginata" },
  { value: "brs366", label: "Cultivar BRS 366 Jaburu", description: "Acerola" },
  { value: "pl-0041", label: "Plantio PL-0041", description: "Acerola · A-01" },
];

export function FormulariosSection() {
  const [checked, setChecked] = useState(true);
  const [species, setSpecies] = useState<string[]>(["manga", "caju"]);
  const [radio, setRadio] = useState<string | null>("mudas");
  const [card, setCard] = useState<string | null>("mudas");
  const [switchOn, setSwitchOn] = useState(true);
  const [period, setPeriod] = useState<string | null>("12m");
  const [view, setView] = useState<string | null>("dia");
  const [density, setDensity] = useState([280]);
  const [range, setRange] = useState([2, 5]);
  const [search, setSearch] = useState("Acer");
  const [multi, setMulti] = useState<string[]>(["manga", "acerola"]);
  const [date, setDate] = useState<string | null>("2026-03-12");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ start: "2026-10-22", end: "2026-11-20", preset: "custom" });

  return (
    <ShowcaseSection
      id="formularios"
      title="Formulários"
      description="Todos os controles seguem o contrato FieldBaseProps: rótulo sempre visível, ajuda, erro com ícone, obrigatório (*), opcional, desabilitado e somente leitura."
    >
      <Demo name="TextInput" importPath="@/components/forms/text-input">
        <VariantGrid>
          <Variant label="Padrão">
            <TextInput label="Nome do plantio" placeholder="ex.: Manga Talhão Norte" />
          </Variant>
          <Variant label="Obrigatório + ajuda">
            <TextInput label="Código do lote" required helperText="Formato LM-AAAA-NNN." defaultValue="LM-2026-014" />
          </Variant>
          <Variant label="Opcional">
            <TextInput label="Procedência" optional placeholder="Viveiro ou fornecedor" />
          </Variant>
          <Variant label="Erro">
            <TextInput label="Comprimento" required unit="m" defaultValue="0" errorText="Informe um valor maior que zero." />
          </Variant>
          <Variant label="Desabilitado">
            <TextInput label="Área calculada" disabled defaultValue="24.000 m²" />
          </Variant>
          <Variant label="Somente leitura">
            <TextInput label="Plantio" readOnly defaultValue="PL-0042" />
          </Variant>
          <Variant label="Addons e ícone">
            <TextInput label="Lote" startAddon="LM-" endAddon="2026" startElement={<Hash size={16} />} defaultValue="014" />
          </Variant>
          <Variant label="size lg">
            <TextInput label="Busca rápida" size="lg" placeholder="Digite o código" />
          </Variant>
          <Variant label="Horizontal (md+)">
            <TextInput label="Largura" orientation="horizontal" unit="m" defaultValue="80" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Textarea" importPath="@/components/forms/textarea">
        <VariantGrid>
          <Variant label="Com contador">
            <Textarea label="Observações" optional maxLength={500} showCount placeholder="Detalhes do manejo, vistorias…" />
          </Variant>
          <Variant label="Erro">
            <Textarea label="Motivo do encerramento" required errorText="Descreva o motivo." />
          </Variant>
          <Variant label="Desabilitado">
            <Textarea label="Características" disabled defaultValue="Registre atributos agronômicos relevantes." />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="PasswordInput" importPath="@/components/forms/password-input">
        <VariantGrid>
          <Variant label="Oculta">
            <PasswordInput label="Senha" required defaultValue="fruti2026" />
          </Variant>
          <Variant label="Visível">
            <PasswordInput label="Senha" defaultVisible defaultValue="fruti2026" />
          </Variant>
          <Variant label="Erro">
            <PasswordInput label="Senha" errorText="Senha incorreta." defaultValue="123" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="NumberInput" importPath="@/components/forms/number-input">
        <VariantGrid>
          <Variant label="Com unidade">
            <NumberInput label="Quantidade de plantas" required unit="plantas" min={1} defaultValue="480" />
          </Variant>
          <Variant label="Sem stepper">
            <NumberInput label="Comprimento" unit="m" hideStepper defaultValue="300" />
          </Variant>
          <Variant label="Erro">
            <NumberInput label="Quantidade" unit="mudas" errorText="Quantidade excede as 20 mudas do lote." defaultValue="500" />
          </Variant>
          <Variant label="Desabilitado">
            <NumberInput label="Densidade" unit="pl/ha" disabled defaultValue="200" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="InputGroup" importPath="@/components/forms/input-group">
        <VariantGrid>
          <Variant label="Addon à direita">
            <InputGroup label="Largura" endAddon="m">
              <Input defaultValue="80" inputMode="decimal" />
            </InputGroup>
          </Variant>
          <Variant label="Elemento à esquerda">
            <InputGroup label="Data de recebimento" startElement={<Calendar size={16} />}>
              <Input placeholder="dd/mm/aaaa" />
            </InputGroup>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="SearchField" importPath="@/components/forms/search-field">
        <VariantGrid min="320px">
          <Variant label="Com atalho">
            <SearchField placeholder="Buscar espécies" shortcut="Ctrl K" />
          </Variant>
          <Variant label="Com resultados">
            <SearchField
              label="Buscar espécies"
              value={search}
              onValueChange={setSearch}
              results={search ? SEARCH_RESULTS : undefined}
              resultsSummary="3 resultados em espécies, cultivares e plantios"
            />
          </Variant>
          <Variant label="Carregando">
            <SearchField defaultValue="Manga" loading />
          </Variant>
          <Variant label="Rótulo visível + desabilitado">
            <SearchField label="Buscar plantios" showLabel disabled />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Select" importPath="@/components/forms/select">
        <VariantGrid>
          <Variant label="Com descrição e item desabilitado">
            <Select label="Espécie" required options={SPECIES_OPTIONS} placeholder="Selecione a espécie" />
          </Variant>
          <Variant label="Grupos + limpar">
            <Select
              label="Área"
              clearable
              defaultValue="a-03"
              options={[
                { value: "a-03", label: "A-03 · Talhão Norte", group: "Com plantio em campo" },
                { value: "a-05", label: "A-05 · Encosta", group: "Com plantio em campo" },
                { value: "a-07", label: "A-07 · Viveiro", group: "Sem plantio em campo" },
              ]}
            />
          </Variant>
          <Variant label="Erro">
            <Select label="Lote" required options={[]} errorText="Escolha um lote com mudas disponíveis." />
          </Variant>
          <Variant label="Desabilitado">
            <Select label="Cultivar" optional disabled options={[]} placeholder="Selecione uma espécie primeiro" helperText="A lista depende da espécie escolhida." />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="NativeSelectField" importPath="@/components/forms/native-select-field">
        <VariantGrid>
          <Variant label="Padrão">
            <NativeSelectField label="Área" options={AREA_OPTIONS} placeholder="Todas as áreas" />
          </Variant>
          <Variant label="Erro">
            <NativeSelectField label="Categoria" required options={[]} placeholder="Selecione…" errorText="Escolha a categoria do documento." />
          </Variant>
          <Variant label="Desabilitado">
            <NativeSelectField label="Espécie" disabled options={SPECIES_OPTIONS} defaultValue="manga" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="MultiCombobox" importPath="@/components/forms/multi-combobox">
        <VariantGrid min="320px">
          <Variant label="Múltipla escolha">
            <MultiCombobox label="Espécies" options={SPECIES_OPTIONS} value={multi} onValueChange={setMulti} emptyText="Nenhuma espécie encontrada." />
          </Variant>
          <Variant label="Erro">
            <MultiCombobox label="Áreas" required options={AREA_OPTIONS} errorText="Selecione ao menos uma área." />
          </Variant>
          <Variant label="Desabilitado">
            <MultiCombobox label="Áreas" disabled options={AREA_OPTIONS} defaultValue={["a-03"]} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Checkbox · CheckboxGroup" importPath="@/components/forms/checkbox">
        <VariantGrid>
          <Variant label="Estados">
            <Stack gap="3">
              <Checkbox label="Incluir encerrados" description="Mostra plantios já finalizados." checked={checked} onCheckedChange={setChecked} />
              <Checkbox label="Seleção parcial" checked="indeterminate" />
              <Checkbox label="Desabilitado" disabled />
              <Checkbox label="Marcado e desabilitado" defaultChecked disabled />
              <Checkbox label="Aceito os termos" errorText="Confirme para continuar." />
            </Stack>
          </Variant>
          <Variant label="Grupo com marcar todos">
            <CheckboxGroup label="Espécies" selectAllLabel="Todas" options={SPECIES_OPTIONS.slice(0, 4)} value={species} onValueChange={setSpecies} />
          </Variant>
          <Variant label="Grupo horizontal com erro">
            <CheckboxGroup
              label="Tipo de evento"
              required
              orientation="horizontal"
              errorText="Escolha ao menos um tipo."
              options={[
                { value: "status", label: "Status" },
                { value: "plantas", label: "Plantas" },
                { value: "arquivos", label: "Arquivos" },
              ]}
            />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="RadioGroup · RadioCardGroup" importPath="@/components/forms/radio-group">
        <VariantGrid>
          <Variant label="Vertical com descrição">
            <RadioGroup
              label="Tipo de material"
              value={radio}
              onValueChange={setRadio}
              options={[
                { value: "mudas", label: "Mudas", description: "Desenvolvidas em viveiro" },
                { value: "sementes", label: "Sementes", description: "Semeadura direta" },
                { value: "estaca", label: "Estacas", disabled: true },
              ]}
            />
          </Variant>
          <Variant label="Horizontal">
            <RadioGroup
              label="Controle"
              orientation="horizontal"
              defaultValue="misto"
              options={[
                { value: "individual", label: "Individual" },
                { value: "agrupado", label: "Agrupado" },
                { value: "misto", label: "Misto" },
              ]}
            />
          </Variant>
          <Variant label="Erro">
            <RadioGroup label="Ciclo" required errorText="Escolha o ciclo da espécie." options={[{ value: "perene", label: "Perene" }, { value: "anual", label: "Anual" }]} />
          </Variant>
        </VariantGrid>
        <Variant label="RadioCardGroup">
          <RadioCardGroup
            label="Tipo de material"
            required
            value={card}
            onValueChange={setCard}
            columns={{ base: 1, md: 3 }}
            options={[
              { value: "mudas", label: "Mudas", description: "Desenvolvidas em viveiro", icon: <Sprout size={20} /> },
              { value: "sementes", label: "Sementes", description: "Semeadura direta", icon: <Trees size={20} /> },
              { value: "estacas", label: "Estacas", description: "Indisponível neste plantio", disabled: true },
            ]}
          />
        </Variant>
      </Demo>

      <Demo name="Switch" importPath="@/components/forms/switch">
        <VariantGrid>
          <Variant label="Rótulo à esquerda (padrão)">
            <Switch label="Mostrar encerrados" description="Inclui plantios encerrados e cancelados." checked={switchOn} onCheckedChange={setSwitchOn} />
          </Variant>
          <Variant label="Rótulo à direita">
            <Switch label="Notificar estoque baixo" labelPosition="end" defaultChecked />
          </Variant>
          <Variant label="Desabilitado + erro">
            <Stack gap="3">
              <Switch label="Sincronizar offline" disabled />
              <Switch label="Aceitar alterações" errorText="Obrigatório para salvar." />
            </Stack>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="SegmentedControl" importPath="@/components/forms/segmented-control">
        <VariantGrid min="320px">
          <Variant label="Texto">
            <SegmentedControl
              label="Período"
              value={period}
              onValueChange={setPeriod}
              items={[
                { value: "30d", label: "30 dias" },
                { value: "12m", label: "12 meses" },
                { value: "safra", label: "Safra" },
                { value: "custom", label: "Personalizado" },
              ]}
            />
          </Variant>
          <Variant label="Só ícones (fullWidth false)">
            <SegmentedControl
              label="Turno"
              fullWidth={false}
              value={view}
              onValueChange={setView}
              items={[
                { value: "dia", icon: <Sun size={16} />, ariaLabel: "Dia" },
                { value: "noite", icon: <Moon size={16} />, ariaLabel: "Noite" },
              ]}
            />
          </Variant>
          <Variant label="Rótulo visível + item desabilitado">
            <SegmentedControl
              label="Modo"
              showLabel
              defaultValue="grupo"
              items={[
                { value: "grupo", label: "Grupo" },
                { value: "individual", label: "Individual" },
                { value: "lote", label: "Lote", disabled: true },
              ]}
            />
          </Variant>
          <Variant label="Desabilitado">
            <SegmentedControl label="Visualização" disabled defaultValue="tabela" items={[{ value: "tabela", label: "Tabela" }, { value: "grade", label: "Grade" }]} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="Slider" importPath="@/components/forms/slider">
        <VariantGrid min="320px">
          <Variant label="Valor único com marcas">
            <Slider
              label="Densidade"
              value={density}
              onValueChange={setDensity}
              min={50}
              max={500}
              step={10}
              formatValue={(v) => `${v} pl/ha`}
              marks={[50, 200, 350, 500]}
            />
          </Variant>
          <Variant label="Intervalo">
            <Slider label="Tamanho da área" value={range} onValueChange={setRange} min={0} max={6} step={0.2} formatValue={(v) => `${v.toLocaleString("pt-BR")} ha`} />
          </Variant>
          <Variant label="Desabilitado">
            <Slider label="Limite de estoque baixo" disabled defaultValue={[10]} formatValue={(v) => `${v}%`} />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="DatePicker · DateRangePicker" importPath="@/components/forms/date-picker">
        <VariantGrid min="320px">
          <Variant label="DatePicker">
            <DatePicker label="Data de plantio" required value={date} onValueChange={setDate} max="2026-12-31" />
          </Variant>
          <Variant label="DatePicker · erro">
            <DatePicker label="Data de recebimento" required errorText="Informe a data de recebimento." />
          </Variant>
          <Variant label="DatePicker · desabilitado">
            <DatePicker label="Cadastrada em" disabled defaultValue="2026-01-02" />
          </Variant>
          <Variant label="DateRangePicker com comparação">
            <DateRangePicker label="Período" value={dateRange} onValueChange={setDateRange} showComparison />
          </Variant>
          <Variant label="DateRangePicker · vazio">
            <DateRangePicker label="Período do relatório" placeholder="Selecione o período" helperText="Use um atalho ou escolha as datas." />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="FileUpload" importPath="@/components/forms/file-upload">
        <VariantGrid min="320px">
          <Variant label="Imagens com progresso e erro">
            <FileUpload
              label="Imagens do plantio"
              accept={["image/jpeg", "image/png", "image/webp"]}
              maxFiles={5}
              hint="JPG, PNG ou WEBP · até 10 MB cada"
              triggerLabel="Selecione imagens"
              items={[
                { id: "1", name: "vistoria_linha_03.jpg", progress: 64, status: "uploading", kind: "image" },
                { id: "2", name: "matriz_m07.heic", status: "error", error: "Formato não aceito. Converta para JPG ou PNG.", kind: "image" },
                { id: "3", name: "floracao.jpg", status: "done", kind: "image" },
              ]}
            />
          </Variant>
          <Variant label="Documento obrigatório">
            <FileUpload label="Nota fiscal" required accept={["application/pdf"]} hint="PDF · até 20 MB" triggerLabel="Selecione um documento" />
          </Variant>
          <Variant label="Erro + desabilitado">
            <Stack gap="4">
              <FileUpload label="Croqui" errorText="Envie o croqui do plantio." hint="PDF ou imagem" />
              <FileUpload label="Laudo" disabled hint="Seu perfil não pode enviar arquivos." />
            </Stack>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="FormField · FormFieldset" importPath="@/components/forms/form-field" description="FormField envolve qualquer controle; FormFieldset agrupa campos com legenda.">
        <VariantGrid min="340px">
          <Variant label="Vertical (padrão)">
            <FormField label="Código" required helperText="Gerado automaticamente se vazio." helperEnd="0 / 12">
              <Input placeholder="PL-0000" />
            </FormField>
          </Variant>
          <Variant label="Horizontal">
            <Stack gap="3">
              <FormField label="Comprimento" orientation="horizontal" required>
                <Input defaultValue="300" />
              </FormField>
              <FormField label="Largura" orientation="horizontal" errorText="Informe uma largura maior que 0.">
                <Input defaultValue="0" />
              </FormField>
            </Stack>
          </Variant>
          <Variant label="Fieldset">
            <FormFieldset legend="Dimensões da área retangular" required helperText="Medidas em metros.">
              <SimpleGrid columns={2} gap="3">
                <TextInput label="Comprimento" unit="m" defaultValue="300" />
                <TextInput label="Largura" unit="m" defaultValue="80" />
              </SimpleGrid>
            </FormFieldset>
          </Variant>
          <Variant label="Fieldset com erro">
            <FormFieldset legend="Origem do material" errorText="Escolha o tipo de material.">
              <TextInput label="Lote" defaultValue="" placeholder="LM-2026-…" />
            </FormFieldset>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="FormErrorSummary" importPath="@/components/forms/form-error-summary" description="Recebe o foco após envio com erro; cada item leva ao campo.">
        <VariantGrid min="340px">
          <Variant label="Dois erros">
            <FormErrorSummary
              focusOnMount={false}
              errors={[
                { fieldId: "quantidade", message: "Quantidade excede as 500 mudas do lote" },
                { fieldId: "data-plantio", message: "Informe a data de plantio" },
              ]}
            />
          </Variant>
          <Variant label="Título personalizado">
            <FormErrorSummary focusOnMount={false} title="Não foi possível salvar o lote" errors={[{ fieldId: "codigo", message: "Código já usado em outro lote" }]} />
          </Variant>
        </VariantGrid>
      </Demo>
    </ShowcaseSection>
  );
}
