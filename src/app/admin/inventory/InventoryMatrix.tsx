"use client";

import { useState } from "react";
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
} from "lucide-react";
import { updateProductField, deleteProduct, upsertProduct } from "@/actions/admin";
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
  
  const CATEGORIES = ["Sarees", "Kurtas", "Dress Materials", "Kids Wear", "Lehengas", "Accessories"];
  const COLORS = [
    "Red", "Blue", "Green", "Yellow", "Pink", "Gold", "Black", "White", "Navy", "Maroon", 
    "Silver", "Multicolor", "Grey", "Orange", "Purple", "Teal", "Mustard", "Peach", 
    "Lavender", "Emerald Green", "Olive", "Magenta", "Cream", "Beige", "Turquoise", 
    "Rust", "Coral", "Indigo", "Mint", "Wine", "Copper", "Coffee"
  ];
  const SIZES = ["Unstitched", "Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL", "1-2Y", "3-4Y", "5-6Y", "7-8Y"];

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    original_price: "",
    inventory_count: "",
    image: "",
    tag: "",
    color: "",
    material: "",
    sizes: [] as string[],
    gallery_images: [] as string[],
    variants: [] as ProductVariant[],
  });

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

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

    setIsUploading(true);
    const supabase = createClient();
    
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(async (file) => {
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
    setIsUploading(true);
    const supabase = createClient();
    const fileArray = Array.from(files);
    const uploadedUrls: string[] = [];
    
    for (const file of fileArray) {
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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const newProduct = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price) || 0,
      original_price: Number(formData.original_price) || 0,
      inventory_count: Number(formData.inventory_count) || 0,
      image: formData.image || "/api/placeholder/400/600",
      tag: formData.tag || "",
      color: formData.color || null,
      material: formData.material || null,
      sizes: formData.sizes.length > 0 ? formData.sizes : null,
      gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : null,
      variants: formData.variants.length > 0 ? (formData.variants as any) : [],
      ...(editId ? { id: editId } : { is_trending: false, rating: 5, reviews: 0, badge: "New" })
    };

    const res = await upsertProduct(newProduct);
    if (!res.error && res.data) {
       setProducts(prev => editId 
         ? prev.map(p => p.id === editId ? res.data : p) 
         : [res.data, ...prev]
       );
       setIsAdding(false);
       setEditId(null);
       setFormData({
        name: "", category: "", price: "", original_price: "", inventory_count: "", image: "", tag: "", color: "", material: "", sizes: [], gallery_images: [], variants: []
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
            setFormData({ name: "", category: "", price: "", original_price: "", inventory_count: "", image: "", tag: "", color: "", material: "", sizes: [], gallery_images: [], variants: [] });
            setIsAdding(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] uppercase tracking-wider font-bold transition-colors"
          style={{ background: "var(--admin-accent)", color: "#000", fontFamily: "'DM Sans', sans-serif" }}
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border"
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

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto admin-scroll" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
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
          filtered.map((product) => (
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
                {product.category}
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
                    setFormData({
                      name: product.name || "",
                      category: product.category || "",
                      price: product.price ? product.price.toString() : "",
                      original_price: product.original_price ? product.original_price.toString() : "",
                      inventory_count: product.inventory_count !== undefined ? product.inventory_count.toString() : "",
                      image: product.image || "",
                      tag: product.tag || "",
                      color: product.color || "",
                      material: product.material || "",
                      sizes: product.sizes || [],
                      gallery_images: product.gallery_images || [],
                      variants: (product.variants as any) || []
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
                  <button onClick={() => { setIsAdding(false); setEditId(null); }} className="p-2 rounded-lg" style={{ color: "var(--admin-text-dim)" }}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Product Name *</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Category *</label>
                      <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px] appearance-none" style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)", background: "var(--admin-surface)" }}>
                        <option value="" disabled>Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Tag</label>
                      <input value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="e.g. Designer" className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Price *</label>
                      <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Orig. Price</label>
                      <input type="number" min="0" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Stock *</label>
                      <input required type="number" min="0" value={formData.inventory_count} onChange={e => setFormData({...formData, inventory_count: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Product Images *</label>
                    <div className="flex flex-col gap-4">
                      {/* Upload Input */}
                      <div className="flex-1">
                        <input 
                          type="file" 
                          multiple
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          disabled={isUploading}
                          className="w-full text-[12px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-[var(--admin-accent)] file:text-black hover:file:opacity-90 transition-opacity disabled:opacity-50" 
                          style={{ color: "var(--admin-text-dim)", fontFamily: "'DM Sans', sans-serif" }} 
                        />
                        <p className="text-[10px] mt-2" style={{ color: "var(--admin-text-dim)" }}>
                          Upload multiple high-res images. First image is the primary grid thumbnail.
                        </p>
                      </div>

                      {/* Mini-Gallery Preview */}
                      {(formData.image || isUploading) && (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 admin-scroll">
                          {/* Primary Image */}
                          {formData.image && (
                            <div 
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border shrink-0 relative group"
                              style={{ borderColor: "var(--admin-accent)", background: "var(--admin-surface-elevated)" }}
                            >
                              <Image src={formData.image} alt="Primary Preview" fill sizes="80px" className="object-cover" />
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ background: "var(--admin-accent)", color: "#000" }}>
                                Primary
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <button type="button" onClick={handleMovePrimaryRight} className="p-1 rounded bg-white/20 text-white hover:bg-white/40">
                                  <motion.span animate={{ x: 2 }} className="block">→</motion.span>
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveImage(formData.image)}
                                  className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Gallery Images */}
                          {formData.gallery_images && formData.gallery_images.map((url, i) => (
                            <div 
                              key={i}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border shrink-0 relative group"
                              style={{ borderColor: "var(--admin-border-active)", background: "var(--admin-surface-elevated)" }}
                            >
                              <Image src={url} alt={`Gallery Preview ${i+1}`} fill sizes="80px" className="object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <button type="button" onClick={() => handleMoveImage(i, 'left')} className="p-1 rounded bg-white/20 text-white hover:bg-white/40">
                                  ←
                                </button>
                                <button type="button" onClick={() => handleSetPrimary(url)} className="p-1 rounded bg-white/20 text-white hover:bg-white/40 text-[8px] font-bold uppercase">
                                  ⭐
                                </button>
                                <button type="button" onClick={() => handleMoveImage(i, 'right')} className="p-1 rounded bg-white/20 text-white hover:bg-white/40">
                                  →
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveImage(url)}
                                  className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                                >
                                  <Trash2 size={12} />
                                </button>
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

                  {/* Color Variants Section */}
                  <div className="space-y-4 pt-4 border-t border-gold/10">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--admin-text-dim)" }}>Color Variants</label>
                      <button 
                        type="button" 
                        onClick={handleAddVariant}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors"
                        style={{ background: "var(--admin-surface-elevated)", color: "var(--admin-accent)" }}
                      >
                        + Add Variant
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.variants.map((v, idx) => (
                        <div key={idx} className="p-4 rounded-xl border space-y-4" style={{ borderColor: "var(--admin-border)", background: "var(--admin-surface-elevated)" }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] uppercase font-bold mb-2 opacity-60">Variant Color</label>
                                  <select 
                                    value={v.color} 
                                    onChange={e => {
                                      const newVariants = [...formData.variants];
                                      newVariants[idx] = { ...newVariants[idx], color: e.target.value };
                                      setFormData({...formData, variants: newVariants});
                                    }}
                                    className="w-full bg-transparent border rounded-lg px-2 py-1.5 outline-none text-[12px]" 
                                    style={{ borderColor: "var(--admin-border-active)", color: "var(--admin-text)", background: "var(--admin-surface)" }}
                                  >
                                    <option value="" style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>Select Color</option>
                                    {COLORS.map(c => (
                                      <option key={c} value={c} style={{ background: "var(--admin-surface)", color: "var(--admin-text)" }}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-bold mb-2 opacity-60">Stock</label>
                                  <input 
                                    type="number" 
                                    value={v.inventory_count} 
                                    onChange={e => {
                                      const newVariants = [...formData.variants];
                                      newVariants[idx] = { ...newVariants[idx], inventory_count: Number(e.target.value) };
                                      setFormData({...formData, variants: newVariants});
                                    }}
                                    className="w-full bg-transparent border rounded-lg px-2 py-1.5 outline-none text-[12px]" 
                                    style={{ borderColor: "var(--admin-border-active)" }}
                                  />
                                </div>
                              </div>

                               <div className="mt-4">
                                <label className="block text-[10px] uppercase font-bold mb-3 opacity-60">Variant Photos</label>
                                <div className="flex flex-col gap-3">
                                  <input 
                                    type="file" 
                                    multiple
                                    onChange={e => handleVariantImageUpload(idx, e)}
                                    className="text-[10px] file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-forest file:text-white hover:file:bg-forest/80 cursor-pointer"
                                  />
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {/* Main Variant Image */}
                                    {v.image && (
                                      <div className="relative w-16 h-20 border-2 border-forest rounded overflow-hidden group shadow-lg">
                                        <Image src={v.image} alt="Main" fill sizes="60px" className="object-cover" />
                                        <div className="absolute top-0 left-0 bg-forest text-white text-[7px] px-1 font-bold">MAIN</div>
                                        <button 
                                          type="button"
                                          onClick={() => handleRemoveVariantImage(idx, -1, true)}
                                          className="absolute top-0 right-0 p-0.5 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X size={10} />
                                        </button>
                                      </div>
                                    )}
                                    
                                    {/* Gallery Images */}
                                    {v.gallery_images.map((img, imgIdx) => (
                                      <div key={imgIdx} className="relative w-16 h-20 border border-admin-border-active rounded overflow-hidden group hover:border-gold transition-colors">
                                        <Image src={img} alt="Gallery" fill sizes="60px" className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                          <button 
                                            type="button"
                                            onClick={() => handleSetVariantMainImage(idx, imgIdx)}
                                            className="p-1 bg-white/90 rounded-full text-gold hover:bg-white"
                                            title="Set as Main"
                                          >
                                            <Star size={10} fill="currentColor" />
                                          </button>
                                          {imgIdx > 0 && (
                                            <button 
                                              type="button"
                                              onClick={() => handleMoveVariantImage(idx, imgIdx, 'left')}
                                              className="p-1 bg-white/90 rounded-full text-forest hover:bg-white"
                                              title="Move Left"
                                            >
                                              <ArrowLeft size={10} />
                                            </button>
                                          )}
                                          {imgIdx < v.gallery_images.length - 1 && (
                                            <button 
                                              type="button"
                                              onClick={() => handleMoveVariantImage(idx, imgIdx, 'right')}
                                              className="p-1 bg-white/90 rounded-full text-forest hover:bg-white"
                                              title="Move Right"
                                            >
                                              <ArrowRight size={10} />
                                            </button>
                                          )}
                                          <button 
                                            type="button"
                                            onClick={() => handleRemoveVariantImage(idx, imgIdx, false)}
                                            className="p-1 bg-white/90 rounded-full text-red-500 hover:bg-white"
                                            title="Remove"
                                          >
                                            <X size={10} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveVariant(idx)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-3" style={{ color: "var(--admin-text-dim)" }}>Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map(s => (
                        <button
                          type="button"
                          key={s}
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
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-3.5 rounded-lg text-[13px] uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
                      style={{ background: "var(--admin-accent)", color: "#000" }}
                    >
                      {isSaving ? "Saving..." : editId ? "Update Product" : "Create Product"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
