"use client";

import createCache, { type EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { type ReactNode, useState } from "react";

interface InsertedStyle {
  name: string;
  isGlobal: boolean;
}

/**
 * Registry do Emotion para o App Router (padrão do guia "CSS-in-JS" do Next).
 *
 * Sem ele, o Emotion escreve `<style>` no meio do HTML do SSR, ao lado de cada
 * componente. Com Cache Components o Next envolve as rotas em `<Activity>`, e
 * essas tags extras quebram a hidratação, que entra em loop e trava a página.
 * Aqui os estilos de cada trecho renderizado vão para o `<head>` via
 * `useServerInsertedHTML`, e o HTML dos componentes fica igual no servidor e no cliente.
 */
export function EmotionRegistry({ children }: { children: ReactNode }) {
  const [registry] = useState(() => {
    const cache: EmotionCache = createCache({ key: "css" });
    cache.compat = true;
    const insert = cache.insert;
    let inserted: InsertedStyle[] = [];
    cache.insert = (...args) => {
      const [selector, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push({ name: serialized.name, isGlobal: !selector });
      }
      return insert(...args);
    };
    const flush = () => {
      const previous = inserted;
      inserted = [];
      return previous;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const entries = registry.flush();
    if (entries.length === 0) return null;
    const globals: { name: string; css: string }[] = [];
    let css = "";
    let names = "";
    for (const { name, isGlobal } of entries) {
      const rule = registry.cache.inserted[name];
      if (typeof rule !== "string") continue;
      if (isGlobal) globals.push({ name, css: rule });
      else {
        css += rule;
        names += ` ${name}`;
      }
    }
    return (
      <>
        {globals.map(({ name, css: rule }) => (
          <style
            key={name}
            data-emotion={`${registry.cache.key}-global ${name}`}
            dangerouslySetInnerHTML={{ __html: rule }}
          />
        ))}
        {css && <style data-emotion={`${registry.cache.key}${names}`} dangerouslySetInnerHTML={{ __html: css }} />}
      </>
    );
  });

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}
