import { buildProductJsonLd } from "@/utils/details/Seo";
import type { ProductDetail } from "@/utils/product";

interface Props {
  product: ProductDetail;
  effectivePrice: number;
  totalComments: number;
}

export default function ProductJsonLd({
  product,
  effectivePrice,
  totalComments,
}: Props) {
  const schema = buildProductJsonLd({ product, effectivePrice, totalComments });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
