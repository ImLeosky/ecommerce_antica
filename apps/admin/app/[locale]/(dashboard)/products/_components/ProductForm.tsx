"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { saveProduct } from "../actions";
import { toast } from "@repo/ui/toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProductForm({
  product,
  categories,
}: {
  product?: any;
  categories: any[];
}) {
  const [isPending, setIsPending] = useState(false);
  const [available, setAvailable] = useState(product?.available ?? true);
  const [buyable, setBuyable] = useState(product?.buyable ?? false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    if (product?.id) {
      formData.append("id", product.id);
    }
    formData.append("available", available.toString());
    formData.append("buyable", buyable.toString());

    try {
      await saveProduct(formData);
      toast.success(
        product?.id
          ? "Producto actualizado con éxito"
          : "Producto creado con éxito",
      );
    } catch (error) {
      if (
        (error instanceof Error && error.message.includes("NEXT_REDIRECT")) ||
        (error &&
          typeof error === "object" &&
          "digest" in error &&
          typeof (error as any).digest === "string" &&
          (error as any).digest.includes("NEXT_REDIRECT"))
      ) {
        toast.success(
          product?.id
            ? "Producto actualizado con éxito"
            : "Producto creado con éxito",
        );
        throw error;
      }
      toast.error("Error al guardar el producto");
      console.error(error);
      setIsPending(false);
    }
  };

  const handleBuyableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setBuyable(checked);
    if (checked) {
      setAvailable(true);
    }
  };

  const handleAvailableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAvailable(checked);
    if (!checked) {
      setBuyable(false);
    }
  };

  const nameEs = product?.name?.es || "";
  const nameEn = product?.name?.en || "";
  const descEs = product?.description?.es || "";
  const descEn = product?.description?.en || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Details */}
        <div className="space-y-8">
          <div className="border border-(--card-border) bg-(--card-bg) rounded-3xl p-8 space-y-6 shadow-[0_4px_20px_rgba(26,21,18,0.02)]">
            <h2
              className="text-2xl font-normal text-(--foreground)"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Información Básica
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name_es"
                  className="text-[10px] font-bold uppercase tracking-widest text-accent-gold/60 px-1"
                >
                  Nombre (ES)
                </Label>
                <Input
                  id="name_es"
                  name="name_es"
                  defaultValue={nameEs}
                  required
                  className="rounded-xl border-(--card-border) bg-(--background)"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="name_en"
                  className="text-[10px] font-bold uppercase tracking-widest text-accent-gold/60 px-1"
                >
                  Nombre (EN)
                </Label>
                <Input
                  id="name_en"
                  name="name_en"
                  defaultValue={nameEn}
                  required
                  className="rounded-xl border-(--card-border) bg-(--background)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-[10px] font-bold uppercase tracking-widest text-accent-gold/60 px-1"
                >
                  Precio (S/.)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={product?.price || ""}
                  required
                  className="rounded-xl border-(--card-border) bg-(--background)"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="category_id"
                  className="text-[10px] font-bold uppercase tracking-widest text-accent-gold/60 px-1"
                >
                  Categoría
                </Label>
                <select
                  id="category_id"
                  name="category_id"
                  defaultValue={product?.category_id || ""}
                  required
                  className="flex h-11 w-full rounded-xl border border-(--card-border) bg-(--background) px-4 py-2 text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-accent-gold/20 transition-all font-medium"
                >
                  <option value="" disabled>
                    Selecciona una categoría...
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name?.es || c.name?.en || "Unnamed"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-accent-gold/60 px-1">
                Disponibilidad
              </Label>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={available}
                    onChange={handleAvailableChange}
                    className="rounded border-(--card-border) bg-(--background)"
                  />
                  <Label htmlFor="available" className="text-sm font-medium">
                    Disponible (se muestra en menú y vista de productos)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="buyable"
                    checked={buyable}
                    onChange={handleBuyableChange}
                    disabled={!available}
                    className="rounded border-(--card-border) bg-(--background)"
                  />
                  <Label htmlFor="buyable" className="text-sm font-medium">
                    Comprable (se puede comprar desde la tienda)
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-accent-gold/60 px-1">
                  Descripción (ES)
                </Label>
                <RichTextEditor name="description_es" defaultValue={descEs} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-accent-gold/60 px-1">
                  Descripción (EN)
                </Label>
                <RichTextEditor name="description_en" defaultValue={descEn} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media */}
        <div className="space-y-8">
          <div className="border border-(--card-border) bg-(--card-bg) rounded-3xl p-8 shadow-[0_4px_20px_rgba(26,21,18,0.02)] space-y-6">
            <h2
              className="text-2xl font-normal text-(--foreground)"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Multimedia
            </h2>
            <p className="text-[10px] text-accent-gold/40 uppercase tracking-widest font-bold">
              Subir imágenes del producto.
            </p>
            <div className="rounded-2xl border border-(--card-border) bg-(--background) p-2 transition-all hover:border-accent-gold/20">
              <ImageUploader
                initialPrimary={product?.image_url}
                initialGallery={product?.image_gallery || []}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-6 border-t border-(--card-border) pt-8">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-8 py-2.5 text-[10px] font-bold text-accent-gold/40 uppercase tracking-widest hover:text-accent-gold transition-colors"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl px-10 py-2.5 text-sm font-bold text-white shadow-xl shadow-accent-gold/20 transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
          style={{ backgroundColor: "#cba87c" }}
        >
          {isPending ? "Guardando..." : "Guardar Producto"}
        </button>
      </div>
    </form>
  );
}
