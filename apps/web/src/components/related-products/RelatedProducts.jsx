
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductSection from "../home/ProductSection";
import { clearRelatedProducts } from "@/store/slices/relatedProductsSlice";
import { fetchRelatedProducts } from "@/store/thunks/relatedProducts";

export default function RelatedProducts({
  productId,
  title = "You May Also Like",
  subtitle = "Discover more products selected for you.",
  limit = 10,
}) {
  const dispatch = useDispatch();

  const {
    products,
    loading,
    error,
    currentProductId,
  } = useSelector((state) => state.relatedProducts);

  useEffect(() => {
    if (!productId) {
      dispatch(clearRelatedProducts());
      return;
    }

    dispatch(fetchRelatedProducts({ productId, limit }));

    return () => {
      dispatch(clearRelatedProducts());
    };
  }, [dispatch, productId, limit]);

  // Prevent showing products belonging to a previous product
  if (!productId || currentProductId !== productId) {
    return null;
  }

  if (!loading && !error && products.length === 0) {
    return null;
  }

  return (
    <ProductSection
      title={title}
      subtitle={subtitle}
      products={products}
      loading={loading}
      error={error}
    />
  );
}
