"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { X, UploadCloud, Loader2 } from "lucide-react";

const MAX_WIDTH = 1920;
const QUALITY = 0.85;

async function optimizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo crear el contexto"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Error al convertir imagen"));
        },
        "image/webp",
        QUALITY,
      );
    };
    img.onerror = () => reject(new Error("Error al cargar imagen"));
    img.src = URL.createObjectURL(file);
  });
}

export function CmsUploader({
  slotKey,
  type,
  initialData,
}: {
  slotKey: string;
  type: "single" | "gallery";
  initialData?: any; // string or string[]
}) {
  const isGallery = type === "gallery";
  const [data, setData] = useState<any>(
    isGallery
      ? Array.isArray(initialData)
        ? initialData
        : []
      : initialData || "",
  );
  const [isUploading, setIsUploading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const isVideoUrl = (url: string) => {
    if (typeof url !== 'string') return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const files = Array.from(e.target.files);

    for (const file of files) {
      try {
        const isVideo = file.type.startsWith('video/');
        let uploadBlob: Blob = file;
        let fileName = "";

        if (isVideo) {
            const fileExt = file.name.split('.').pop();
            fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        } else {
            uploadBlob = await optimizeImage(file);
            fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`;
        }

        const { data: uploadData, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, uploadBlob, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadData.path);

        if (isGallery) {
          setData((prev: string[]) => [...prev, publicUrl]);
        } else {
          setData(publicUrl);
        }
      } catch (err) {
        console.error("Upload process error:", err);
      }
    }

    setIsUploading(false);
  };

  const removeSingle = () => setData("");
  const removeGalleryImage = (url: string) =>
    setData((prev: string[]) => prev.filter((g) => g !== url));

  return (
    <div className="space-y-4">
      {/* Hidden inputs to capture values automatically in forms */}
      {!isGallery && (
        <input type="hidden" name={slotKey} value={data as string} />
      )}
      {isGallery &&
        Array.isArray(data) &&
        data.map((url, i) => (
          <input key={i} type="hidden" name={`${slotKey}[]`} value={url} />
        ))}

      {!isGallery ? (
        <div className="group">
          {data ? (
            <div className="relative inline-block border border-(--card-border) rounded-2xl overflow-hidden shadow-sm">
              {isVideoUrl(data as string) ? (
                <video
                  src={data as string}
                  className="h-48 w-auto object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={data as string}
                  alt="Upload"
                  className="h-48 w-auto object-cover"
                />
              )}
              <button
                type="button"
                onClick={removeSingle}
                className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full p-2 hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-(--card-border) rounded-2xl bg-accent-gold/[0.02] hover:bg-accent-gold/[0.05] hover:border-accent-gold/40 transition-all duration-300">
              <label className="flex flex-col items-center cursor-pointer text-accent-gold/40 hover:text-accent-gold w-full h-full justify-center group-hover:scale-105 transition-transform">
                {isUploading ? (
                  <Loader2 className="w-10 h-10 animate-spin text-accent-gold" />
                ) : (
                  <UploadCloud className="w-10 h-10" />
                )}
                <span className="mt-3 text-[10px] font-bold uppercase tracking-widest">
                  Subir Archivo
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/mp4,video/webm,video/quicktime"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {Array.isArray(data) &&
            data.map((url, index) => (
              <div
                key={index}
                className="relative inline-block border border-(--card-border) rounded-2xl overflow-hidden shadow-sm"
              >
                {isVideoUrl(url) ? (
                  <video
                    src={url}
                    className="h-32 w-32 object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Gallery ${index}`}
                    className="h-32 w-32 object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full p-1.5 hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-(--card-border) rounded-2xl bg-accent-gold/[0.02] hover:bg-accent-gold/[0.05] hover:border-accent-gold/40 transition-all duration-300 group">
            <label className="flex flex-col items-center cursor-pointer text-accent-gold/40 hover:text-accent-gold h-full w-full justify-center transition-transform group-hover:scale-110">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
