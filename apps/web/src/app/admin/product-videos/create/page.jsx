
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import {
  ArrowLeft,
  Upload,
  Video,
  X,
  Loader2,
  Film,
  Search,
  Check,
  ChevronDown,
  Package,
} from "lucide-react";

import adminProductService from "@/services/adminProductService";
import { createProductVideo } from "@/store/thunks/productVideoThunks";

// Get product image safely
const getProductImage = (product) => {
  const image =
    product?.thumbnail?.url ||
    product?.thumbnail ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    product?.image?.url ||
    product?.image ||
    "";

  return typeof image === "string" && image.trim()
    ? image.trim()
    : null;
};

// Extract products from common API response structures
const extractProducts = (response) => {
  const possibleLists = [
    response?.products,
    response?.data?.products,
    response?.data?.data?.products,
    response?.data,
    response?.data?.data,
  ];

  return possibleLists.find(Array.isArray) || [];
};

export default function CreateProductVideoPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { uploading } = useSelector(
    (state) => state.productVideos
  );

  // Products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Video form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [error, setError] = useState("");

  // Fetch products
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setError("");

        const response = await adminProductService.getProducts({
          page: 1,
          limit: 100,
        });

        console.log("Products API response:", response);

        const productList = extractProducts(response);

        if (isMounted) {
          setProducts(productList);
        }
      } catch (err) {
        console.error("Fetch products error:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load products. Please refresh the page."
          );
        }
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Video preview
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.slug?.toLowerCase().includes(term)
      );
    });
  }, [products, productSearch]);

  // Select product
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setProductSearch("");
    setDropdownOpen(false);
    setError("");
  };

  // Remove selected product
  const handleRemoveProduct = () => {
    setSelectedProduct(null);
  };

  // Video validation
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only MP4, WebM and MOV videos are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("Video size cannot exceed 100 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  // Remove selected video
  const handleRemoveVideo = () => {
    setSelectedFile(null);
  };

  // Submit form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedProduct?._id) {
      setError("Please select a product.");
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setError("Title must contain at least 3 characters.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a video.");
      return;
    }

    try {
      await dispatch(
        createProductVideo({
          videoData: {
            productId: selectedProduct._id,
            title: title.trim(),
            description: description.trim(),
          },
          file: selectedFile,
        })
      ).unwrap();

      router.push("/admin/product-videos");
    } catch (err) {
      console.error("Create product video error:", err);

      setError(
        typeof err === "string"
          ? err
          : err?.message ||
              err?.response?.data?.message ||
              "Failed to upload product video."
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/product-videos"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Product Videos
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">
          Add Product Video
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Upload a product reel to your ELENZO video shopping feed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* Product and video details */}
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">

            {/* Product selector */}
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Product <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen((prev) => !prev);
                  setError("");
                }}
                disabled={productsLoading || products.length === 0}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-300 px-4 py-3 text-left transition hover:border-blue-500 focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                {selectedProduct ? (
                  <div className="flex min-w-0 items-center gap-3">
                    {getProductImage(selectedProduct) ? (
                      <Image
                        src={getProductImage(selectedProduct)}
                        alt={selectedProduct.name || "Product"}
                        width={42}
                        height={42}
                        unoptimized
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                        <Package
                          size={18}
                          className="text-slate-400"
                        />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {selectedProduct.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        ₹{selectedProduct.price ?? "N/A"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">
                    {productsLoading
                      ? "Loading products..."
                      : products.length === 0
                        ? "No products available"
                        : "Choose a product"}
                  </span>
                )}

                <ChevronDown
                  size={18}
                  className="shrink-0 text-slate-500"
                />
              </button>

              {/* Product dropdown */}
              {dropdownOpen && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                  {/* Search */}
                  <div className="border-b border-slate-100 p-3">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                      <Search
                        size={16}
                        className="text-slate-400"
                      />

                      <input
                        type="text"
                        value={productSearch}
                        onChange={(event) =>
                          setProductSearch(event.target.value)
                        }
                        placeholder="Search products..."
                        className="w-full py-2.5 text-sm outline-none"
                        autoFocus
                      />

                      {productSearch && (
                        <button
                          type="button"
                          onClick={() => setProductSearch("")}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product list */}
                  <div className="max-h-64 overflow-y-auto">
                    {productsLoading ? (
                      <div className="flex items-center justify-center gap-2 p-5 text-sm text-slate-500">
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Loading products...
                      </div>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() =>
                            handleSelectProduct(product)
                          }
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50"
                        >
                          {getProductImage(product) ? (
                            <Image
                              src={getProductImage(product)}
                              alt={product.name || "Product"}
                              width={42}
                              height={42}
                              unoptimized
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                              <Package
                                size={18}
                                className="text-slate-400"
                              />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {product.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              ₹{product.price ?? "N/A"}
                            </p>
                          </div>

                          {selectedProduct?._id === product._id && (
                            <Check
                              size={18}
                              className="text-blue-600"
                            />
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-center text-sm text-slate-500">
                        No products found.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Selected product ID */}
              {selectedProduct && (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-blue-50 px-3 py-2">
                  <p className="min-w-0 truncate text-xs text-blue-700">
                    Product ID: {selectedProduct._id}
                  </p>

                  <button
                    type="button"
                    onClick={handleRemoveProduct}
                    className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}

              {!productsLoading && products.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No products were returned by the products API.
                </p>
              )}
            </div>

            {/* Video title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Video Title <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={100}
                placeholder="Example: Discover Premium Earbuds"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {title.length}/100
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                maxLength={500}
                rows={5}
                placeholder="Write a short description for this product video..."
                className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <p className="text-right text-xs text-slate-400">
                {description.length}/500
              </p>
            </div>

            {/* Video requirements */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-3">
                <Film
                  className="shrink-0 text-blue-700"
                  size={20}
                />

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Video requirements
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    MP4, WebM or MOV format. Maximum file size:
                    100 MB. Vertical 9:16 videos are recommended
                    for Reels.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Video upload */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div>
              <h2 className="font-semibold text-slate-900">
                Video Upload
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Select your product video.
              </p>
            </div>

            {previewUrl ? (
              <div className="relative mx-auto w-full max-w-[230px] overflow-hidden rounded-xl bg-black">
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="aspect-[9/16] w-full object-contain"
                />

                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow"
                  title="Remove video"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 text-center transition hover:border-blue-500 hover:bg-blue-50">
                <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-700">
                  <Upload size={28} />
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  Choose a video
                </span>

                <span className="mt-2 text-xs text-slate-500">
                  MP4, WebM or MOV
                </span>

                <span className="mt-1 text-xs text-slate-400">
                  Maximum 100 MB
                </span>

                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Selected file information */}
            {selectedFile && (
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Video
                    size={18}
                    className="shrink-0 text-blue-700"
                  />

                  <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                    {selectedFile.name}
                  </p>
                </div>

                <p className="mt-1 pl-6 text-xs text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">
          <Link
            href="/admin/product-videos"
            className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={uploading || productsLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading Video...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Product Video
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
