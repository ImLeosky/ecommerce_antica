"use client";

import { useRouter } from "@/i18n/routing";
import { useCartStore } from "@/lib/cartStore";
import { useTranslations } from "next-intl";

type Product = {
  id: number;
  name: Record<string, string>;
  price: number;
  image_url: string | null;
  available: boolean;
  buyable: boolean;
};

type BuyNowButtonProps = {
  product: Product;
};

const BuyNowButton = ({ product }: BuyNowButtonProps) => {
  const t = useTranslations("GiftPage");
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const handleBuyNow = () => {
    addItem(product);
    router.push("/checkout");
  };

  return (
    <button
      onClick={handleBuyNow}
      className="btn btn-primary"
      style={{
        width: "100%",
        backgroundColor: "#cba87c",
        borderColor: "#cba87c",
        color: "white",
      }}
    >
      {t("buyNow") || "Comprar Ahora"}
    </button>
  );
};

export default BuyNowButton;
