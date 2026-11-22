"use client";

import { Box, Button, Field, Grid, Heading, Icon, Input, Link, Stack, Text, Textarea, chakra } from "@chakra-ui/react";
import { ChevronLeft, ExternalLink, LocateFixed } from "lucide-react";
import { useId, useState, type ClipboardEvent, type FormEvent, type ReactNode } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { FieldErrorMessage } from "@/components/forms/form-field";
import { Alert } from "@/components/feedback/alert";
import { Steps } from "@/components/navigation/steps";

export interface PropriedadeOnboardingValues {
  nome: string;
  descricao: string;
  /** Graus decimais; vírgula ou ponto. Vazio = sem localização. */
  latitude: string;
  longitude: string;
}

export type PropriedadeOnboardingFieldErrors = Partial<Record<keyof PropriedadeOnboardingValues, string>>;

export interface PropriedadeOnboardingFormProps {
  /** Pode devolver erros por campo da API; o formulário volta à etapa do campo. */
  onSubmit: (
    values: PropriedadeOnboardingValues,
  ) => void | PropriedadeOnboardingFieldErrors | Promise<void | PropriedadeOnboardingFieldErrors>;
  /** Nome para a saudação ("Olá, Ana!"). */
  userName?: string;
  /** Erro geral (ex.: serviço fora do ar). */
  error?: ReactNode;
  /** Ação "Sair" no rodapé, para quem entrou na conta errada. */
  onSignOut?: () => void;
  headingAs?: "h1" | "h2";
}

const STEP_FIELDS: (keyof PropriedadeOnboardingValues)[][] = [
  ["nome", "descricao"],
  ["latitude", "longitude"],
];

const COORD_PATTERN = /^-?\d{1,3}(?:[.,]\d+)?$/;
/** "‑23.55052, ‑46.633308" — formato que o Google Maps copia. */
const PAIR_PATTERN = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

const toNumber = (v: string) => Number(v.trim().replace(",", "."));

function validateCoord(limit: number, label: string) {
  return (v: string) => {
    if (!v) return true;
    if (!COORD_PATTERN.test(v) || Math.abs(toNumber(v)) > limit) {
      return `Informe a ${label} em graus decimais, entre -${limit} e ${limit}.`;
    }
    return true;
  };
}

const labelProps = { textStyle: "label", color: "fg" } as const;
const optional = (
  <Field.RequiredIndicator
    fallback={
      <Text as="span" color="fg.muted" fontWeight="400">
        (opcional)
      </Text>
    }
  />
);

function geolocationMessage(err: GeolocationPositionError) {
  if (err.code === err.PERMISSION_DENIED) {
    return "O navegador não liberou sua localização. Permita o acesso nas configurações do site ou digite as coordenadas.";
  }
  if (err.code === err.TIMEOUT) return "Demorou demais para obter sua localização. Tente de novo ou digite as coordenadas.";
  return "Não foi possível obter sua localização. Digite as coordenadas.";
}

/**
 * Primeiro acesso: cadastro da primeira Propriedade em duas etapas —
 * identificação (nome, descrição) e localização (opcional, latitude/longitude
 * em graus decimais, com "usar minha localização"). As duas etapas ficam
 * montadas (a inativa com `display: none`) para que erros da API possam focar o campo.
 */
