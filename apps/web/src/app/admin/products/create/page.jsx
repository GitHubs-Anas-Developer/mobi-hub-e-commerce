
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import adminProductService from "@/services/adminProductService";
import categoryService from "@/services/categoryService";
import brandService from "@/services/brandService";

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

export default function CreateProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState(initialFormData);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  const [thumbnail, setThumbnail] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);

  const [variants, setVariants] = useState([
    {
      ...initialVariant,
      attributes: [{ key: "", value: "" }],
      images: [],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        const response = await categoryService.getCategories();

        setCategories(response.data || []);
      } catch (err) {
        console.error("Category Loading Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load categories.",
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Load active brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);

        const response = await brandService.getBrands({
          isActive: true,
        });

        setBrands(response.data || []);
      } catch (err) {
        console.error("Brand Loading Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load brands.",
        );
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Basic information and product status
  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Thumbnail
  const handleThumbnailChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Thumbnail image must be below 5MB.");
        event.target.value = "";
        return;
      }

      setError("");
    }

    setThumbnail(file);
  };

  // Gallery images
  const handleGalleryChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (galleryImages.length + selectedFiles.length > 6) {
      setError("You can upload a maximum of 6 gallery images.");
      event.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(
          file.type,
        ) ||
        file.size > 5 * 1024 * 1024,
    );

    if (invalidFile) {
      setError(
        "Gallery images must be JPG, PNG or WEBP and below 5MB.",
      );
      event.target.value = "";
      return;
    }

    setError("");

    setGalleryImages((prev) => [...prev, ...selectedFiles]);

    event.target.value = "";
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) =>
      prev.filter((_, i) => i !== index),
    );
  };

  // Specifications
  const addSpecification = () => {
    setSpecifications((prev) => [
      ...prev,
      { key: "", value: "" },
    ]);
  };

  const updateSpecification = (index, field, value) => {
    setSpecifications((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeSpecification = (index) => {
    setSpecifications((prev) =>
      prev.filter((_, i) => i !== index),
    );
  };

  // Add variant
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        ...initialVariant,
        attributes: [{ key: "", value: "" }],
        images: [],
        isDefault: false,
      },
    ]);
  };

  // Remove variant
  const removeVariant = (index) => {
    setVariants((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      if (
        updated.length > 0 &&
        !updated.some(
          (variant) => variant.isDefault && variant.isActive,
        )
      ) {
        const firstActiveIndex = updated.findIndex(
          (variant) => variant.isActive,
        );

        if (firstActiveIndex !== -1) {
          return updated.map((variant, i) => ({
            ...variant,
            isDefault: i === firstActiveIndex,
          }));
        }
      }

      return updated;
    });
  };

  // Update variant fields
  const updateVariant = (index, field, value) => {
    setVariants((prev) => {
      let updated = prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      );

      // If default variant becomes inactive, assign another active variant.
      if (
        field === "isActive" &&
        value === false &&
        updated[index].isDefault
      ) {
        const nextDefaultIndex = updated.findIndex(
          (variant, i) => i !== index && variant.isActive,
        );

        updated = updated.map((variant, i) => ({
          ...variant,
          isDefault: i === nextDefaultIndex,
        }));
      }

      return updated;
    });
  };

  // Variant attributes
  const addVariantAttribute = (variantIndex) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
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

  const updateVariantAttribute = (
    variantIndex,
    attributeIndex,
    field,
    value,
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              attributes: variant.attributes.map((attribute, j) =>
                j === attributeIndex
                  ? { ...attribute, [field]: value }
                  : attribute,
              ),
            }
          : variant,
      ),
    );
  };

  const removeVariantAttribute = (
    variantIndex,
    attributeIndex,
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              attributes: variant.attributes.filter(
                (_, j) => j !== attributeIndex,
              ),
            }
          : variant,
      ),
    );
  };

  // Set default variant
  const setDefaultVariant = (index) => {
    if (!variants[index]?.isActive) {
      setError(
        "An inactive variant cannot be the default variant.",
      );
      return;
    }

    setError("");

    setVariants((prev) =>
      prev.map((variant, i) => ({
        ...variant,
        isDefault: i === index,
      })),
    );
  };

  // Variant images
  const handleVariantImageChange = (variantIndex, event) => {
    const selectedFiles = Array.from(event.target.files || []);

    const currentImages = variants[variantIndex]?.images || [];

    if (currentImages.length + selectedFiles.length > 6) {
      setError("Each variant can have a maximum of 6 images.");
      event.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(
          file.type,
        ) ||
        file.size > 5 * 1024 * 1024,
    );

    if (invalidFile) {
      setError(
        "Variant images must be JPG, PNG or WEBP and below 5MB.",
      );
      event.target.value = "";
      return;
    }

    setError("");

    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              images: [...variant.images, ...selectedFiles],
            }
          : variant,
      ),
    );

    event.target.value = "";
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              images: variant.images.filter(
                (_, j) => j !== imageIndex,
              ),
            }
          : variant,
      ),
    );
  };

  // Upload images to Cloudinary
  const uploadImages = async (files) => {
    if (!files || files.length === 0) {
      return [];
    }

    const response = await adminProductService.uploadImages(
      files,
      "products",
    );

    return response.data || [];
  };

  // Validate form
  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.brand.trim() ||
      !formData.category ||
      !formData.description.trim()
    ) {
      return "Please complete all required product information.";
    }

    if (!thumbnail) {
      return "Please select a product thumbnail.";
    }

    if (!variants.length) {
      return "Please add at least one product variant.";
    }

    const activeVariants = variants.filter(
      (variant) => variant.isActive,
    );

    if (!activeVariants.length) {
      return "At least one variant must be active.";
    }

    const defaultVariants = activeVariants.filter(
      (variant) => variant.isDefault,
    );

    if (defaultVariants.length !== 1) {
      return "Please select exactly one active default variant.";
    }

    const skuList = variants
      .map((variant) => variant.sku.trim().toUpperCase())
      .filter(Boolean);

    if (skuList.length !== variants.length) {
      return "Every variant must have a SKU.";
    }

    if (new Set(skuList).size !== skuList.length) {
      return "Variant SKUs must be unique.";
    }

    for (const variant of variants) {
      const mrp = Number(variant.mrp);
      const sellingPrice = Number(variant.sellingPrice);
      const stock = Number(variant.stock);
      const threshold = Number(variant.lowStockThreshold);

      if (
        !variant.sku.trim() ||
        variant.mrp === "" ||
        variant.sellingPrice === ""
      ) {
        return "Please complete all required variant fields.";
      }

      if (
        !Number.isFinite(mrp) ||
        !Number.isFinite(sellingPrice) ||
        mrp <= 0 ||
        sellingPrice <= 0 ||
        sellingPrice > mrp
      ) {
        return "Enter valid prices. Selling price cannot exceed MRP.";
      }

      if (
        !Number.isInteger(stock) ||
        stock < 0 ||
        !Number.isInteger(threshold) ||
        threshold < 0
      ) {
        return "Stock and low stock threshold must be valid non-negative whole numbers.";
      }

      const validAttributes = variant.attributes.filter(
        (attribute) =>
          attribute.key.trim() && attribute.value.trim(),
      );

      if (validAttributes.length !== variant.attributes.length) {
        return "Please complete or remove empty variant attributes.";
      }
    }

    return "";
  };

  // Submit product
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // Upload thumbnail
      const uploadedThumbnail = await uploadImages([thumbnail]);

      if (!uploadedThumbnail.length) {
        throw new Error("Thumbnail upload failed.");
      }

      // Upload gallery images
      const uploadedGallery = await uploadImages(galleryImages);

      // Upload images for every variant
      const variantsWithImages = await Promise.all(
        variants.map(async (variant) => {
          const uploadedVariantImages = await uploadImages(
            variant.images,
          );

          const attributes = Object.fromEntries(
            variant.attributes
              .filter(
                (attribute) =>
                  attribute.key.trim() && attribute.value.trim(),
              )
              .map((attribute) => [
                attribute.key.trim(),
                attribute.value.trim(),
              ]),
          );

          return {
            sku: variant.sku.trim().toUpperCase(),
            mrp: Number(variant.mrp),
            sellingPrice: Number(variant.sellingPrice),
            stock: Number(variant.stock),
            lowStockThreshold: Number(variant.lowStockThreshold),
            attributes,
            images: uploadedVariantImages,
            isActive: variant.isActive,
            isDefault: variant.isDefault,
          };
        }),
      );

      // Map specifications
      const specificationObject = Object.fromEntries(
        specifications
          .filter(
            (specification) =>
              specification.key.trim() &&
              specification.value.trim(),
          )
          .map((specification) => [
            specification.key.trim(),
            specification.value.trim(),
          ]),
      );

      // Final product data
      const productData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        description: formData.description.trim(),

        thumbnail: uploadedThumbnail[0],

        images: uploadedGallery,

        specifications: specificationObject,

        variants: variantsWithImages,

        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
      };

      await adminProductService.createProduct(productData);

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Create Product Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create product. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to Products
            </button>

            <h1 className="text-2xl font-bold text-slate-900">
              Create Product
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add a new product to MOBI HUB.
            </p>
          </div>
        </div>

        {/* Loading Categories and Brands */}
        {categoriesLoading || brandsLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Loading product information...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <ProductBasicInformation
              formData={formData}
              categories={categories}
              brands={brands}
              brandsLoading={brandsLoading}
              onChange={handleFormChange}
            />

            <ProductImagesSection
              thumbnail={thumbnail}
              galleryImages={galleryImages}
              onThumbnailChange={handleThumbnailChange}
              onGalleryChange={handleGalleryChange}
              onRemoveGalleryImage={removeGalleryImage}
            />

            <ProductSpecifications
              specifications={specifications}
              onAdd={addSpecification}
              onChange={updateSpecification}
              onRemove={removeSpecification}
            />

            <ProductVariantsSection
              variants={variants}
              onAddVariant={addVariant}
              onRemoveVariant={removeVariant}
              onVariantChange={updateVariant}
              onAddAttribute={addVariantAttribute}
              onAttributeChange={updateVariantAttribute}
              onRemoveAttribute={removeVariantAttribute}
              onSetDefault={setDefaultVariant}
              onVariantImageChange={handleVariantImageChange}
              onRemoveVariantImage={removeVariantImage}
            />

            <ProductStatusSection
              formData={formData}
              onChange={handleFormChange}
            />

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <ProductFormActions
              loading={loading}
              onCancel={() => router.push("/admin/products")}
            />
          </form>
        )}
      </div>
    </div>
  );
}
