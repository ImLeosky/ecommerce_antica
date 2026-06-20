"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCartStore } from "@/lib/cartStore";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const boldOrderId = searchParams.get("bold-order-id");
    const boldTxStatus = searchParams.get("bold-tx-status");

    if (!boldOrderId) {
      setStatus("success");
      return;
    }

    const updateOrder = async () => {
      const boldStatus = boldTxStatus === "approved" ? "paid" : "failed";

      const { error } = await supabase
        .from("orders")
        .update({
          bold_status: boldStatus,
          status: boldTxStatus === "approved" ? "paid" : "cancelled",
          bold_transaction_id: boldOrderId,
        })
        .eq("id", boldOrderId);

      if (error) {
        console.error("Error updating order after redirect:", error);
      }

      if (boldTxStatus === "approved") {
        clearCart();
      }
      setStatus(boldTxStatus === "approved" ? "success" : "error");
    };

    updateOrder();
  }, [searchParams, clearCart]);

  const locale =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1]
      : "es";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
      }}
    >
      {status === "loading" && (
        <div className="w-16 h-16 border-4 border-accent-gold border-t-transparent rounded-full animate-spin" />
      )}

      {status === "success" && (
        <div className="container-custom flex flex-col items-center justify-center text-center">
          <div
            className="bg-secondary p-12 md:p-20 rounded-[3rem] border border-border-color shadow-2xl max-w-3xl w-full"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                color: "rgb(34, 197, 94)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2.5rem",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1
              className="text-serif"
              style={{ fontSize: "3rem", marginBottom: "1.5rem" }}
            >
              ¡Gracias por tu compra!
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                color: "var(--foreground)",
                opacity: 0.6,
                lineHeight: 1.8,
                marginBottom: "3rem",
              }}
            >
              Tu pedido ha sido procesado correctamente.
              <br />
              <span style={{ display: "block", marginTop: "0.5rem" }}>
                Recibirás un correo con los detalles de tu compra.
              </span>
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <a
                href={`/${locale}`}
                className="btn btn-primary"
                style={{
                  padding: "1.25rem 2.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 900,
                  fontSize: "0.6875rem",
                }}
              >
                Volver al Inicio
              </a>
              <a
                href={`/${locale}/productos`}
                className="btn btn-outline"
                style={{
                  padding: "1.25rem 2.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 900,
                  fontSize: "0.6875rem",
                }}
              >
                Seguir Comprando
              </a>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="container-custom flex flex-col items-center justify-center text-center">
          <div
            className="bg-secondary p-12 md:p-20 rounded-[3rem] border border-border-color shadow-2xl max-w-3xl w-full"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "rgb(239, 68, 68)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2.5rem",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h1
              className="text-serif"
              style={{ fontSize: "3rem", marginBottom: "1.5rem" }}
            >
              Pago no completado
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                color: "var(--foreground)",
                opacity: 0.6,
                lineHeight: 1.8,
                marginBottom: "3rem",
              }}
            >
              El pago no pudo ser procesado o fue cancelado.
              <br />
              <span style={{ display: "block", marginTop: "0.5rem" }}>
                Por favor intenta de nuevo.
              </span>
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <a
                href={`/${locale}/checkout`}
                className="btn btn-primary"
                style={{
                  padding: "1.25rem 2.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 900,
                  fontSize: "0.6875rem",
                }}
              >
                Intentar de nuevo
              </a>
              <a
                href={`/${locale}`}
                className="btn btn-outline"
                style={{
                  padding: "1.25rem 2.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 900,
                  fontSize: "0.6875rem",
                }}
              >
                Volver al Inicio
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
