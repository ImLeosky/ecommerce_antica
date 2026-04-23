#!/usr/bin/env node
/**
 * cms-sync.mjs
 *
 * Escanea el Storefront en busca de llamadas a getCmsMedia() y getCmsText()
 * con anotaciones de CMS y actualiza packages/cms-config/schema.json
 * para que el Admin panel refleje todos los slots disponibles.
 *
 * Anotaciones soportadas (en comentario justo antes de la llamada):
 *   // @cms-group "Nombre del Grupo"  @cms-label "Etiqueta Legible"  @cms-type gallery
 *   const img = await getCmsMedia('mi_slot', '/default.jpg')
 *
 *   // @cms-group "Home"  @cms-label "Título Principal"
 *   const title = await getCmsText('hero_title', 'Título por defecto')
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const STOREFRONT_DIR = join(ROOT, "apps", "storefront");
const SCHEMA_PATH = join(ROOT, "packages", "cms-config", "schema.json");

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Recorre recursivamente un directorio devolviendo rutas de archivos .ts/.tsx */
function walkDir(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      // Ignorar node_modules, .next, etc.
      if (!["node_modules", ".next", ".turbo", "dist"].includes(name)) {
        walkDir(full, files);
      }
    } else if ([".ts", ".tsx"].includes(extname(name))) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Extrae anotaciones CMS de una línea de comentario.
 * Soporta: @cms-group "X"  @cms-label "Y"  @cms-type gallery|single
 */
function parseAnnotation(line) {
  const groupMatch = line.match(/@cms-group\s+"([^"]+)"/);
  const labelMatch = line.match(/@cms-label\s+"([^"]+)"/);
  const typeMatch = line.match(/@cms-type\s+(\w+)/);
  return {
    group: groupMatch?.[1] ?? null,
    label: labelMatch?.[1] ?? null,
    type: typeMatch?.[1] ?? null,
  };
}

