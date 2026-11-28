"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Alert, App, Button, Card, Spin, Tag } from "antd";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  PackagePlus,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import adminProductService from "@/services/adminProductService";
import {
  fetchCategories,
  fetchSubCategories,
} from "@/store/thunks/categoryThunks";
import { fetchBrands } from "@/store/thunks/brandThunks";
import { createProduct as createProductThunk } from "@/store/thunks/productThunks";

import ProductBasicInformation from "@/components/admin/products/create/ProductBasicInformation";
import ProductImagesSection from "@/components/admin/products/create/ProductImagesSection";
import ProductSpecifications from "@/components/admin/products/create/ProductSpecifications";
import ProductVariantsSection from "@/components/admin/products/create/ProductVariantsSection";
import ProductStatusSection from "@/components/admin/products/create/ProductStatusSection";
import ProductFormActions from "@/components/admin/products/create/ProductFormActions";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const initialFormData = {
  name: "",
  brand: "",
  category: "",
  description: "",
  isActive: true,
  isFeatured: false,
  isNewArrival: true,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  hsnCode: "",
  gstRate: "",
  isTaxable: true,
  weight: "",
  length: "",
  width: "",
  height: "",
  warranty: "",
  returnEligible: true,
  isFreeShipping: false,
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

const isValidImageFile = (file) =>
  Boolean(
    file &&
      ALLOWED_IMAGE_TYPES.includes(file.type) &&
      file.size <= MAX_IMAGE_SIZE,
  );

export default function CreateProductPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { message } = App.useApp();

  const submittingRef = useRef(false);
  const uploadedPublicIdsRef = useRef([]);

  const {
    categories = [],
    subCategories = [],
    loading: categoriesLoading,
    subCategoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories);

  const {
    brands = [],
    loading: brandsLoading,
    error: brandsError,
  } = useSelector((state) => state.brands);

  const [formData, setFormData] = useState(initialFormData);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState("");

  const [thumbnail, setThumbnail] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);

  const [variants, setVariants] = useState([
    {
      ...initialVariant,
      attributes: [{ key: "", value: "" }],
      images: [],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("publish");
  const [uploadProgress, setUploadProgress] = useState({
    active: false,
    percent: 0,
    label: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [variantErrors, setVariantErrors] = useState({});
  const [variantsSectionError, setVariantsSectionError] = useState("");

  // Fetch active categories & brands through Redux thunks
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands({ isActive: true }));
  }, [dispatch]);

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Basic information & status handler
  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setError("");
    clearFieldError(name);

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Dependent Category -> Subcategory handler
  const handleMainCategoryChange = (mainId) => {
    setError("");
    clearFieldError("category");
    setSelectedMainCategoryId(mainId);
    setFormData((prev) => ({
      ...prev,
      category: mainId || "",
    }));

    if (mainId) {
      dispatch(fetchSubCategories(mainId));
    }
  };

  // Main product thumbnail handler
  const handleThumbnailChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setThumbnail(null);
      clearFieldError("thumbnail");
      return;
    }

    if (!isValidImageFile(file)) {
      const msg = "Main product image must be JPG, PNG, or WEBP and below 5MB.";
      setFieldErrors((prev) => ({ ...prev, thumbnail: msg }));
      setError(msg);
      if (event.target) event.target.value = "";
      return;
    }

    clearFieldError("thumbnail");
    setError("");
    setThumbnail(file);
  };

  // Gallery images handler
  const handleGalleryChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    if (galleryImages.length + selectedFiles.length > 6) {
      const msg = "You can upload a maximum of 6 gallery images.";
      setFieldErrors((prev) => ({ ...prev, gallery: msg }));
      setError(msg);
      event.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find((file) => !isValidImageFile(file));

    if (invalidFile) {
      const msg = "Gallery images must be JPG, PNG, or WEBP and below 5MB.";
      setFieldErrors((prev) => ({ ...prev, gallery: msg }));
      setError(msg);
      event.target.value = "";
      return;
    }

    clearFieldError("gallery");
    setError("");
    setGalleryImages((prev) => [...prev, ...selectedFiles]);
    event.target.value = "";
  };

  const removeGalleryImage = (index) => {
    clearFieldError("gallery");
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveGalleryImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= galleryImages.length) return;
    setGalleryImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  // Specifications handlers
  const addSpecification = () => {
    clearFieldError("specifications");
    setSpecifications((prev) => [...prev, { key: "", value: "" }]);
  };

  const quickAddSpecification = (presetKey) => {
    clearFieldError("specifications");
    setSpecifications((prev) => {
      const emptyIdx = prev.findIndex(
        (row) => !row.key.trim() && !row.value.trim(),
      );
      if (emptyIdx !== -1) {
        return prev.map((row, idx) =>
          idx === emptyIdx ? { ...row, key: presetKey } : row,
        );
      }
      return [...prev, { key: presetKey, value: "" }];
    });
  };

  const updateSpecification = (index, field, value) => {
    clearFieldError("specifications");
    setSpecifications((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeSpecification = (index) => {
    clearFieldError("specifications");
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Variants handlers
  const addVariant = () => {
    setVariantsSectionError("");
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

  const removeVariant = (index) => {
    setVariantsSectionError("");
    setVariantErrors((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, val]) => {
        const num = Number(k);
        if (num < index) next[num] = val;
        else if (num > index) next[num - 1] = val;
      });
      return next;
    });

    setVariants((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      if (
        updated.length > 0 &&
        !updated.some((variant) => variant.isDefault && variant.isActive)
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

  const updateVariant = (index, field, value) => {
    setVariantsSectionError("");
    setVariantErrors((prev) => {
      if (!prev[index]?.[field]) return prev;
      return {
        ...prev,
        [index]: { ...prev[index], [field]: undefined },
      };
    });

    setVariants((prev) => {
      let updated = prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      );

      if (field === "isActive" && value === false && updated[index].isDefault) {
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

  const addVariantAttribute = (variantIndex) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              attributes: [...variant.attributes, { key: "", value: "" }],
            }
          : variant,
      ),
    );
  };

  const quickAddVariantAttribute = (variantIndex, presetKey) => {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;
        const emptyIdx = variant.attributes.findIndex(
          (attr) => !attr.key.trim() && !attr.value.trim(),
        );
        if (emptyIdx !== -1) {
          return {
            ...variant,
            attributes: variant.attributes.map((attr, idx) =>
              idx === emptyIdx ? { ...attr, key: presetKey } : attr,
            ),
          };
        }
        return {
          ...variant,
          attributes: [...variant.attributes, { key: presetKey, value: "" }],
        };
      }),
    );
  };

  const updateVariantAttribute = (
    variantIndex,
    attributeIndex,
    field,
    value,
  ) => {
    setVariantErrors((prev) => {
      if (!prev[variantIndex]?.attributes) return prev;
      return {
        ...prev,
        [variantIndex]: { ...prev[variantIndex], attributes: undefined },
      };
    });

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

  const removeVariantAttribute = (variantIndex, attributeIndex) => {
    setVariantErrors((prev) => {
      if (!prev[variantIndex]?.attributes) return prev;
      return {
        ...prev,
        [variantIndex]: { ...prev[variantIndex], attributes: undefined },
      };
    });

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

  const setDefaultVariant = (index) => {
    if (!variants[index]?.isActive) {
      setVariantsSectionError(
        "An inactive variant cannot be marked as the default variant.",
      );
      return;
    }

    setVariantsSectionError("");
    setVariants((prev) =>
      prev.map((variant, i) => ({
        ...variant,
        isDefault: i === index,
      })),
    );
  };

  const handleVariantImageChange = (variantIndex, event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const currentImages = variants[variantIndex]?.images || [];

    if (currentImages.length + selectedFiles.length > 6) {
      setError("Each variant can have a maximum of 6 images.");
      event.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find((file) => !isValidImageFile(file));

    if (invalidFile) {
      setError("Variant images must be JPG, PNG, or WEBP and below 5MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? { ...variant, images: [...variant.images, ...selectedFiles] }
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
              images: variant.images.filter((_, j) => j !== imageIndex),
            }
          : variant,
      ),
    );
  };

  // Validate against frontend + backend Zod constraints
  const validateAll = () => {
    const nextFieldErrors = {};
    const nextVariantErrors = {};
    let nextVariantsSectionError = "";
    let firstMessage = "";

    const trimmedName = formData.name.trim();
    const trimmedDesc = formData.description.trim();

    if (!trimmedName) {
      nextFieldErrors.name = "Product name is required.";
      firstMessage = firstMessage || nextFieldErrors.name;
    } else if (trimmedName.length < 2 || trimmedName.length > 120) {
      nextFieldErrors.name = "Product name must be between 2 and 120 characters.";
      firstMessage = firstMessage || nextFieldErrors.name;
    }

    if (!formData.category) {
      nextFieldErrors.category = "Please select a main category (and subcategory if applicable).";
      firstMessage = firstMessage || nextFieldErrors.category;
    }

    if (!formData.brand.trim()) {
      nextFieldErrors.brand = "Please select a brand.";
      firstMessage = firstMessage || nextFieldErrors.brand;
    }

    if (!trimmedDesc) {
      nextFieldErrors.description = "Product description is required.";
      firstMessage = firstMessage || nextFieldErrors.description;
    } else if (trimmedDesc.length < 10) {
      nextFieldErrors.description =
        "Description must be at least 10 characters long.";
      firstMessage = firstMessage || nextFieldErrors.description;
    }

    if (!thumbnail) {
      nextFieldErrors.thumbnail = "Main product image (thumbnail) is required.";
      firstMessage = firstMessage || nextFieldErrors.thumbnail;
    }

    const partialSpec = specifications.some(
      (s) =>
        (s.key.trim() && !s.value.trim()) ||
        (!s.key.trim() && s.value.trim()),
    );
    if (partialSpec) {
      nextFieldErrors.specifications =
        "Complete both Name and Value for each specification row, or clear unused rows.";
      firstMessage = firstMessage || nextFieldErrors.specifications;
    }

    if (!variants.length) {
      nextVariantsSectionError = "At least one product variant is required.";
      firstMessage = firstMessage || nextVariantsSectionError;
    } else {
      const activeVariants = variants.filter((v) => v.isActive);
      if (!activeVariants.length) {
        nextVariantsSectionError = "At least one variant must remain active.";
        firstMessage = firstMessage || nextVariantsSectionError;
      } else if (activeVariants.filter((v) => v.isDefault).length !== 1) {
        nextVariantsSectionError =
          "Select exactly one active variant as Default.";
        firstMessage = firstMessage || nextVariantsSectionError;
      }

      const skuMap = new Map();
      variants.forEach((v, idx) => {
        const vErr = {};
        const sku = v.sku.trim().toUpperCase();

        if (!sku) {
          vErr.sku = "SKU is required.";
        } else if (sku.length > 50) {
          vErr.sku = "SKU max 50 chars.";
        } else if (skuMap.has(sku)) {
          vErr.sku = "Duplicate SKU in this product.";
        } else {
          skuMap.set(sku, idx);
        }

        const mrp = Number(v.mrp);
        const sellingPrice = Number(v.sellingPrice);
        const stock = Number(v.stock);
        const threshold = Number(v.lowStockThreshold);

        if (v.mrp === "" || !Number.isFinite(mrp) || mrp <= 0) {
          vErr.mrp = "Enter valid regular price > 0.";
        }

        if (
          v.sellingPrice === "" ||
          !Number.isFinite(sellingPrice) ||
          sellingPrice <= 0
        ) {
          vErr.sellingPrice = "Enter valid sale price > 0.";
        } else if (Number.isFinite(mrp) && mrp > 0 && sellingPrice > mrp) {
          vErr.sellingPrice = "Sale price cannot exceed MRP.";
        }

        if (!Number.isInteger(stock) || stock < 0) {
          vErr.stock = "Stock must be integer >= 0.";
        }

        if (!Number.isInteger(threshold) || threshold < 0) {
          vErr.lowStockThreshold = "Must be integer >= 0.";
        }

        const partialAttr = (v.attributes || []).some(
          (a) =>
            (a.key.trim() && !a.value.trim()) ||
            (!a.key.trim() && a.value.trim()),
        );
        if (partialAttr) {
          vErr.attributes =
            "Complete both Attribute and Value for each row, or remove incomplete rows.";
        }

        if (Object.keys(vErr).length > 0) {
          nextVariantErrors[idx] = vErr;
          firstMessage =
            firstMessage ||
            `Fix highlighted fields in Variant ${idx + 1}.`;
        }
        if ((v.images || []).some((image) => typeof File !== "undefined" && image instanceof File && !isValidImageFile(image))) {
          vErr.images = "Variant images must be JPG, PNG, or WEBP and below 5MB.";
          nextVariantErrors[idx] = vErr;
          firstMessage = firstMessage || `Fix highlighted fields in Variant ${idx + 1}.`;
        }
      });
    }

    setFieldErrors(nextFieldErrors);
    setVariantErrors(nextVariantErrors);
    setVariantsSectionError(nextVariantsSectionError);

    return firstMessage;
  };

  // Upload batch helper with progress callbacks
  const uploadBatch = async (files, label, progressBase, progressSpan) => {
    if (!files || files.length === 0) return [];

    setUploadProgress({
      active: true,
      percent: progressBase,
      label,
    });

    const response = await adminProductService.uploadImages(
      files,
      "products",
      (evt) => {
        if (evt.total) {
          const ratio = Math.min(1, evt.loaded / evt.total);
          setUploadProgress({
            active: true,
            percent: Math.round(progressBase + ratio * progressSpan),
            label,
          });
        }
      },
    );

    const uploaded = response.data || [];
    uploadedPublicIdsRef.current.push(...uploaded.map((image) => image.publicId).filter(Boolean));
    return uploaded;
  };

  // Submit handler (supports Publish OR Save as Draft)
  const submitProduct = async (publishActive) => {
    if (submittingRef.current || loading) return;

    setError("");
    const validationSummary = validateAll();

    if (validationSummary) {
      setError(validationSummary);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const actionMode = publishActive ? "publish" : "draft";

    try {
      submittingRef.current = true;
      uploadedPublicIdsRef.current = [];
      setLoading(true);
      setLoadingAction(actionMode);

      // Keep form switch aligned with action triggered
      setFormData((prev) => ({ ...prev, isActive: publishActive }));

      // Step 1: Upload thumbnail (0 -> 25%)
      const uploadedThumbnail = await uploadBatch(
        [thumbnail],
        "Uploading main product image...",
        5,
        20,
      );

      if (!uploadedThumbnail.length) {
        throw new Error("Main thumbnail upload did not return an image.");
      }

      // Step 2: Upload gallery images (25 -> 55%)
      const uploadedGallery = await uploadBatch(
        galleryImages,
        `Uploading ${galleryImages.length} gallery image(s)...`,
        25,
        30,
      );

      // Step 3: Upload variant images sequentially/proportionally (55 -> 85%)
      const variantsWithImages = [];
      const variantSlice = variants.length ? 30 / variants.length : 0;

      for (let i = 0; i < variants.length; i += 1) {
        const variant = variants[i];
        const uploadedVariantImages = await uploadBatch(
          variant.images,
          `Uploading images for Variant ${i + 1}...`,
          Math.round(55 + i * variantSlice),
          Math.max(5, Math.round(variantSlice)),
        );

        const attributes = Object.fromEntries(
          (variant.attributes || [])
            .filter((attr) => attr.key.trim() && attr.value.trim())
            .map((attr) => [attr.key.trim(), attr.value.trim()]),
        );

        variantsWithImages.push({
          sku: variant.sku.trim().toUpperCase(),
          mrp: Number(variant.mrp),
          sellingPrice: Number(variant.sellingPrice),
          stock: Number(variant.stock),
          lowStockThreshold: Number(variant.lowStockThreshold),
          attributes,
          images: uploadedVariantImages,
          isActive: Boolean(variant.isActive),
          isDefault: Boolean(variant.isDefault),
        });
      }

      // Step 4: Save Product (85 -> 100%)
      setUploadProgress({
        active: true,
        percent: 90,
        label: publishActive
          ? "Publishing product to ELENZO catalog..."
          : "Saving product as draft...",
      });

      const specificationObject = Object.fromEntries(
        specifications
          .filter((spec) => spec.key.trim() && spec.value.trim())
          .map((spec) => [spec.key.trim(), spec.value.trim()]),
      );

      const productData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        description: formData.description.trim(),
        thumbnail: uploadedThumbnail[0],
        images: uploadedGallery,
        specifications: specificationObject,
        variants: variantsWithImages,
        isActive: publishActive,
        isFeatured: Boolean(formData.isFeatured),
        isNewArrival: Boolean(formData.isNewArrival),
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoKeywords: formData.seoKeywords.split(",").map((item) => item.trim()).filter(Boolean),
        hsnCode: formData.hsnCode,
        ...(formData.gstRate !== "" && { gstRate: Number(formData.gstRate) }),
        isTaxable: Boolean(formData.isTaxable),
        ...(formData.weight !== "" && { weight: Number(formData.weight) }),
        ...(formData.length !== "" && { length: Number(formData.length) }),
        ...(formData.width !== "" && { width: Number(formData.width) }),
        ...(formData.height !== "" && { height: Number(formData.height) }),
        warranty: formData.warranty,
        returnEligible: Boolean(formData.returnEligible),
        isFreeShipping: Boolean(formData.isFreeShipping),
        status: publishActive ? "active" : "draft",
      };

      await dispatch(createProductThunk(productData)).unwrap();

      setUploadProgress({
        active: true,
        percent: 100,
        label: "Done!",
      });

      message.success(
        publishActive
          ? "Product published successfully to ELENZO."
          : "Product saved as draft successfully.",
      );

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Create Product Error:", err);

      if (uploadedPublicIdsRef.current.length) {
        try {
          await adminProductService.deleteUploadedImages(uploadedPublicIdsRef.current);
          uploadedPublicIdsRef.current = [];
        } catch (cleanupError) {
          console.error("Unable to clean up unreferenced product uploads:", cleanupError);
        }
      }

      const backendErrors = err.response?.data?.errors;
      const detailedError = Array.isArray(backendErrors) && backendErrors.length
        ? backendErrors.map((e) => e.message || e).join(" ")
        : "";

      setError(
        detailedError ||
          err.response?.data?.message ||
          err.message ||
          "Unable to create product. Please check all fields and try again.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      submittingRef.current = false;
      setLoading(false);
      setUploadProgress({ active: false, percent: 0, label: "" });
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submitProduct(Boolean(formData.isActive));
  };

  // Live sidebar summary & readiness checklist derived strictly from real form state
  const liveSummary = useMemo(() => {
    const activeVariants = variants.filter((v) => v.isActive);
    const totalStock = activeVariants.reduce(
      (sum, v) => sum + (Number(v.stock) || 0),
      0,
    );

    const prices = activeVariants
      .map((v) => Number(v.sellingPrice))
      .filter((p) => Number.isFinite(p) && p > 0);
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;

    const selectedMain = categories.find(
      (c) => c._id === selectedMainCategoryId,
    );
    const selectedCategoryObj = categories.find(
      (c) => c._id === formData.category,
    );

    const hasValidVariant =
      activeVariants.length > 0 &&
      activeVariants.some((v) => v.isDefault) &&
      variants.every(
        (v) =>
          v.sku.trim() &&
          Number(v.mrp) > 0 &&
          Number(v.sellingPrice) > 0 &&
          Number(v.sellingPrice) <= Number(v.mrp),
      );

    return {
      totalStock,
      minPrice,
      maxPrice,
      variantCount: variants.length,
      categoryLabel:
        selectedCategoryObj && selectedMain && selectedCategoryObj._id !== selectedMain._id
          ? `${selectedMain.name} > ${selectedCategoryObj.name}`
          : selectedCategoryObj?.name || selectedMain?.name || "Not selected",
      checklist: [
        {
          label: "Product Name (2–120 chars)",
          done:
            formData.name.trim().length >= 2 &&
            formData.name.trim().length <= 120,
        },
        {
          label: "Full Description (10+ chars)",
          done: formData.description.trim().length >= 10,
        },
        { label: "Category & Brand", done: Boolean(formData.category && formData.brand) },
        { label: "Main Product Image", done: Boolean(thumbnail) },
        { label: "Valid Default Variant (SKU & Price)", done: hasValidVariant },
      ],
    };
  }, [variants, categories, selectedMainCategoryId, formData, thumbnail]);

  const initialDataLoading = categoriesLoading && categories.length === 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-5 lg:flex-row lg:items-center">
        <div className="min-w-0 space-y-1.5">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#64748B]"
          >
            <Link href="/admin" className="hover:text-[#0755E9]">
              Admin
            </Link>
            <span>/</span>
            <Link href="/admin/products" className="hover:text-[#0755E9]">
              Products
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#101828]">Add New Product</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="!m-0 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl">
              Add New Product
            </h1>
            <Tag
              color={formData.isActive ? "blue" : "default"}
              className="!m-0 !font-semibold"
            >
              {formData.isActive ? "Publish Mode" : "Draft Mode"}
            </Tag>
          </div>

          <p className="text-xs leading-relaxed text-[#64748B] sm:text-sm">
            Create a complete ELENZO gadget listing with media, dependent categories, variants, and technical specifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            icon={<ArrowLeft size={15} />}
            onClick={() => router.push("/admin/products")}
            disabled={loading}
          >
            Back to Products
          </Button>

          <Button
            icon={<FileText size={15} />}
            onClick={() => submitProduct(false)}
            loading={loading && loadingAction === "draft"}
            disabled={loading || initialDataLoading}
          >
            Save as Draft
          </Button>

          <Button
            type="primary"
            icon={<Rocket size={15} />}
            onClick={() => submitProduct(true)}
            loading={loading && loadingAction === "publish"}
            disabled={loading || initialDataLoading}
          >
            Publish Product
          </Button>
        </div>
      </div>

      {/* API / Validation Alerts */}
      {(error || categoriesError || brandsError) && (
        <Alert
          type="error"
          showIcon
          closable={Boolean(error)}
          onClose={() => setError("")}
          title="Action Required"
          description={error || categoriesError || brandsError}
        />
      )}

      {/* Main Content */}
      {initialDataLoading ? (
        <Card className="!border-[#E2E8F0] shadow-xs">
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-[#64748B]">
            <Spin size="large" />
            <p className="text-sm font-medium">
              Loading categories, brands, and catalog configuration...
            </p>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            {/* Primary Left Column */}
            <div className="space-y-6 xl:col-span-8">
              <ProductBasicInformation
                formData={formData}
                categories={categories}
                brands={brands}
                categoriesLoading={categoriesLoading}
                brandsLoading={brandsLoading}
                selectedMainCategoryId={selectedMainCategoryId}
                subCategories={subCategories}
                subCategoriesLoading={subCategoriesLoading}
                onMainCategoryChange={handleMainCategoryChange}
                onChange={handleFormChange}
                fieldErrors={fieldErrors}
              />

              <ProductImagesSection
                thumbnail={thumbnail}
                galleryImages={galleryImages}
                onThumbnailChange={handleThumbnailChange}
                onGalleryChange={handleGalleryChange}
                onRemoveGalleryImage={removeGalleryImage}
                onMoveGalleryImage={moveGalleryImage}
                uploadProgress={uploadProgress}
                fieldErrors={fieldErrors}
              />

              <ProductVariantsSection
                variants={variants}
                onAddVariant={addVariant}
                onRemoveVariant={removeVariant}
                onVariantChange={updateVariant}
                onAddAttribute={addVariantAttribute}
                onQuickAddAttribute={quickAddVariantAttribute}
                onAttributeChange={updateVariantAttribute}
                onRemoveAttribute={removeVariantAttribute}
                onSetDefault={setDefaultVariant}
                onVariantImageChange={handleVariantImageChange}
                onRemoveVariantImage={removeVariantImage}
                variantErrors={variantErrors}
                sectionError={variantsSectionError}
              />

              <ProductSpecifications
                specifications={specifications}
                onAdd={addSpecification}
                onQuickAdd={quickAddSpecification}
                onChange={updateSpecification}
                onRemove={removeSpecification}
                error={fieldErrors.specifications || ""}
              />
            </div>

            {/* Sticky Right Sidebar */}
            <aside className="space-y-6 xl:sticky xl:top-24 xl:col-span-4">
              <ProductStatusSection
                formData={formData}
                onChange={handleFormChange}
              />

              {/* Live Summary & Pre-Flight Checklist */}
              <Card
                className="!border-[#E2E8F0] shadow-xs"
                title={
                  <div className="flex items-center gap-2 py-0.5">
                    <PackagePlus size={17} className="text-[#0755E9]" />
                    <span className="text-base font-bold text-[#101828]">
                      Listing Summary
                    </span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs">
                    <div>
                      <p className="text-[#64748B]">Price Range</p>
                      <p className="mt-1 font-bold text-[#101828]">
                        {liveSummary.minPrice !== null
                          ? liveSummary.minPrice === liveSummary.maxPrice
                            ? `₹${liveSummary.minPrice.toLocaleString("en-IN")}`
                            : `₹${liveSummary.minPrice.toLocaleString("en-IN")} – ₹${liveSummary.maxPrice.toLocaleString("en-IN")}`
                          : "Not set"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#64748B]">Active Inventory</p>
                      <p className="mt-1 font-bold text-[#101828]">
                        {liveSummary.totalStock} units ({liveSummary.variantCount}{" "}
                        {liveSummary.variantCount === 1 ? "variant" : "variants"})
                      </p>
                    </div>

                    <div className="col-span-2 border-t border-[#E2E8F0] pt-2.5">
                      <p className="text-[#64748B]">Assigned Category</p>
                      <p className="mt-0.5 truncate font-semibold text-[#101828]">
                        {liveSummary.categoryLabel}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[#64748B]">Brand</p>
                      <p className="mt-0.5 truncate font-semibold text-[#101828]">
                        {formData.brand || "Not selected"}
                      </p>
                    </div>
                  </div>

                  {/* Readiness Checklist */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#475569]">
                      Publish Readiness
                    </p>
                    {liveSummary.checklist.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        {item.done ? (
                          <CheckCircle2
                            size={15}
                            className="shrink-0 text-emerald-600"
                          />
                        ) : (
                          <Circle
                            size={15}
                            className="shrink-0 text-[#CBD5E1]"
                          />
                        )}
                        <span
                          className={
                            item.done
                              ? "font-medium text-[#101828]"
                              : "text-[#64748B]"
                          }
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Supported Catalog Policies Note */}
              <Card className="!border-[#E2E8F0] bg-[#EFF6FF]/40 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="!m-0 text-xs font-bold uppercase tracking-wide text-[#082B70]">
                        Shipping & Pricing Schema
                      </h3>
                      <Sparkles size={12} className="text-[#0755E9]" />
                    </div>
                    <p className="text-xs leading-relaxed text-[#475569]">
                      ELENZO calculates base catalog pricing from active variants automatically and manages courier AWB allocation & delivery charges at order fulfillment.
                    </p>
                  </div>
                </div>
              </Card>
            </aside>
          </div>

          <ProductFormActions
            loading={loading}
            loadingAction={loadingAction}
            onCancel={() => router.push("/admin/products")}
            onSaveDraft={() => submitProduct(false)}
            submitLabel="Publish Product"
            draftLabel="Save as Draft"
            loadingLabel="Publishing Product..."
          />
        </form>
      )}
    </div>
  );
}
