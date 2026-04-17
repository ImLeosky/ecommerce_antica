# Guía para Crear Secciones/Componentes CMS

Este documento explica cómo crear nuevas secciones o componentes en el Storefront y hacer que el Admin las detecte automáticamente mediante el script `cms-sync.mjs`.

## ¿Cómo funciona el script?

El script `scripts/cms-sync.mjs` escanea los archivos del Storefront en busca de:

1. Llamadas a `getCmsMedia()` → Detecta slots de imágenes (actualiza `mediaSlots`)
2. Llamadas a `getCmsText()` → Detecta slots de texto (actualiza `textsSlots`)

El script busca **anotaciones** en los comentarios justo antes de cada llamada para determinar el grupo, label y tipo.

---

## Tipos de Datos Soportados

### 1. Imágenes (getCmsMedia)

```typescript
import { getCmsMedia } from "@/lib/cms";

// Imagen individual (single)
const imagen = (await getCmsMedia("mi_slot", "/ruta/fallback.jpg")) as string;

// Galería de imágenes (gallery)
const imagenes = (await getCmsMedia("mi_galeria", [
  "/img1.jpg",
  "/img2.jpg",
])) as string[];
```

### 2. Textos (getCmsText)

```typescript
import { getCmsText } from "@/lib/cms";

const texto = (await getCmsText("mi_texto", "Texto por defecto")) as string;
```

**Nota**: Los slots de texto se detectan automáticamente y se agregan a `textsSlots` en el schema. Para que aparezcan en **CMS > Texts** en el admin, deben agregarse manualmente a `apps/admin/app/[locale]/(dashboard)/cms/texts/baseDictionary.ts` bajo la sección correspondiente (ej. `About`), tanto en `baseDictionaryEs` como `baseDictionaryEn`. El admin usa este diccionario base para mostrar los campos editables.

---

## Anotaciones CMS

Las anotaciones deben estar en un comentario justo **antes** de la llamada a la función (hasta 3 líneas atrás).

### Formato

```typescript
// @cms-group "Nombre del Grupo" @cms-label "Etiqueta Legible" @cms-type tipo
```

### Parámetros

| Parámetro    | Descripción                       | Valores posibles    |
| ------------ | --------------------------------- | ------------------- |
| `@cms-group` | Grupo en el Admin donde aparecerá | Cualquier texto     |
| `@cms-label` | Nombre visible en el formulario   | Cualquier texto     |
| `@cms-type`  | Tipo de dato (solo para imágenes) | `single`, `gallery` |

### Ejemplos

```typescript
// Imagen individual
// @cms-group "Home Page" @cms-label "Hero Principal" @cms-type single
const heroImage = (await getCmsMedia("home_hero", "/default.jpg")) as string;

// Galería de imágenes
// @cms-group "Home Page" @cms-label "Galería del Slider" @cms-type gallery
const sliderImages = (await getCmsMedia("home_slider", [
  "/img1.jpg",
])) as string[];

// Texto
// @cms-group "Footer" @cms-label "Dirección de la tienda"
const address = (await getCmsText(
  "footer_address",
  "Pitalito, Huila",
)) as string;
```

---

## Ejemplo Completo

### 1. Crear el componente en el Storefront

```typescript
// apps/storefront/components/Hero/Hero.tsx

import { getCmsMedia, getCmsText } from "@/lib/cms";
import Image from "next/image";

export default async function Hero() {
  // @cms-group "Home Page" @cms-label "Imagen del Hero" @cms-type single
  const heroImage = (await getCmsMedia("home_hero", "/hero-default.jpg")) as string;

  // @cms-group "Home Page" @cms-label "Título Principal"
  const title = (await getCmsText("hero_title", "Bienvenido a nuestra tienda")) as string;

  return (
    <section>
      <Image src={heroImage} alt="Hero" width={1920} height={600} />
      <h1>{title}</h1>
    </section>
  );
}
```

### 2. Ejecutar el script de sincronización

```bash
npm run cms:sync
```

Esto actualiza `packages/cms-config/schema.json` con los nuevos slots detectados.

### 3. Verificar en el Admin

Los nuevos campos aparecerán en:

- **CMS > Media** → Para imágenes (`getCmsMedia`), usando el schema actualizado
- **CMS > Texts** → Para textos (`getCmsText`), después de agregar al `baseDictionary.ts`

Los slots de texto se almacenan en `textsSlots` en el schema y se gestionan por separado de los medios.

---

## Notas Importantes

1. **El script solo detecta funciones que ya existen**: No crea nuevas funciones, solo detecta las llamadas a `getCmsMedia` y `getCmsText` que ya están en el código.

2. **Valores por defecto**: El segundo argumento de las funciones es el valor por defecto que se usa si no hay datos en la base de datos.

3. **No editar schema.json manualmente**: El archivo se genera automáticamente. Usa las anotaciones para configurar los slots.

4. **Fallback para imágenes**:
   - `single`: Usar una ruta como `"/imagen.jpg"`
   - `gallery`: Usar un array como `["/img1.jpg", "/img2.jpg"]`

5. **El grupo "Auto-descubiertos"**: Si no especificas `@cms-group`, el slot aparecerá en este grupo.

6. **Eliminar textos no usados**: Si cambias el componente y dejas de usar ciertos `getCmsText`, remueve las entradas correspondientes de `baseDictionary.ts` para que no aparezcan en el admin. Los datos antiguos en la base de datos permanecerán pero no serán editables.

---

## Estructura de Archivos

```
antica_ecommerce/
├── apps/
│   ├── admin/           # Panel de administración
│   │   └── app/[locale]/(dashboard)/cms/
│   │       ├── media/   # Configuración de imágenes
│   │       └── texts/   # Configuración de textos
│   └── storefront/      # Tienda online
│       ├── components/ # Componentes reutilizables
│       ├── app/        # Páginas
│       └── lib/cms.ts  # Funciones getCmsMedia y getCmsText
├── packages/
│   └── cms-config/
│       └── schema.json # Generado automáticamente
├── scripts/
│   └── cms-sync.mjs    # Script de detección
└── package.json
```

---

## Comandos Útiles

```bash
# Sincronizar slots del CMS
npm run cms:sync

# Iniciar desarrollo (incluye sync automáticamente)
npm run dev
```

---

## Solución de Problemas

### El slot no aparece en el Admin

- **Para imágenes**: Verifica que las anotaciones estén en el formato correcto, el comentario esté justo antes de la llamada a `getCmsMedia`, y ejecuta `npm run cms:sync` para actualizar el schema
- **Para textos**: Además de las anotaciones y `npm run cms:sync`, agrega el slot manualmente a `apps/admin/app/[locale]/(dashboard)/cms/texts/baseDictionary.ts` en `baseDictionaryEs` y `baseDictionaryEn` bajo la sección apropiada (ej. `About`)

### Error "Invalid 'pb' parameter" en Google Maps

- El enlace de embed de Google Maps caduca con el tiempo
- Para actualizar, ve a Google Maps > Compartir > Insertar un mapa > Copiar HTML
- Copia solo la URL del `src`, no el código HTML completo
