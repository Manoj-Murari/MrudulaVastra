"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  AlertTriangle,
  X,
  Package,
  Star,
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  Edit2,
  Copy,
  ChevronDown,
} from "lucide-react";
import { getAdminProducts, updateProductField, deleteProduct, upsertProduct, manageSubCategory, manageCategory } from "@/actions/admin";
import { createClient } from "@/lib/supabase/client";

interface ProductVariant {
  color: string;
  image: string;
  gallery_images: string[];
  inventory_count: number;
}

export default function InventoryMatrix({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [isManagingSubCategories, setIsManagingSubCategories] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [actionModal, setActionModal] = useState<{
    action: 'rename' | 'delete';
    type: 'category' | 'sub_category';
    targetName: string;
    newName?: string;
  } | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);


  const COLORS = [
    "Red", "Blue", "Green", "Yellow", "Pink", "Gold", "Black", "White", "Navy", "Maroon", 
    "Silver", "Multicolor", "Grey", "Orange", "Purple", "Teal", "Mustard", "Peach", 
    "Lavender", "Emerald Green", "Olive", "Magenta", "Cream", "Beige", "Turquoise", 
    "Rust", "Coral", "Indigo", "Mint", "Wine", "Copper", "Coffee"
  ];
  const SIZES_GROUPED = {
    "General": ["Unstitched", "Free Size"],
    "Standard": ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    "Numeric": ["32", "34", "36", "38", "40", "42", "44", "46", "48"],
    "Infant": ["New born", "0-3 M", "3-6 M", "6-9M", "9-12M"],
    "Kids": ["1-2Y", "3-4Y", "5-6Y", "7-8Y"]
  };

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sub_category: "",
    price: "",
    original_price: "",
    inventory_count: "",
    image: "",
    tag: "",
    color: "",
    material: "",
    sizes: [] as string[],
    size_inventory: {} as Record<string, number>,
    gallery_images: [] as string[],
    variants: [] as ProductVariant[],
    description: "",
  });

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();
  }, [products]);

  const subCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.sub_category).filter(Boolean))).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return products.filter(
      (p) =>
        (categoryFilter === "All" || p.category === categoryFilter) &&
        (p.name.toLowerCase().includes(searchLower) ||
         p.category.toLowerCase().includes(searchLower) ||
         (p.sub_category || "").toLowerCase().includes(searchLower))
    );
  }, [products, categoryFilter, search]);

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  // Reset visible count when filter/search changes
  useEffect(() => {
    setVisibleCount(20);
  }, [categoryFilter, search]);


  /* ── Optimistic Inline Toggles ── */
  const handleToggleTrending = async (id: number, current: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_trending: !current } : p)));
    await updateProductField(id, "is_trending", !current);
  };

  const handleStockAdjust = async (id: number, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, inventory_count: Math.max(0, p.inventory_count + delta) } : p
      )
    );
    const target = products.find((p) => p.id === id);
    if (target) {
      await updateProductField(id, "inventory_count", Math.max(0, target.inventory_count + delta));
    }
  };

  const handleDelete = async () => {
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!deleteTarget || normalize(deleteConfirm) !== normalize(deleteTarget.name)) return;
    const id = deleteTarget.id;
    const targetProduct = deleteTarget;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
    setDeleteConfirm("");
    const res = await deleteProduct(id);
    if (res?.error) {
      alert("Failed to delete product: " + res.error);
      // Revert optimistic delete
      setProducts((prev) => [...prev, targetProduct]);
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    setFormData(prev => {
        if (prev.image === imgUrl) {
            const nextGallery = [...(prev.gallery_images || [])];
            const nextPrimary = nextGallery.length > 0 ? nextGallery.shift()! : "";
            return { ...prev, image: nextPrimary, gallery_images: nextGallery };
        } else {
            return { ...prev, gallery_images: (prev.gallery_images || []).filter(u => u !== imgUrl) };
        }
    });
  };

  const handleSetPrimary = (url: string) => {
    setFormData(prev => {
      if (prev.image === url) return prev;
      const oldPrimary = prev.image;
      const newGallery = [oldPrimary, ...prev.gallery_images.filter(u => u !== url)].filter(Boolean);
      return { ...prev, image: url, gallery_images: newGallery };
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setFormData(prev => {
      const gallery = [...(prev.gallery_images || [])];
      
      if (direction === 'left') {
        if (index === 0) {
          // Swap with primary
          const oldPrimary = prev.image;
          const target = gallery[0];
          const newGallery = [oldPrimary, ...gallery.slice(1)].filter(Boolean);
          return { ...prev, image: target, gallery_images: newGallery };
        }
        [gallery[index], gallery[index-1]] = [gallery[index-1], gallery[index]];
      } else {
        if (index === gallery.length - 1) return prev;
        [gallery[index], gallery[index+1]] = [gallery[index+1], gallery[index]];
      }
      
      return { ...prev, gallery_images: gallery };
    });
  };

  const handleMovePrimaryRight = () => {
    setFormData(prev => {
      const gallery = [...(prev.gallery_images || [])];
      if (gallery.length === 0) return prev;
      const oldPrimary = prev.image;
      const newPrimary = gallery[0];
      const newGallery = [oldPrimary, ...gallery.slice(1)].filter(Boolean);
      return { ...prev, image: newPrimary, gallery_images: newGallery };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 5MB)`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} is not a valid image format`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const supabase = createClient();
    
    const uploadPromises = validFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { error } = await supabase.storage.from("product-images").upload(fileName, file);
        if (error) return null;
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
        return publicUrl;
    });

    const results = await Promise.all(uploadPromises);
    const uploadedUrls = results.filter((url): url is string => url !== null);

    if (uploadedUrls.length > 0) {
        setFormData(prev => {
            const currentImages = [...(prev.gallery_images || [])];
            let newImage = prev.image;
            let urlsToAdd = [...uploadedUrls];
            if (!newImage && urlsToAdd.length > 0) {
                newImage = urlsToAdd.shift()!;
            }
            return { ...prev, image: newImage, gallery_images: [...currentImages, ...urlsToAdd] };
        });
    } else {
        alert("Image upload failed for all files.");
    }
    
    setIsUploading(false);
  };

  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 5MB)`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} is not a valid image format`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const supabase = createClient();
    const uploadedUrls: string[] = [];
    
    for (const file of validFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { error } = await supabase.storage.from("product-images").upload(fileName, file);
        if (!error) {
            const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
            uploadedUrls.push(publicUrl);
        }
    }

    setFormData(prev => {
        const newVariants = [...prev.variants];
        const targetVariant = { ...newVariants[index] };
        const allNewImages = [...uploadedUrls];
        
        if (!targetVariant.image && allNewImages.length > 0) {
            targetVariant.image = allNewImages.shift()!;
        }
        
        targetVariant.gallery_images = [...targetVariant.gallery_images, ...allNewImages];
        newVariants[index] = targetVariant;
        return { ...prev, variants: newVariants };
    });
    setIsUploading(false);
  };

  const handleSetVariantMainImage = (variantIndex: number, imageIndex: number) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const targetVariant = { ...newVariants[variantIndex] };
      const currentMain = targetVariant.image;
      const selectedImage = targetVariant.gallery_images[imageIndex];
      
      const newGallery = [currentMain, ...targetVariant.gallery_images.filter((_, i) => i !== imageIndex)].filter(Boolean);
      targetVariant.image = selectedImage;
      targetVariant.gallery_images = newGallery;
      
      newVariants[variantIndex] = targetVariant;
      return { ...prev, variants: newVariants };
    });
  };

  const handleRemoveVariantImage = (variantIndex: number, imageIndex: number, isMain: boolean) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const targetVariant = { ...newVariants[variantIndex] };
      
      if (isMain) {
        const nextImage = targetVariant.gallery_images[0] || "";
        targetVariant.image = nextImage;
        targetVariant.gallery_images = targetVariant.gallery_images.slice(1);
      } else {
        targetVariant.gallery_images = targetVariant.gallery_images.filter((_, i) => i !== imageIndex);
      }
      
      newVariants[variantIndex] = targetVariant;
      return { ...prev, variants: newVariants };
    });
  };

  const handleMoveVariantImage = (variantIndex: number, imageIndex: number, direction: 'left' | 'right') => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const targetVariant = { ...newVariants[variantIndex] };
      const gallery = [...targetVariant.gallery_images];
      
      const newIdx = direction === 'left' ? imageIndex - 1 : imageIndex + 1;
      if (newIdx < 0 || newIdx >= gallery.length) return prev;
      
      const temp = gallery[imageIndex];
      gallery[imageIndex] = gallery[newIdx];
      gallery[newIdx] = temp;
      
      targetVariant.gallery_images = gallery;
      newVariants[variantIndex] = targetVariant;
      return { ...prev, variants: newVariants };
    });
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: "", image: "", gallery_images: [], inventory_count: 0 }]
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleCreateProduct = async (e?: React.FormEvent, isDuplicate = false) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    
    // Determine the ID to use. If duplicating, we pass null to create a new entry.
    const targetId = isDuplicate ? null : editId;
    
    let totalStock = Number(formData.inventory_count) || 0;
    const activeSizeInv = Object.fromEntries(Object.entries(formData.size_inventory).filter(([k]) => formData.sizes.includes(k)));
    if (Object.keys(activeSizeInv).length > 0) {
      totalStock = Object.values(activeSizeInv).reduce((sum, val) => sum + (Number(val) || 0), 0);
    }
    
    let finalName = formData.name;
    if (isDuplicate && formData.color) {
      // Remove any existing trailing parentheses (e.g. "Product (Red)" -> "Product")
      const baseName = finalName.replace(/\s*\([^)]+\)$/, "").trim();
      finalName = `${baseName} (${formData.color})`;
    }

    const newProduct = {
      name: finalName,
      description: formData.description,
      category: formData.category,
      sub_category: formData.sub_category || null,
      price: Number(formData.price) || 0,
      original_price: Number(formData.original_price) || 0,
      inventory_count: totalStock,
      image: formData.image || "/api/placeholder/400/600",
      tag: formData.tag || "",
      color: formData.color || null,
      material: formData.material || null,
      sizes: formData.sizes.length > 0 ? formData.sizes : null,
      gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : null,
      variants: [
        ...(formData.variants.length > 0 ? formData.variants : []),
        ...(Object.keys(activeSizeInv).length > 0 ? [{ type: "size_inventory", data: activeSizeInv }] : [])
      ] as any[],
      ...(targetId ? { id: targetId } : { is_trending: false, rating: 0, reviews: 0, badge: "New" })
    };

    const res = await upsertProduct(newProduct);
    if (!res.error && res.data) {
       setProducts(prev => targetId 
         ? prev.map(p => p.id === targetId ? res.data : p) 
         : [res.data, ...prev]
       );
       setIsAdding(false);
       setEditId(null);
       setFormData({
        name: "", description: "", category: "", sub_category: "", price: "", original_price: "", inventory_count: "", image: "", tag: "", color: "", material: "", sizes: [], size_inventory: {}, gallery_images: [], variants: []
       });
    } else {
       alert("Failed to save product: " + res.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-text)" }}>
            Inventory Matrix
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
            {products.length} products · {products.filter((p) => p.inventory_count === 0).length} out of stock
          </p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setIsAddingSubCategory(false);
            setFormData({ name: "", description: "", category: "", sub_category: "", price: "", original_price: "", inventory_count: "", image: "", tag: "", color: "", material: "", sizes: [], size_inventory: {}, gallery_images: [], variants: [] });
            setIsAdding(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors"
          style={{ background: "var(--admin-accent)", color: "#000", fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border"
          style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface)" }}
        >
          <Search size={14} style={{ color: "var(--admin-text-dim)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <div className="relative sm:w-[180px]">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 pr-8 rounded-lg border outline-none text-[13px] appearance-none cursor-pointer"
            style={{ 
              borderColor: "var(--admin-border)", 
              background: "var(--admin-surface)",
              color: "var(--admin-text)",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c as string} value={c as string}>{c as string}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
            <ChevronDown size={14} style={{ color: "var(--admin-text)" }} />
          </div>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px]" style={{ color: "var(--admin-text-dim)" }}>
            No products found
          </div>
        ) : (
          visibleProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border p-4"
              style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)", fontFamily: "'DM Sans', sans-serif" }}
            >
              {/* Top: Thumbnail + Name + Price */}
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0" style={{ background: "var(--admin-surface-elevated)" }}>
                  {product.image && !product.image.includes("/api/placeholder") ? (
                    <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package size={14} style={{ color: "var(--admin-text-dim)" }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: "var(--admin-text)" }}>{product.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--admin-text-muted)" }}>
                    {product.category} {product.sub_category && <span className="opacity-70">· {product.sub_category}</span>}
                  </p>
                  {product.color && (
                    <p className="text-[10px]" style={{ color: "var(--admin-text-dim)" }}>{product.color} · {product.material}</p>
                  )}
                </div>
                <span className="text-[14px] font-bold shrink-0" style={{ color: "var(--admin-text)" }}>
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </div>
              {/* Bottom: Stock + Trending + Actions */}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStockAdjust(product.id, -1)}
                    className="w-7 h-7 rounded flex items-center justify-center text-[14px] font-bold"
                    style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-text-dim)" }}
                  >−</button>
                  <span
                    className="w-8 text-center text-[13px] font-bold"
                    style={{ color: product.inventory_count === 0 ? "var(--admin-red)" : product.inventory_count <= 2 ? "var(--admin-amber)" : "var(--admin-text)" }}
                  >{product.inventory_count}</span>
                  <button
                    onClick={() => handleStockAdjust(product.id, 1)}
                    className="w-7 h-7 rounded flex items-center justify-center text-[14px] font-bold"
                    style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-text-dim)" }}
                  >+</button>
                </div>
                <button
                  onClick={() => handleToggleTrending(product.id, product.is_trending)}
                  className="w-9 h-5 rounded-full relative transition-colors duration-200"
                  style={{
                    background: product.is_trending ? "var(--admin-accent)" : "var(--admin-surface-elevated)",
                    border: `1px solid ${product.is_trending ? "var(--admin-accent)" : "var(--admin-border)"}`,
                  }}
                >
                  <motion.div
                    animate={{ x: product.is_trending ? 16 : 2 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="absolute top-0.5 w-3.5 h-3.5 rounded-full"
                    style={{ background: product.is_trending ? "#000" : "var(--admin-text-dim)" }}
                  />
                </button>
                <div className="flex items-center gap-1">

                  <button
                    onClick={() => {
                      setEditId(product.id);
                      setIsAddingSubCategory(false);
                      setFormData({
                        name: product.name || "", description: product.description || "", category: product.category || "", sub_category: product.sub_category || "",
                        price: product.price ? product.price.toString() : "", original_price: product.original_price ? product.original_price.toString() : "",
                        inventory_count: product.inventory_count !== undefined ? product.inventory_count.toString() : "",
                        image: product.image || "", tag: product.tag || "", color: product.color || "", material: product.material || "",
                        sizes: product.sizes || [], size_inventory: Array.isArray(product.variants) ? (product.variants.find((v: any) => v.type === "size_inventory")?.data || {}) : {}, gallery_images: product.gallery_images || [], variants: Array.isArray(product.variants) ? product.variants.filter((v: any) => v.type !== "size_inventory") : [],
                      });
                      setIsAdding(true);
                    }}
                    className="p-2 rounded-lg"
                    style={{ color: "var(--admin-text-dim)" }}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => { setDeleteTarget(product); setDeleteConfirm(""); }}
                    className="p-2 rounded-lg"
                    style={{ color: "var(--admin-red)" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border overflow-x-auto admin-scroll" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
        <div className="min-w-[850px] w-full">
        {/* Header */}
        <div
          className="grid grid-cols-[48px_1fr_100px_100px_80px_80px_100px] gap-3 px-5 py-3 border-b text-[10px] uppercase tracking-[0.2em] font-bold items-center"
          style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }}
        >
          <span />
          <span>Product</span>
          <span>Category</span>
          <span className="text-right">Price</span>
          <span className="text-center">Stock</span>
          <span className="text-center">Trend</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px]" style={{ color: "var(--admin-text-dim)" }}>
            No products found
          </div>
        ) : (
          visibleProducts.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[48px_1fr_100px_100px_80px_80px_100px] gap-3 px-5 py-3 border-b items-center transition-colors duration-150"
              style={{ borderColor: "var(--admin-border)", fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden relative" style={{ background: "var(--admin-surface-elevated)" }}>
                {product.image && !product.image.includes("/api/placeholder") ? (
                  <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package size={14} style={{ color: "var(--admin-text-dim)" }} />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: "var(--admin-text)" }}>
                  {product.name}
                </p>
                {product.color && (
                  <p className="text-[10px]" style={{ color: "var(--admin-text-dim)" }}>
                    {product.color} · {product.material}
                  </p>
                )}
              </div>

              {/* Category */}
              <span className="text-[11px]" style={{ color: "var(--admin-text-muted)" }}>
                {product.category} {product.sub_category && <span className="opacity-70 text-[9px] block">↳ {product.sub_category}</span>}
              </span>

              {/* Price */}
              <span className="text-[13px] font-semibold text-right" style={{ color: "var(--admin-text)" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              {/* Stock Control */}
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => handleStockAdjust(product.id, -1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-[14px] font-bold transition-colors"
                  style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-text-dim)" }}
                >
                  −
                </button>
                <span
                  className="w-8 text-center text-[12px] font-bold"
                  style={{
                    color: product.inventory_count === 0 ? "var(--admin-red)" : product.inventory_count <= 2 ? "var(--admin-amber)" : "var(--admin-text)",
                  }}
                >
                  {product.inventory_count}
                </span>
                <button
                  onClick={() => handleStockAdjust(product.id, 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-[14px] font-bold transition-colors"
                  style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-text-dim)" }}
                >
                  +
                </button>
              </div>

              {/* Trending Toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleToggleTrending(product.id, product.is_trending)}
                  className="w-8 h-5 rounded-full relative transition-colors duration-200"
                  style={{
                    background: product.is_trending ? "var(--admin-accent)" : "var(--admin-surface-elevated)",
                    border: `1px solid ${product.is_trending ? "var(--admin-accent)" : "var(--admin-border)"}`,
                  }}
                >
                  <motion.div
                    animate={{ x: product.is_trending ? 14 : 2 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="absolute top-0.5 w-3.5 h-3.5 rounded-full"
                    style={{ background: product.is_trending ? "#000" : "var(--admin-text-dim)" }}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">

                <button
                  onClick={() => {
                    setEditId(product.id);
                    setIsAddingSubCategory(false);
                    setFormData({
                      name: product.name || "",
                      description: product.description || "",
                      category: product.category || "",
                      sub_category: product.sub_category || "",
                      price: product.price ? product.price.toString() : "",
                      original_price: product.original_price ? product.original_price.toString() : "",
                      inventory_count: product.inventory_count !== undefined ? product.inventory_count.toString() : "",
                      image: product.image || "",
                      tag: product.tag || "",
                      color: product.color || "",
                      material: product.material || "",
                      sizes: product.sizes || [],
                      size_inventory: Array.isArray(product.variants) ? (product.variants.find((v: any) => v.type === "size_inventory")?.data || {}) : {},
                      gallery_images: product.gallery_images || [],
                      variants: Array.isArray(product.variants) ? product.variants.filter((v: any) => v.type !== "size_inventory") : []
                    });
                    setIsAdding(true);
                  }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--admin-text-dim)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => { setDeleteTarget(product); setDeleteConfirm(""); }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--admin-red)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-red-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
        </div>

        {/* View More Button */}
        {hasMore && (
          <div className="flex justify-center py-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="px-6 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold border transition-all hover:bg-[var(--admin-surface-elevated)]"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-dim)" }}
            >
              View More ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 z-[200]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[201] rounded-xl border p-6"
              style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border-active)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "var(--admin-red)" }}>
                  ⚠️ Confirm Deletion
                </h3>
                <button onClick={() => setDeleteTarget(null)}>
                  <X size={18} style={{ color: "var(--admin-text-dim)" }} />
                </button>
              </div>
              <p className="text-[13px] mb-4" style={{ color: "var(--admin-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                This action is permanent and cannot be undone. To confirm, type the product name:
              </p>
              <p className="text-[14px] font-bold mb-3 px-3 py-2 rounded-lg" style={{ color: "var(--admin-text)", background: "var(--admin-surface-elevated)" }}>
                {deleteTarget.name}
              </p>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type the product name…"
                className="w-full bg-transparent border rounded-lg px-3 py-2.5 mb-4 outline-none text-[13px]"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)", fontFamily: "'DM Sans', sans-serif" }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold border"
                  style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={
                    (() => {
                      const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
                      return normalize(deleteConfirm) !== normalize(deleteTarget?.name || "");
                    })()
                  }
                  className="flex-1 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors disabled:opacity-30"
                  style={{ background: "var(--admin-red)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* ── Slide-Out Form for Add Product ── */}
        {isAdding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAdding(false); setEditId(null); }}
              className="fixed inset-0 z-[150]"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-[151] overflow-y-auto admin-scroll border-l"
              style={{ background: "var(--admin-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text)" }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {editId ? "Edit Product" : "Add New Product"}
                  </h2>
                  <button onClick={() => { setIsAdding(false); setEditId(null); setIsAddingSubCategory(false); }} className="p-2 rounded-lg" style={{ color: "var(--admin-text-dim)" }}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Product Name *</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Description</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--admin-text-dim)" }}>Category *</label>
                        <button 
                          type="button" 
                          onClick={() => setIsManagingCategories(true)}
                          className="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                      {!isAddingCategory ? (
                        <select 
                          required 
                          value={formData.category} 
                          onChange={e => {
                            if (e.target.value === "ADD_NEW") {
                              setIsAddingCategory(true);
                              setFormData({ ...formData, category: "" });
                            } else {
                              setFormData({ ...formData, category: e.target.value });
                            }
                          }}
                          className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px] appearance-none" 
                          style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)", background: "var(--admin-surface)" }}
                        >
                          <option value="" disabled>Select Category</option>
                          {categories.map(c => (
                            <option key={c as string} value={c as string}>{c as string}</option>
                          ))}
                          <option value="ADD_NEW" style={{ fontWeight: 'bold', color: 'var(--admin-accent)' }}>+ Add New Category</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input 
                            autoFocus
                            placeholder="Enter new category..."
                            value={formData.category} 
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="flex-1 bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" 
                            style={{ borderColor: "var(--admin-border-active)" }} 
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setIsAddingCategory(false);
                              if (!formData.category.trim()) {
                                setFormData({ ...formData, category: "" });
                              }
                            }}
                            className="p-2.5 rounded-lg border flex-shrink-0"
                            style={{ borderColor: "var(--admin-border-active)" }}
                          >
                            <X size={14} style={{ color: "var(--admin-text-dim)" }} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--admin-text-dim)" }}>Sub Category</label>
                        <button 
                          type="button" 
                          onClick={() => setIsManagingSubCategories(true)}
                          className="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                      {!isAddingSubCategory ? (
                        <select 
                          value={formData.sub_category} 
                          onChange={e => {
                            if (e.target.value === "ADD_NEW") {
                              setIsAddingSubCategory(true);
                              setFormData({ ...formData, sub_category: "" });
                            } else {
                              setFormData({ ...formData, sub_category: e.target.value });
                            }
                          }}
                          className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px] appearance-none" 
                          style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)", background: "var(--admin-surface)" }}
                        >
                          <option value="">No Sub Category</option>
                          {subCategories.map(sc => (
                            <option key={sc as string} value={sc as string}>{sc as string}</option>
                          ))}
                          <option value="ADD_NEW" style={{ fontWeight: 'bold', color: 'var(--admin-accent)' }}>+ Add New Sub Category</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input 
                            autoFocus
                            placeholder="Enter new sub category..."
                            value={formData.sub_category} 
                            onChange={e => setFormData({ ...formData, sub_category: e.target.value })}
                            className="flex-1 bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" 
                            style={{ borderColor: "var(--admin-border-active)" }} 
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setIsAddingSubCategory(false);
                              if (!formData.sub_category.trim()) {
                                setFormData({ ...formData, sub_category: "" });
                              }
                            }}
                            className="p-2.5 rounded-lg border flex-shrink-0"
                            style={{ borderColor: "var(--admin-border-active)" }}
                          >
                            <X size={14} style={{ color: "var(--admin-text-dim)" }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Price *</label>
                      <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value.replace(/^0+(?=\d)/, "")})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Orig. Price</label>
                      <input type="number" min="0" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value.replace(/^0+(?=\d)/, "")})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>
                        Stock * {Object.keys(Object.fromEntries(Object.entries(formData.size_inventory).filter(([k]) => formData.sizes.includes(k)))).length > 0 && <span className="text-blue-500 font-normal normal-case">(Auto-calculated)</span>}
                      </label>
                      <input 
                        required 
                        type="number" 
                        min="0" 
                        value={
                          Object.keys(Object.fromEntries(Object.entries(formData.size_inventory).filter(([k]) => formData.sizes.includes(k)))).length > 0
                            ? Object.values(Object.fromEntries(Object.entries(formData.size_inventory).filter(([k]) => formData.sizes.includes(k)))).reduce((sum, val) => sum + (Number(val) || 0), 0)
                            : formData.inventory_count
                        } 
                        onChange={e => setFormData({...formData, inventory_count: e.target.value.replace(/^0+(?=\d)/, "")})} 
                        disabled={Object.keys(Object.fromEntries(Object.entries(formData.size_inventory).filter(([k]) => formData.sizes.includes(k)))).length > 0}
                        className={`w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px] ${Object.keys(Object.fromEntries(Object.entries(formData.size_inventory).filter(([k]) => formData.sizes.includes(k)))).length > 0 ? "opacity-50 cursor-not-allowed" : ""}`} 
                        style={{ borderColor: "var(--admin-border-active)" }} 
                      />
                    </div>
                  </div>                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Product Images *</label>
                    <div className="flex flex-col gap-4">
                      {/* Upload Dropzone */}
                      <label 
                        className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ borderColor: "var(--admin-border-active)", background: "var(--admin-surface-elevated)" }}
                        onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.borderColor = "var(--admin-accent)"; }}
                        onMouseLeave={(e) => { if (!isUploading) e.currentTarget.style.borderColor = "var(--admin-border-active)"; }}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <UploadCloud size={28} style={{ color: "var(--admin-accent)" }} className="mb-3" />
                          <p className="mb-1 text-[13px] font-semibold" style={{ color: "var(--admin-text)" }}>
                            Click to upload <span className="font-normal" style={{ color: "var(--admin-text-dim)" }}>or drag and drop</span>
                          </p>
                          <p className="text-[10px] mt-1" style={{ color: "var(--admin-text-muted)" }}>
                            Upload multiple high-res images. The first image becomes the primary thumbnail.
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          multiple
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          disabled={isUploading}
                        />
                      </label>

                      {/* Mini-Gallery Preview */}
                      {(formData.image || isUploading) && (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 admin-scroll pt-2">
                          {/* Primary Image */}
                          {formData.image && (
                            <div 
                              className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border shrink-0 relative group shadow-sm"
                              style={{ borderColor: "var(--admin-accent)", background: "var(--admin-surface-elevated)" }}
                            >
                              <Image src={formData.image} alt="Primary Preview" fill sizes="112px" className="object-cover" />
                              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded shadow-sm text-[9px] font-bold uppercase tracking-wider z-10" style={{ background: "var(--admin-accent)", color: "#000" }}>
                                Primary
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-1.5 md:backdrop-blur-[1px] z-20">
                                <div className="flex justify-end">
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveImage(formData.image)} 
                                    className="w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center text-white hover:bg-red-600 active:scale-95 transition-all shadow-sm"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <div className="flex justify-end">
                                  <button 
                                    type="button" 
                                    onClick={handleMovePrimaryRight} 
                                    className="w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black hover:text-[#B8963E] active:scale-95 transition-all shadow-sm"
                                  >
                                    <ArrowRight size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Gallery Images */}
                          {formData.gallery_images && formData.gallery_images.map((url, i) => (
                            <div 
                              key={i}
                              className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border shrink-0 relative group shadow-sm"
                              style={{ borderColor: "var(--admin-border-active)", background: "var(--admin-surface-elevated)" }}
                            >
                              <Image src={url} alt={`Gallery Preview ${i+1}`} fill sizes="112px" className="object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-1.5 md:backdrop-blur-[1px] z-20">
                                <div className="flex justify-end">
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveImage(url)} 
                                    className="w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center text-white hover:bg-red-600 active:scale-95 transition-all shadow-sm"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                  <button 
                                    type="button" 
                                    onClick={() => handleMoveImage(i, 'left')} 
                                    className="w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black hover:text-[#B8963E] active:scale-95 transition-all shadow-sm"
                                  >
                                    <ArrowLeft size={13} />
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => handleSetPrimary(url)} 
                                    className="w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black hover:text-[#B8963E] active:scale-95 transition-all shadow-sm" 
                                    title="Set as Primary"
                                  >
                                    <Star size={13} />
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => handleMoveImage(i, 'right')} 
                                    className="w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black hover:text-[#B8963E] active:scale-95 transition-all shadow-sm"
                                  >
                                    <ArrowRight size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Loading Skeleton */}
                          {isUploading && (
                            <div 
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border flex items-center justify-center shrink-0"
                              style={{ borderColor: "var(--admin-border-active)", background: "var(--admin-surface-elevated)" }}
                            >
                              <span className="text-[10px] animate-pulse uppercase font-bold" style={{ color: "var(--admin-accent)" }}>Up...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Color</label>
                      <select value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px] appearance-none" style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)", background: "var(--admin-surface)" }}>
                        <option value="" style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>No Color</option>
                        {COLORS.map(c => (
                          <option key={c} value={c} style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Material</label>
                      <input value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                    </div>
                  </div>

                  {/* Color Variants Section (Legacy - Replaced by Linked Products) */}
                  {/* 
                  <div className="space-y-4 pt-4 border-t border-gold/10">
                    ... (Legacy Variant Logic) ...
                  </div> 
                  */}

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-3" style={{ color: "var(--admin-text-dim)" }}>Sizes</label>
                    <div className="space-y-4">
                      {Object.entries(SIZES_GROUPED).map(([category, sizes]) => (
                        <div key={category}>
                          <p className="text-[10px] uppercase font-bold mb-2 opacity-60" style={{ color: "var(--admin-text-dim)" }}>{category}</p>
                          <div className="flex flex-wrap gap-2">
                            {sizes.map(s => (
                              <div key={s} className="flex flex-col gap-1.5 items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev, 
                                      sizes: prev.sizes.includes(s) ? prev.sizes.filter(x => x !== s) : [...prev.sizes, s]
                                    }))
                                  }}
                                  className="px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase transition-colors"
                                  style={{
                                    background: formData.sizes.includes(s) ? "var(--admin-accent)" : "transparent",
                                    color: formData.sizes.includes(s) ? "#000" : "var(--admin-text-dim)",
                                    borderColor: formData.sizes.includes(s) ? "var(--admin-accent)" : "var(--admin-border-active)"
                                  }}
                                >
                                  {s}
                                </button>
                                {formData.sizes.includes(s) && (
                                  <input 
                                    type="number" 
                                    min="0"
                                    placeholder="Stock"
                                    value={formData.size_inventory[s] || ""}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                      setFormData(prev => ({
                                        ...prev,
                                        size_inventory: { ...prev.size_inventory, [s]: val }
                                      }))
                                    }}
                                    className="w-14 text-center text-[10px] py-1 border rounded bg-transparent outline-none"
                                    style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-3.5 rounded-lg text-[13px] uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
                      style={{ background: "var(--admin-accent)", color: "#000" }}
                    >
                      {isSaving ? "Saving..." : editId ? "Update Product" : "Create Product"}
                    </button>
                    
                    {editId && (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleCreateProduct(undefined, true)}
                        className="w-full py-3.5 rounded-lg text-[13px] uppercase tracking-wider font-bold transition-colors border-2 flex items-center justify-center gap-2"
                        style={{ borderColor: "var(--admin-accent)", color: "var(--admin-accent)" }}
                      >
                        <Copy size={14} />
                        Duplicate as New Variant
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Category Manager Modal */}
      {isManagingCategories && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh] shadow-2xl border" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border-active)" }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--admin-border-active)" }}>
              <h3 className="font-bold text-[14px] uppercase tracking-wider" style={{ color: "var(--admin-text)" }}>Manage Categories</h3>
              <button onClick={() => setIsManagingCategories(false)} className="transition-colors hover:opacity-70" style={{ color: "var(--admin-text-dim)" }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              {categories.length === 0 ? (
                <div className="p-6 text-center text-[12px]" style={{ color: "var(--admin-text-dim)" }}>No categories in use yet.</div>
              ) : (
                categories.map(sc => (
                  <div 
                    key={sc as string} 
                    className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors group"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)" }}>{sc as string}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => {
                          setActionModal({ action: 'rename', type: 'category', targetName: sc as string, newName: sc as string });
                        }} 
                        className="p-1.5 text-blue-500 rounded-md transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title="Rename globally"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setActionModal({ action: 'delete', type: 'category', targetName: sc as string });
                        }} 
                        className="p-1.5 text-red-500 rounded-md transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title="Delete globally"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub Category Manager Modal */}
      {isManagingSubCategories && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh] shadow-2xl border" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border-active)" }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--admin-border-active)" }}>
              <h3 className="font-bold text-[14px] uppercase tracking-wider" style={{ color: "var(--admin-text)" }}>Manage Sub Categories</h3>
              <button onClick={() => setIsManagingSubCategories(false)} className="transition-colors hover:opacity-70" style={{ color: "var(--admin-text-dim)" }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              {subCategories.length === 0 ? (
                <div className="p-6 text-center text-[12px]" style={{ color: "var(--admin-text-dim)" }}>No sub-categories in use yet.</div>
              ) : (
                subCategories.map(sc => (
                  <div 
                    key={sc as string} 
                    className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors group"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-elevated)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-[13px] font-medium" style={{ color: "var(--admin-text)" }}>{sc as string}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => {
                          setActionModal({ action: 'rename', type: 'sub_category', targetName: sc as string, newName: sc as string });
                        }} 
                        className="p-1.5 text-blue-500 rounded-md transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title="Rename globally"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setActionModal({ action: 'delete', type: 'sub_category', targetName: sc as string });
                        }} 
                        className="p-1.5 text-red-500 rounded-md transition-colors"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title="Delete globally"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Action Modal (Rename/Delete) */}
      {actionModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl border p-6" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border-active)" }}>
            <h3 className="font-bold text-[14px] uppercase tracking-wider mb-4" style={{ color: "var(--admin-text)" }}>
              {actionModal.action === 'rename' ? 'Rename' : 'Delete'} {actionModal.type === 'category' ? 'Category' : 'Sub Category'}
            </h3>
            
            {actionModal.action === 'rename' ? (
              <>
                <div className="mb-4 text-[12px]" style={{ color: "var(--admin-text-dim)" }}>
                  Renaming <span className="font-bold" style={{ color: "var(--admin-text)" }}>'{actionModal.targetName}'</span> will immediately update all products currently using it.
                </div>
                <input 
                  autoFocus
                  value={actionModal.newName || ""}
                  onChange={e => setActionModal({ ...actionModal, newName: e.target.value })}
                  className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px] mb-6" 
                  style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)" }}
                  placeholder="New name..."
                />
              </>
            ) : (
              <div className="mb-6 text-[12px]" style={{ color: "var(--admin-text-dim)" }}>
                Are you sure you want to delete <span className="font-bold text-red-400">'{actionModal.targetName}'</span>? 
                {actionModal.type === 'category' ? " Products using it will be marked as 'Uncategorized'." : " This will remove it from all products currently using it."}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setActionModal(null)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-lg text-[12px] font-bold uppercase transition-colors hover:bg-white/5"
                style={{ color: "var(--admin-text-dim)" }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    if (actionModal.action === 'rename') {
                      if (!actionModal.newName || actionModal.newName.trim() === "" || actionModal.newName === actionModal.targetName) {
                        setActionModal(null);
                        setIsSaving(false);
                        return;
                      }
                      const newCatName = actionModal.newName.trim();
                      if (actionModal.type === 'category') {
                        await manageCategory(actionModal.targetName, 'rename', newCatName);
                        if (categoryFilter === actionModal.targetName) {
                          setCategoryFilter(newCatName);
                        }
                      } else {
                        await manageSubCategory(actionModal.targetName, 'rename', newCatName);
                      }
                    } else {
                      if (actionModal.type === 'category') {
                        await manageCategory(actionModal.targetName, 'delete');
                        if (categoryFilter === actionModal.targetName) {
                          setCategoryFilter("All");
                        }
                      } else {
                        await manageSubCategory(actionModal.targetName, 'delete');
                      }
                    }
                    const updated = await getAdminProducts();
                    setProducts(updated);
                  } finally {
                    setIsSaving(false);
                    setActionModal(null);
                  }
                }}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase transition-colors"
                style={{ 
                  background: actionModal.action === 'delete' ? "var(--admin-red)" : "var(--admin-accent)", 
                  color: actionModal.action === 'delete' ? "#FFF" : "#000" 
                }}
              >
                {isSaving ? "Saving..." : actionModal.action === 'rename' ? "Save" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
