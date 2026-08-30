import { SingleProductFeature } from "@/features/single-product";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <SingleProductFeature productSlug={slug} />;
}
