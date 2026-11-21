"use client";

import { Button, Stack } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  DocumentList,
  DocumentPreview,
  DocumentUploader,
  FileDownloadAction,
  ImageGallery,
  ImagePreview,
  ImageUploader,
} from "@/components/files";
import type { DocumentRef, EntityRef } from "@/modules/types";
import { DOCUMENTS, IMAGES, mockGetUrl, mockUpload } from "../fixtures";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const PLANTING_ENTITY: EntityRef = { type: "planting", id: "pl-0042", label: "Plantio PL-0042" };

export function ArquivosSection() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [doc, setDoc] = useState<DocumentRef | null>(null);
  const [docs, setDocs] = useState(DOCUMENTS);

  const openImage = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  return (
    <ShowcaseSection
      id="arquivos"
      title="Documentos e imagens"
      description="Módulo 6.7: fluxos distintos — imagens vão direto ao armazenamento por URL pré-assinada; documentos são privados e só o backend gera o acesso."
    >
      <Demo name="ImageUploader" importPath="@/components/files" description="JPG, PNG ou WEBP até 10 MB. Envie um .heic para ver o erro de formato.">
        <Variant label="Envio simulado com progresso e cancelamento">
          <ImageUploader label="Imagens do plantio" entity={PLANTING_ENTITY} upload={mockUpload} />
        </Variant>
      </Demo>

      <Demo name="ImageGallery" importPath="@/components/files" description="Proporção reservada e carregamento preguiçoso; clique abre a ImagePreview.">
        <VariantGrid min="420px">
          <Variant label="columns 3 · maxVisible 6" p="0" bg="transparent" borderWidth="0">
            <ImageGallery headingAs="h4"
              images={IMAGES}
              columns={3}
              maxVisible={6}
              onOpen={openImage}
              action={
                <Button size="sm" variant="outline">
                  <Plus aria-hidden="true" /> Adicionar
                </Button>
              }
            />
          </Variant>
          <Variant label="columns 4 · todas" p="0" bg="transparent" borderWidth="0">
            <ImageGallery headingAs="h4" images={IMAGES} columns={4} onOpen={openImage} />
          </Variant>
          <Variant label="Vazia" p="0" bg="transparent" borderWidth="0">
            <ImageGallery headingAs="h4" images={[]} emptyText="Nenhuma imagem enviada ainda." />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="ImagePreview" importPath="@/components/files" description="Setas do teclado navegam; Esc fecha e devolve o foco à miniatura de origem.">
        <Row>
          <Button variant="outline" onClick={() => openImage(3)}>
            Abrir imagem 4 de 8
          </Button>
        </Row>
        <ImagePreview
          images={IMAGES}
          index={previewIndex}
          onIndexChange={setPreviewIndex}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onDownload={() => undefined}
        />
      </Demo>

      <Demo name="DocumentUploader" importPath="@/components/files" description="PDF, DOCX ou XLSX até 20 MB; a categoria é obrigatória antes do envio.">
        <VariantGrid min="360px">
          <Variant label="Sem categoria (envio bloqueado)">
            <DocumentUploader entity={PLANTING_ENTITY} upload={mockUpload} />
          </Variant>
          <Variant label="Categoria inicial: nota fiscal">
            <DocumentUploader entity={PLANTING_ENTITY} upload={mockUpload} defaultCategory="nota_fiscal" />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="DocumentList" importPath="@/components/files">
        <VariantGrid min="420px">
          <Variant label="Com exclusão · 1 sem permissão" p="0" bg="transparent" borderWidth="0">
            <DocumentList
              documents={docs}
              getUrl={mockGetUrl}
              onPreview={setDoc}
              canDelete
              onDelete={(d) => setDocs((all) => all.filter((x) => x.id !== d.id))}
              isAuthorized={(d) => d.category !== "laudo"}
            />
          </Variant>
          <Variant label="Vazia" p="0" bg="transparent" borderWidth="0">
            <DocumentList documents={[]} getUrl={mockGetUrl} emptyText="Nenhum documento anexado." />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="DocumentPreview" importPath="@/components/files" description="Drawer lateral com metadados; abre pelo menu “Visualizar” da lista.">
        <Row>
          <Button variant="outline" onClick={() => setDoc(DOCUMENTS[1])}>
            Visualizar “{DOCUMENTS[1].name}”
          </Button>
        </Row>
        <DocumentPreview document={doc} open={doc != null} onOpenChange={(o) => !o && setDoc(null)} getUrl={mockGetUrl} />
      </Demo>

      <Demo name="FileDownloadAction" importPath="@/components/files" description="O link é pedido ao backend só no clique; o motivo de um bloqueio aparece em texto.">
        <VariantGrid>
          <Variant label="Padrão">
            <FileDownloadAction fileId="doc-1" kind="document" getUrl={mockGetUrl} fileName={DOCUMENTS[0].name} />
          </Variant>
          <Variant label="mode open">
            <FileDownloadAction fileId="doc-1" kind="document" getUrl={mockGetUrl} mode="open" variant="outline" />
          </Variant>
          <Variant label="Sem permissão">
            <FileDownloadAction fileId="doc-2" kind="document" getUrl={mockGetUrl} authorized={false} />
          </Variant>
          <Variant label="iconOnly · autorizado e bloqueado">
            <Stack direction="row" gap="2">
              <FileDownloadAction fileId="im-4" kind="image" getUrl={mockGetUrl} iconOnly fileName="matriz_m07.jpg" />
              <FileDownloadAction fileId="doc-2" kind="document" getUrl={mockGetUrl} iconOnly authorized={false} />
            </Stack>
          </Variant>
        </VariantGrid>
      </Demo>
    </ShowcaseSection>
  );
}
