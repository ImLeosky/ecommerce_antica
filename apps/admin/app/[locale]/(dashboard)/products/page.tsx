import { createClient } from "@/utils/supabase/server";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import { deleteProduct } from "./actions";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function ProductsPage() {
  const supabase = await createClient();

  // Joining with categories to get category names
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-4xl font-normal tracking-tight"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Productos & Experiencias
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="h-0.5 w-6 bg-accent-gold/40 rounded-full" />
            <p className="text-[10px] font-bold text-accent-gold/60 uppercase tracking-[2px]">
              Gestión de inventario y catálogo
            </p>
          </div>
        </div>

        <Link
          href="/products/new"
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-accent-gold/20 transition-all duration-300 hover:scale-[1.02]"
          style={{ backgroundColor: "#cba87c" }}
        >
          <Plus className="h-4 w-4" />
          Añadir Producto
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-(--card-border) bg-(--card-bg) shadow-[0_4px_20px_rgba(26,21,18,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent-gold/[0.03] text-[10px] font-bold uppercase tracking-widest text-accent-gold/60 border-b border-(--card-border)">
              <tr>
                <th scope="col" className="px-8 py-6">
                  Nombre
                </th>
                <th scope="col" className="px-8 py-6">
                  Categoría
                </th>
                <th scope="col" className="px-8 py-6">
                  Precio
                </th>
                <th scope="col" className="px-8 py-6">
                  Disponible
                </th>
                <th scope="col" className="px-8 py-6">
                  Comprable
                </th>
                <th scope="col" className="px-8 py-6">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--card-border)">
              {products?.map((product) => {
                const displayName =
                  typeof product.name === "object"
                    ? product.name?.es || product.name?.en || "Unnamed"
                    : product.name;
                const categoryNameObj = product.categories?.name;
                const displayCategory =
                  typeof categoryNameObj === "object"
                    ? categoryNameObj?.es || categoryNameObj?.en || "Unknown"
                    : categoryNameObj;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-accent-gold/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6 font-medium text-(--foreground)">
                      {displayName}
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center rounded-lg bg-accent-gold/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent-gold border border-accent-gold/10">
                        {displayCategory}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-(--foreground) font-semibold italic">
                      S/ {product.price}
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border ${product.available ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                      >
                        {product.available ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border ${product.buyable ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                      >
                        {product.buyable ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-6 items-center">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="text-accent-gold/70 hover:text-accent-gold font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105"
                        >
                          <Edit className="h-3.5 w-3.5" /> Editar
                        </Link>
                        <DeleteButton
                          id={product.id}
                          deleteAction={deleteProduct}
                          itemType="producto"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {(!products || products.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
