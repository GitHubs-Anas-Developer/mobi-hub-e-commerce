"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Input,
  Pagination,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  ExternalLink,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import useAdminProducts from "@/hooks/useAdminProducts";
import adminProductService from "@/services/adminProductService";
import categoryService from "@/services/categoryService";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import ProductDeleteModal from "@/components/admin/products/ProductDeleteModal";

const formatPrice = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const getPrimarySku = (product) => {
  if (!Array.isArray(product?.variants) || product.variants.length === 0) {
    return product?.sku || "—";
  }
  const defaultVariant =
    product.variants.find((v) => v.isDefault) || product.variants[0];
  return defaultVariant?.sku || "—";
};

export default function AdminProductsPage() {
  const { notification } = AntdApp.useApp();

  const {
    products,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    changePage,
    refreshProducts,
  } = useAdminProducts();

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getAdminCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (value) => {
    updateFilters({ search: String(value || "").trim() });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    updateFilters({
      search: "",
      isActive: "",
      category: "",
      brand: "",
      sort: "newest",
    });
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct?._id || deletingProduct) return;

    try {
      setDeletingProduct(true);
      const response = await adminProductService.deleteProduct(
        selectedProduct._id,
      );
      setSelectedProduct(null);
      notification.success({
        message: "Product Deleted",
        description: response.message || "Product deleted successfully.",
      });
      await refreshProducts();
    } catch (err) {
      notification.error({
        message: "Delete Failed",
        description:
          err.response?.data?.message ||
          "Unable to delete product. Please try again.",
      });
    } finally {
      setDeletingProduct(false);
    }
  };

  const handleToggleStatus = async (product) => {
    if (!product?._id || updatingStatusId) return;

    try {
      setUpdatingStatusId(product._id);
      const response = await adminProductService.toggleProductStatus(
        product._id,
      );
      notification.success({
        message: "Status Updated",
        description:
          response.message ||
          `Product ${product.isActive ? "deactivated" : "activated"} successfully.`,
      });
      await refreshProducts();
    } catch (err) {
      notification.error({
        message: "Status Update Failed",
        description:
          err.response?.data?.message || "Unable to update product status.",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const columns = [
    {
      title: "Product",
      key: "product",
      width: 280,
      render: (_, product) => (
        <div className="flex items-center gap-3">
          {product.thumbnail?.url ? (
            <img
              src={product.thumbnail.url}
              alt={product.name}
              className="h-11 w-11 shrink-0 rounded-lg border border-[#E2E8F0] object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]">
              <Package size={18} />
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/products/${product._id}/edit`}
              className="block truncate font-bold text-[#101828] hover:text-[#0755E9]"
            >
              {product.name}
            </Link>
            <p className="truncate text-xs text-[#64748B]">
              {product.brand || "ELENZO"} · {product.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "SKU",
      key: "sku",
      width: 145,
      render: (_, product) => (
        <span className="font-mono text-xs font-semibold text-[#475569]">
          {getPrimarySku(product)}
        </span>
      ),
    },
    {
      title: "Category",
      key: "category",
      width: 150,
      render: (_, product) => (
        <Tag className="!m-0">{product.category?.name || "—"}</Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "basePrice",
      key: "basePrice",
      width: 120,
      render: (price) => (
        <span className="font-bold tabular-nums text-[#101828]">
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: "Stock",
      dataIndex: "totalStock",
      key: "totalStock",
      width: 125,
      render: (stock = 0) => (
        <Tag color={stock === 0 ? "red" : stock <= 5 ? "orange" : "green"}>
          {stock === 0 ? "Out of stock" : `${stock} units`}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "isActive",
      width: 120,
      render: (_, product) => (
        <Space size="small">
          <Switch
            size="small"
            checked={Boolean(product.isActive)}
            loading={updatingStatusId === product._id}
            onChange={() => handleToggleStatus(product)}
          />
          <Tag color={product.isActive ? "green" : "default"}>
            {product.isActive ? "Active" : "Inactive"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 165,
      render: (_, product) => (
        <Space size="small">
          <Tooltip title="Edit product">
            <Link href={`/admin/products/${product._id}/edit`}>
              <Button size="small" icon={<Pencil size={13} />} />
            </Link>
          </Tooltip>
          <Tooltip title="Preview in storefront">
            <Link href={`/products/${product.slug}`} target="_blank">
              <Button size="small" icon={<ExternalLink size={13} />} />
            </Link>
          </Tooltip>
          <Tooltip title="Delete product">
            <Button
              size="small"
              danger
              icon={<Trash2 size={13} />}
              onClick={() => setSelectedProduct(product)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products Catalog"
        subtitle="Create, edit, publish, and monitor your ELENZO gadget and electronics SKUs."
        badge={`${pagination.total || 0} Products`}
        extra={
          <>
            <Button
              icon={
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={refreshProducts}
            >
              Refresh
            </Button>
            <Link href="/admin/products/create">
              <Button type="primary" icon={<Plus size={15} />}>
                Add Product
              </Button>
            </Link>
          </>
        }
      />

      <Card className="!border-[#E2E8F0]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <Input.Search
              allowClear
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (!e.target.value) updateFilters({ search: "" });
              }}
              onSearch={handleSearch}
              prefix={<Search size={15} className="text-[#94A3B8]" />}
              placeholder="Search product name, SKU, or brand..."
              enterButton="Search"
            />
          </div>

          <div className="xl:col-span-3">
            <Select
              className="w-full"
              loading={categoriesLoading}
              value={filters.category}
              onChange={(category) => updateFilters({ category })}
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((cat) => ({
                  value: cat._id,
                  label: cat.name,
                })),
              ]}
            />
          </div>

          <div className="xl:col-span-2">
            <Select
              className="w-full"
              value={filters.isActive}
              onChange={(isActive) => updateFilters({ isActive })}
              options={[
                { value: "", label: "All Status" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
            />
          </div>

          <div className="xl:col-span-2">
            <Select
              className="w-full"
              value={filters.sort}
              onChange={(sort) => updateFilters({ sort })}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "nameAZ", label: "Name A-Z" },
                { value: "nameZA", label: "Name Z-A" },
                { value: "priceLowToHigh", label: "Price: Low -> High" },
                { value: "priceHighToLow", label: "Price: High -> Low" },
              ]}
            />
          </div>
        </div>

        {(filters.search || filters.category || filters.isActive || filters.sort !== "newest") && (
          <div className="mt-3 flex justify-end">
            <Button size="small" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          </div>
        )}
      </Card>

      {error && (
        <Alert
          type="error"
          showIcon
          title={error}
          action={
            <Button size="small" onClick={refreshProducts}>
              Retry
            </Button>
          }
        />
      )}

      <Card className="!border-[#E2E8F0]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={false}
          scroll={{ x: 1040 }}
        />

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E2E8F0] px-5 py-4 sm:flex-row">
          <p className="text-xs text-[#64748B]">
            Showing {products.length} of {pagination.total || 0} products
          </p>

          <Pagination
            current={pagination.page || filters.page}
            total={pagination.total || 0}
            pageSize={filters.limit}
            onChange={(page) => changePage(page)}
          />
        </div>
      </Card>

      <ProductDeleteModal
        product={selectedProduct}
        loading={deletingProduct}
        onConfirm={handleDeleteProduct}
        onCancel={() => !deletingProduct && setSelectedProduct(null)}
      />
    </div>
  );
}