/** Extrae todos los slots de getCmsMedia de un archivo */
function extractMediaSlots(content, relPath) {
  const lines = content.split("\n");
  const found = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Buscar llamada a getCmsMedia(
    const mediaMatch = line.match(/getCmsMedia\s*\(/);
    if (!mediaMatch) continue;

    // Buscar la key en esta línea o las siguientes
    let key = null;
    let keyLine = i;
    for (let j = 0; j < 5 && keyLine + j < lines.length; j++) {
      const checkLine = lines[keyLine + j];
      const keyMatch = checkLine.match(/['"`]([^'"`]+)['"`]/);
      if (keyMatch) {
        key = keyMatch[1];
        break;
      }
    }
    if (!key) continue;

    // Buscar anotación en la línea anterior (o hasta 3 líneas atrás)
    let annotation = { group: null, label: null, type: null };
    for (let back = 1; back <= 3; back++) {
      const prev = lines[i - back];
      if (!prev) break;
      const trimmed = prev.trim();
      if (!trimmed.startsWith("//") && !trimmed.startsWith("*")) break;
      const parsed = parseAnnotation(trimmed);
      if (parsed.group || parsed.label || parsed.type) {
        annotation = parsed;
        break;
      }
    }

    found.push({
      key,
      label: annotation.label ?? keyToLabel(key),
      group: annotation.group ?? "Auto-descubiertos",
      type:
        annotation.type ??
        (key.includes("slider") || key.includes("gallery")
          ? "gallery"
          : "single"),
      source: "auto",
      file: relPath,
    });
  }
  return found;
}

/** Extrae todos los slots de getCmsText de un archivo */
function extractTextSlots(content, relPath) {
  const lines = content.split("\n");
  const found = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Buscar llamada a getCmsText(
    const textMatch = line.match(/getCmsText\s*\(/);
    if (!textMatch) continue;

    // Buscar la key en esta línea o las siguientes
    let key = null;
    let keyLine = i;
    for (let j = 0; j < 5 && keyLine + j < lines.length; j++) {
      const checkLine = lines[keyLine + j];
      const keyMatch = checkLine.match(/['"`]([^'"`]+)['"`]/);
      if (keyMatch) {
        key = keyMatch[1];
        break;
      }
    }
    if (!key) continue;

    // Buscar anotación en las líneas anteriores (o hasta 3 líneas atrás)
    let annotation = { group: null, label: null };
    for (let back = 1; back <= 3; back++) {
      const prev = lines[i - back];
      if (!prev) break;
      const trimmed = prev.trim();
      if (!trimmed.startsWith("//") && !trimmed.startsWith("*")) break;
      const parsed = parseAnnotation(trimmed);
      if (parsed.group || parsed.label) {
        annotation = parsed;
        break;
      }
    }

    found.push({
      key,
      label: annotation.label ?? keyToLabel(key),
      group: annotation.group ?? "Auto-descubiertos",
      source: "auto",
      file: relPath,
    });
  }
  return found;
}

/** Convierte una clave snake_case en un label legible */
function keyToLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function run() {
  console.log("\n🔍 CMS Sync: Escaneando Storefront...");

  // Leer esquema actual — strip BOM por si PowerShell escribió el archivo con UTF-8 BOM
  const rawSchema = readFileSync(SCHEMA_PATH, "utf-8").replace(/^\uFEFF/, "");
  const schema = JSON.parse(rawSchema);
  const existingMediaKeys = new Set(
    schema.mediaSlots.flatMap((g) => g.items.map((i) => i.key)),
  );
  const existingTextKeys = new Set(
    (schema.textsSlots || []).flatMap((g) => g.items.map((i) => i.key)),
  );

  // 2. Escanear archivos del Storefront
  const files = walkDir(STOREFRONT_DIR);
  let allMediaFound = [];
  let allTextFound = [];

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const rel = relative(STOREFRONT_DIR, file).replace(/\\/g, "/");

    if (content.includes("getCmsMedia")) {
      allMediaFound.push(...extractMediaSlots(content, rel));
    }

    if (content.includes("getCmsText")) {
      allTextFound.push(...extractTextSlots(content, rel));
    }
  }

  // 3. Detectar nuevos (no existentes en el esquema)
  const newMediaSlots = allMediaFound.filter(
    (s) => !existingMediaKeys.has(s.key),
  );
  const newTextSlots = allTextFound.filter((s) => !existingTextKeys.has(s.key));

  if (newMediaSlots.length === 0 && newTextSlots.length === 0) {
    console.log("✅ No hay nuevos slots. El esquema está actualizado.\n");
    return;
  }

  // 4. Agrupar los nuevos slots y agregarlos al esquema
  const processSlots = (slots, slotType, existingGroups) => {
    const groupMap = {};
    for (const slot of slots) {
      if (!groupMap[slot.group]) groupMap[slot.group] = [];
      const item = {
        key: slot.key,
        label: slot.label,
        source: "auto",
        file: slot.file,
      };
      if (slotType === "media") {
        item.type = slot.type;
      }
      groupMap[slot.group].push(item);
    }

    for (const [groupName, items] of Object.entries(groupMap)) {
      // Si el grupo ya existe en el esquema, agregar ahí
      const existing = existingGroups.find((g) => g.group === groupName);
      if (existing) {
        existing.items.push(...items);
      } else {
        // Crear nuevo grupo
        const group = {
          group: groupName,
          source: "auto",
          items,
        };
        existingGroups.push(group);
      }
      console.log(
        `  📦 Grupo "${groupName}" (${slotType}): ${items.length} slot(s) nuevo(s) → ${items.map((i) => i.key).join(", ")}`,
      );
    }
  };

  if (newMediaSlots.length > 0) {
    processSlots(newMediaSlots, "media", schema.mediaSlots);
  }

  if (newTextSlots.length > 0) {
    if (!schema.textsSlots) schema.textsSlots = [];
    processSlots(newTextSlots, "text", schema.textsSlots);
  }

  // 5. Actualizar version timestamp
  schema._lastSync = new Date().toISOString();

  // 6. Guardar
  writeFileSync(SCHEMA_PATH, JSON.stringify(schema, null, 2), "utf-8");
  console.log(
    `\n✅ schema.json actualizado con ${newMediaSlots.length} slot(s) de media y ${newTextSlots.length} slot(s) de texto nuevo(s).\n`,
  );
}

run();
