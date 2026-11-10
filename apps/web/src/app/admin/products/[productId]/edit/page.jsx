
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import adminProductService from "@/services/adminProductService";
import categoryService from "@/services/categoryService";
import useAdminProduct from "@/hooks/useAdminProduct";

import ProductBasicInformation from "@/components/admin/products/create/ProductBasicInformation";
import ProductImagesSection from "@/components/admin/products/create/ProductImagesSection";
import ProductSpecifications from "@/components/admin/products/create/ProductSpecifications";
import ProductVariantsSection from "@/components/admin/products/create/ProductVariantsSection";
import ProductStatusSection from "@/components/admin/products/create/ProductStatusSection";
import ProductFormActions from "@/components/admin/products/create/ProductFormActions";

const initialFormData = {
  name: "",
  brand: "",
  category: "",
  description: "",
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
};

const initialVariant = {
  sku: "",
  mrp: "",
  sellingPrice: "",
  stock: 0,
  lowStockThreshold: 5,
  attributes: [{ key: "", value: "" }],
  images: [],
  isActive: true,
  isDefault: true,
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId;

  const {
    product,
    loading: productLoading,
    error: productError,
  } = useAdminProduct(productId);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState(initialFormData);
  const [thumbnail, setThumbnail] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);
  const [variants, setVariants] = useState([initialVariant]);

  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error("Category Error:", err);
        setError("Unable to load categories.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Populate product data
  useEffect(() => {
    if (productLoading) return;

    if (!product) {
      setInitializing(false);
      return;
    }

    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category?._id || product.category || "",
      description: product.description || "",
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      isNewArrival: product.isNewArrival ?? false,
    });

    setThumbnail(product.thumbnail || null);
    setGalleryImages(product.images || []);

    const specificationEntries = Object.entries(
      product.specifications || {},
    ).map(([key, value]) => ({
      key,
      value: String(value ?? ""),
    }));

    setSpecifications(
      specificationEntries.length
        ? specificationEntries
        : [{ key: "", value: "" }],
    );

    const populatedVariants = (product.variants || []).map((variant) => {
      const attributeEntries = Object.entries(
        variant.attributes || {},
      ).map(([key, value]) => ({
        key,
        value: String(value ?? ""),
      }));

      return {
        sku: variant.sku || "",
        mrp: String(variant.mrp ?? ""),
        sellingPrice: String(variant.sellingPrice ?? ""),
        stock: Number(variant.stock ?? 0),
        lowStockThreshold: Number(variant.lowStockThreshold ?? 5),
        attributes: attributeEntries.length
          ? attributeEntries
          : [{ key: "", value: "" }],
        images: variant.images || [],
        isActive: variant.isActive ?? true,
        isDefault: variant.isDefault ?? false,
      };
    });

    setVariants(
      populatedVariants.length ? populatedVariants : [initialVariant],
    );

    setInitializing(false);
  }, [product, productLoading]);

  // Basic information
  const handleBasicChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Thumbnail
  const handleThumbnailChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setThumbnail(null);
      return;
    }

    setThumbnail(file);
  };

  // Gallery
  const handleGalleryChange = (event) => {
    const files = Array.from(event.target.files || []);

    setGalleryImages((previous) => {
      const remainingSlots = 6 - previous.length;
      return [...previous, ...files.slice(0, remainingSlots)];
    });

    event.target.value = "";
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  // Specifications
  const handleAddSpecification = () => {
    setSpecifications((previous) => [
      ...previous,
      { key: "", value: "" },
    ]);
  };

  const handleSpecificationChange = (index, field, value) => {
    setSpecifications((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item,
      ),
    );
  };

  const handleRemoveSpecification = (index) => {
    setSpecifications((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  // Variants
  const handleAddVariant = () => {
    setVariants((previous) => [
      ...previous,
      {
        ...initialVariant,
        attributes: [{ key: "", value: "" }],
        images: [],
        isDefault: false,
      },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants((previous) =>
      previous.filter((_, variantIndex) => variantIndex !== index),
    );
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((previous) =>
      previous.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, [field]: value }
          : variant,
      ),
    );
  };

  const handleAddAttribute = (variantIndex) => {
    setVariants((previous) =>
      previous.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              attributes: [
                ...variant.attributes,
                { key: "", value: "" },
              ],
            }
          : variant,
      ),
    );
  };

  const handleAttributeChange = (
    variantIndex,
    attributeIndex,
    field,
    value,
  ) => {
    setVariants((previous) =>
      previous.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              attributes: variant.attributes.map((attribute, attrIndex) =>
                attrIndex === attributeIndex
                  ? { ...attribute, [field]: value }
                  : attribute,
              ),
            }
          : variant,
      ),
    );
  };

  const handleRemoveAttribute = (variantIndex, attributeIndex) => {
    setVariants((previous) =>
      previous.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              attributes: variant.attributes.filter(
                (_, attrIndex) => attrIndex !== attributeIndex,
              ),
            }
          : variant,
      ),
    );
  };

  const handleSetDefault = (selectedIndex) => {
    setVariants((previous) =>
      previous.map((variant, index) => ({
        ...variant,
        isDefault: index === selectedIndex,
      })),
    );
  };

  // Variant images
  const handleVariantImageChange = (variantIndex, event) => {
    const files = Array.from(event.target.files || []);

    setVariants((previous) =>
      previous.map((variant, index) => {
        if (index !== variantIndex) return variant;

        const remainingSlots = 6 - variant.images.length;

        return {
          ...variant,
          images: [
            ...variant.images,
            ...files.slice(0, remainingSlots),
          ],
        };
      }),
    );

    event.target.value = "";
  };

  const handleRemoveVariantImage = (variantIndex, imageIndex) => {
    setVariants((previous) =>
      previous.map((variant, index) =>
        index === variantIndex
          ? {
              ...variant,
              images: variant.images.filter(
                (_, imgIndex) => imgIndex !== imageIndex,
              ),
            }
          : variant,
      ),
    );
  };

  // Upload only new File objects; preserve existing Cloudinary images
  const uploadNewImages = async (images) => {
    const uploadedImages = [];
    const newFiles = [];

    images.forEach((image, index) => {
      if (typeof File !== "undefined" && image instanceof File) {
        newFiles.push({ image, index });
      } else {
        uploadedImages.push({ image, index });
      }
    });

    if (newFiles.length) {
      const response = await adminProductService.uploadImages(
        newFiles.map((item) => item.image),
      );

      const results = response.data || response.results || [];

      results.forEach((image, index) => {
        uploadedImages.push({
          image,
          index: newFiles[index].index,
        });
      });
    }

    return uploadedImages
      .sort((a, b) => a.index - b.index)
      .map((item) => item.image);
  };

  // Form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim() || !formData.brand.trim()) {
      setError("Product name and brand are required.");
      return;
    }

    if (!formData.category || !formData.description.trim()) {
      setError("Category and description are required.");
      return;
    }

    if (!thumbnail) {
      setError("Product thumbnail is required.");
      return;
    }

    const activeVariants = variants.filter((variant) => variant.isActive);

    if (!activeVariants.length) {
      setError("At least one active variant is required.");
      return;
    }

    const defaultVariants = activeVariants.filter(
      (variant) => variant.isDefault,
    );

    if (defaultVariants.length !== 1) {
      setError("Exactly one active default variant is required.");
      return;
    }

    const skuValues = variants.map((variant) =>
      variant.sku.trim().toUpperCase(),
    );

    if (
      skuValues.some((sku) => !sku) ||
      new Set(skuValues).size !== skuValues.length
    ) {
      setError("All variant SKUs are required and must be unique.");
      return;
    }

    for (const variant of variants) {
      const mrp = Number(variant.mrp);
      const sellingPrice = Number(variant.sellingPrice);

      if (
        variant.mrp === "" ||
        variant.sellingPrice === "" ||
        !Number.isFinite(mrp) ||
        !Number.isFinite(sellingPrice) ||
        mrp < 0 ||
        sellingPrice < 0 ||
        sellingPrice > mrp
      ) {
        setError("Please enter valid variant prices.");
        return;
      }

      if (
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0 ||
        !Number.isInteger(Number(variant.lowStockThreshold)) ||
        Number(variant.lowStockThreshold) < 0
      ) {
        setError("Stock and low stock threshold must be valid integers.");
        return;
      }

      const attributes = variant.attributes.filter(
        (attribute) => attribute.key.trim() && attribute.value.trim(),
      );

      if (attributes.length !== variant.attributes.length) {
        setError("Please complete or remove empty variant attributes.");
        return;
      }

      if (variant.images.length > 6) {
        setError("Each variant can have a maximum of 6 images.");
        return;
      }
    }

    if (galleryImages.length > 6) {
      setError("Maximum 6 gallery images are allowed.");
      return;
    }

    try {
      setSubmitting(true);

      // Thumbnail
      let uploadedThumbnail = thumbnail;

      if (typeof File !== "undefined" && thumbnail instanceof File) {
        const response = await adminProductService.uploadImages([
          thumbnail,
        ]);

        uploadedThumbnail = (response.data || response.results || [])[0];
      }

      // Gallery
      const uploadedGallery = await uploadNewImages(galleryImages);

      // Specifications
      const specificationsObject = {};

      specifications.forEach(({ key, value }) => {
        if (key.trim() && value.trim()) {
          specificationsObject[key.trim()] = value.trim();
        }
      });

      // Variants and their images
      const preparedVariants = await Promise.all(
        variants.map(async (variant) => {
          const uploadedVariantImages = await uploadNewImages(
            variant.images,
          );

          const attributesObject = {};

          variant.attributes.forEach(({ key, value }) => {
            if (key.trim() && value.trim()) {
              attributesObject[key.trim()] = value.trim();
            }
          });

          return {
            sku: variant.sku.trim().toUpperCase(),
            mrp: Number(variant.mrp),
            sellingPrice: Number(variant.sellingPrice),
            stock: Number(variant.stock),
            lowStockThreshold: Number(variant.lowStockThreshold),
            attributes: attributesObject,
            images: uploadedVariantImages,
            isActive: variant.isActive,
            isDefault: variant.isDefault,
          };
        }),
      );

      const productData = {
        ...formData,
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        description: formData.description.trim(),
        thumbnail: uploadedThumbnail,
        images: uploadedGallery,
        specifications: specificationsObject,
        variants: preparedVariants,
      };

      await adminProductService.updateProduct(productId, productData);

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Update Product Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update product. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (productLoading || initializing || categoriesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">
          {productError || "Product not found."}
        </p>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="mt-4 text-sm font-medium text-blue-600 hover:underline"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Product
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update product information, images, specifications and variants.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <ProductBasicInformation
          formData={formData}
          categories={categories}
          onChange={handleBasicChange}
        />

        <ProductImagesSection
          thumbnail={thumbnail}
          galleryImages={galleryImages}
          onThumbnailChange={handleThumbnailChange}
          onGalleryChange={handleGalleryChange}
          onRemoveGalleryImage={handleRemoveGalleryImage}
        />

        <ProductSpecifications
          specifications={specifications}
          onAdd={handleAddSpecification}
          onChange={handleSpecificationChange}
          onRemove={handleRemoveSpecification}
        />

        <ProductVariantsSection
          variants={variants}
          onAddVariant={handleAddVariant}
          onRemoveVariant={handleRemoveVariant}
          onVariantChange={handleVariantChange}
          onAddAttribute={handleAddAttribute}
          onAttributeChange={handleAttributeChange}
          onRemoveAttribute={handleRemoveAttribute}
          onSetDefault={handleSetDefault}
          onVariantImageChange={handleVariantImageChange}
          onRemoveVariantImage={handleRemoveVariantImage}
        />

        <ProductStatusSection
          formData={formData}
          onChange={handleBasicChange}
        />

   <ProductFormActions
      loading={submitting}
       onCancel={() => router.push("/admin/products")}
       submitLabel="Save Changes"
       loadingLabel="Updating Product..."
    />
      </form>
    </div>
  );
}