export function PropriedadeOnboardingForm({
  onSubmit,
  userName,
  error,
  onSignOut,
  headingAs = "h1",
}: PropriedadeOnboardingFormProps) {
  const titleId = useId();
  const [step, setStep] = useState(0);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<PropriedadeOnboardingValues>({
    defaultValues: { nome: "", descricao: "", latitude: "", longitude: "" },
    mode: "onTouched",
  });
  const [latitude, longitude] = useWatch({ control, name: ["latitude", "longitude"] });

  const coordsOk =
    Boolean(latitude && longitude) &&
    validateCoord(90, "latitude")(latitude) === true &&
    validateCoord(180, "longitude")(longitude) === true;
  const mapUrl = coordsOk
    ? `https://www.openstreetmap.org/?mlat=${toNumber(latitude)}&mlon=${toNumber(longitude)}#map=16/${toNumber(latitude)}/${toNumber(longitude)}`
    : null;

  function goTo(next: number, field?: FieldPath<PropriedadeOnboardingValues>) {
    setStep(next);
    // Espera a etapa aparecer para focar.
    requestAnimationFrame(() => setFocus(field ?? STEP_FIELDS[next][0]));
  }

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSubmit(values);
    if (!fieldErrors) return;
    const entries = Object.entries(fieldErrors).filter(([, m]) => m) as [keyof PropriedadeOnboardingValues, string][];
    if (entries.length === 0) return;
    const firstStep = Math.min(...entries.map(([name]) => STEP_FIELDS.findIndex((f) => f.includes(name))));
    for (const [name, message] of entries) setError(name, { type: "server", message });
    goTo(firstStep, entries.find(([name]) => STEP_FIELDS[firstStep].includes(name))?.[0]);
  });

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (step === 0) {
      event.preventDefault();
      if (await trigger(STEP_FIELDS[0], { shouldFocus: true })) goTo(1);
      return;
    }
    await submit(event);
  }

  function fillCurrentLocation() {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Este navegador não informa localização. Digite as coordenadas.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        setValue("latitude", coords.latitude.toFixed(6), { shouldValidate: true, shouldDirty: true });
        setValue("longitude", coords.longitude.toFixed(6), { shouldValidate: true, shouldDirty: true });
      },
      (err) => {
        setLocating(false);
        setGeoError(geolocationMessage(err));
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }

  /** Colar "lat, long" (como o Google Maps copia) preenche os dois campos. */
  function handlePairPaste(event: ClipboardEvent<HTMLInputElement>) {
    const match = PAIR_PATTERN.exec(event.clipboardData.getData("text"));
    if (!match) return;
    event.preventDefault();
    setValue("latitude", match[1], { shouldValidate: true, shouldDirty: true });
    setValue("longitude", match[2], { shouldValidate: true, shouldDirty: true });
  }

  const bothOrNone = (other: keyof PropriedadeOnboardingValues, message: string) => (v: string) =>
    Boolean(v) === Boolean(getValues(other)) || message;

  return (
    <chakra.form
      noValidate
      aria-labelledby={titleId}
      onSubmit={handleFormSubmit}
      display="flex"
      flexDirection="column"
      gap="5"
      w="full"
      maxW="420px"
    >
      <Stack gap="1">
        <Heading as={headingAs} id={titleId} m="0" textStyle="heading.lg" color="fg.heading">
          {userName ? `Olá, ${userName}! Vamos cadastrar sua propriedade` : "Vamos cadastrar sua propriedade"}
        </Heading>
        <Text textStyle="body.sm" color="fg.muted">
          Áreas de cultivo, plantios e estoques ficam dentro dela. Dá para mudar tudo depois.
        </Text>
      </Stack>

      <Steps
        step={step}
        showNavigation={false}
        compactBelow={320}
        items={[
          { title: "Identificação" },
          { title: "Localização", description: "Opcional" },
        ]}
      />

      {error && <Alert status="error" title="Não foi possível cadastrar" description={error} />}

      {/* Etapa 1 — identificação */}
      <Stack gap="3.5" display={step === 0 ? "flex" : "none"}>
        <Field.Root invalid={Boolean(errors.nome)} required>
          <Field.Label {...labelProps}>Nome da propriedade</Field.Label>
          <Input
            placeholder="Ex.: Pomar Santa Clara"
            autoComplete="off"
            {...register("nome", {
              setValueAs: (v: string) => v.trim(),
              required: "Informe o nome da propriedade.",
              maxLength: { value: 255, message: "Use até 255 caracteres." },
            })}
          />
          {errors.nome?.message ? (
            <FieldErrorMessage>{errors.nome.message}</FieldErrorMessage>
          ) : (
            <Field.HelperText fontSize="sm" color="fg.muted" m="0">
              Como você e sua equipe chamam o lugar.
            </Field.HelperText>
          )}
        </Field.Root>

        <Field.Root invalid={Boolean(errors.descricao)}>
          <Field.Label {...labelProps}>Descrição {optional}</Field.Label>
          <Textarea
            rows={4}
            autoresize
            maxH="12lh"
            placeholder="O que é cultivado, tamanho aproximado, observações…"
            {...register("descricao", {
              setValueAs: (v: string) => v.trim(),
              maxLength: { value: 5000, message: "Use até 5000 caracteres." },
            })}
          />
          {errors.descricao?.message && <FieldErrorMessage>{errors.descricao.message}</FieldErrorMessage>}
        </Field.Root>

        <Button type="submit" w="full" h="11" mt="1">
          Continuar
        </Button>
      </Stack>

      {/* Etapa 2 — localização */}
      <Stack gap="3.5" display={step === 1 ? "flex" : "none"}>
        <Text textStyle="body.sm" color="fg.muted">
          Coordenadas da sede ou de um ponto central da propriedade. Deixe em branco para informar depois.
        </Text>

        <Box>
          <Button
            type="button"
            variant="outline"
            w="full"
            h="11"
            onClick={fillCurrentLocation}
            loading={locating}
            loadingText="Obtendo localização…"
          >
            <LocateFixed strokeWidth={1.75} aria-hidden />
            Usar minha localização atual
          </Button>
          {geoError && (
            <Text role="alert" mt="2" fontSize="sm" color="fg.warning">
              {geoError}
            </Text>
          )}
        </Box>

        <Grid templateColumns="1fr 1fr" gap="3.5">
          <Field.Root invalid={Boolean(errors.latitude)}>
            <Field.Label {...labelProps}>Latitude</Field.Label>
            <Input
              inputMode="decimal"
              autoComplete="off"
              placeholder="-23.550520"
              onPaste={handlePairPaste}
              {...register("latitude", {
                setValueAs: (v: string) => v.trim(),
                deps: ["longitude"],
                validate: {
                  formato: validateCoord(90, "latitude"),
                  par: bothOrNone("longitude", "Informe junto com a longitude."),
                },
              })}
            />
            {errors.latitude?.message && <FieldErrorMessage>{errors.latitude.message}</FieldErrorMessage>}
          </Field.Root>

          <Field.Root invalid={Boolean(errors.longitude)}>
            <Field.Label {...labelProps}>Longitude</Field.Label>
            <Input
              inputMode="decimal"
              autoComplete="off"
              placeholder="-46.633308"
              onPaste={handlePairPaste}
              {...register("longitude", {
                setValueAs: (v: string) => v.trim(),
                deps: ["latitude"],
                validate: {
                  formato: validateCoord(180, "longitude"),
                  par: bothOrNone("latitude", "Informe junto com a latitude."),
                },
              })}
            />
            {errors.longitude?.message && <FieldErrorMessage>{errors.longitude.message}</FieldErrorMessage>}
          </Field.Root>
        </Grid>

        <Text fontSize="sm" color="fg.muted" mt="-1.5">
          Graus decimais. Pode colar “latitude, longitude” direto do mapa.
          {mapUrl && (
            <>
              {" "}
              <Link
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                fontWeight="600"
                textDecoration="underline"
                textUnderlineOffset="4px"
                focusVisibleRing="outside"
              >
                Conferir no mapa
                <Icon as={ExternalLink} boxSize="3.5" strokeWidth={1.75} aria-hidden />
                <chakra.span srOnly> (abre em nova aba)</chakra.span>
              </Link>
            </>
          )}
        </Text>

        <Grid templateColumns="auto 1fr" gap="2.5" mt="1">
          <Button type="button" variant="outline" h="11" px="3.5" onClick={() => goTo(0)} disabled={isSubmitting}>
            <ChevronLeft strokeWidth={1.75} aria-hidden />
            Voltar
          </Button>
          <Button type="submit" h="11" loading={isSubmitting} loadingText="Cadastrando…">
            {latitude || longitude ? "Cadastrar propriedade" : "Cadastrar sem localização"}
          </Button>
        </Grid>
      </Stack>

      {onSignOut && (
        <Text fontSize="sm" color="fg.muted" textAlign="center">
          Entrou com a conta errada?{" "}
          <chakra.button
            type="button"
            onClick={onSignOut}
            fontWeight="600"
            color="primary"
            textDecoration="underline"
            textUnderlineOffset="4px"
            cursor="pointer"
            focusVisibleRing="outside"
          >
            Sair
          </chakra.button>
        </Text>
      )}
    </chakra.form>
  );
}
