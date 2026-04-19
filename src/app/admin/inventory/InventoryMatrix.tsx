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
} from "lucide-react";
import { updateProductField, deleteProduct, upsertProduct } from "@/actions/admin";
import { createClient } from "@/lib/supabase/client";

export default function InventoryMatrix({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const CATEGORIES = ["Sarees", "Dress Materials", "Kids Wear", "Lehengas", "Kurtas", "Accessories"];
  const COLORS = ["Red", "Blue", "Green", "Yellow", "Pink", "Gold", "Black", "White", "Navy", "Maroon", "Silver", "Multicolor", "Grey", "Orange", "Purple"];
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
    if (!deleteTarget || deleteConfirm !== deleteTarget.name) return;
    const id = deleteTarget.id;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
    setDeleteConfirm("");
    await deleteProduct(id);
  };

  const handleRemoveImage = (imgUrl: string) => {
    setFormData(prev => {
        if (prev.image === imgUrl) {
            // Pick next from gallery as primary if exists
            const nextGallery = [...(prev.gallery_images || [])];
            const nextPrimary = nextGallery.length > 0 ? nextGallery.shift()! : "";
            return { ...prev, image: nextPrimary, gallery_images: nextGallery };
        } else {
            return { ...prev, gallery_images: (prev.gallery_images || []).filter(u => u !== imgUrl) };
        }
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
      ...(editId ? { id: editId } : { is_trending: false, rating: 5, reviews: 0, badge: "New" })
    };

    const res = await upsertProduct(newProduct);
    if (!res.error) {
       setProducts(prev => editId ? prev.map(p => p.id === editId ? { ...p, ...newProduct } : p) : [{ id: Math.random() * 1000000, ...newProduct }, ...prev]);
       setIsAdding(false);
       setEditId(null);
       setFormData({
        name: "", category: "", price: "", original_price: "", inventory_count: "", image: "", tag: "", color: "", material: "", sizes: [], gallery_images: []
       });
    } else {
       alert("Failed to add product: " + res.error);
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
            setFormData({ name: "", category: "", price: "", original_price: "", inventory_count: "", image: "", tag: "", color: "", material: "", sizes: [], gallery_images: [] });
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
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
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
                  disabled={deleteConfirm !== deleteTarget.name}
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
                              <Image src={formData.image} alt="Primary Preview" fill className="object-cover" />
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ background: "var(--admin-accent)", color: "#000" }}>
                                Primary
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleRemoveImage(formData.image)}
                                className="absolute top-1 right-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                                style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}

                          {/* Gallery Images */}
                          {formData.gallery_images && formData.gallery_images.map((url, i) => (
                            <div 
                              key={i}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border shrink-0 relative group"
                              style={{ borderColor: "var(--admin-border-active)", background: "var(--admin-surface-elevated)" }}
                            >
                              <Image src={url} alt={`Gallery Preview ${i+1}`} fill className="object-cover" />
                              <button 
                                type="button"
                                onClick={() => handleRemoveImage(url)}
                                className="absolute top-1 right-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                                style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                              >
                                <X size={12} />
                              </button>
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
                        <option value="">No Color</option>
                        {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: "var(--admin-text-dim)" }}>Material</label>
                      <input value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full bg-transparent border rounded-lg px-3 py-2.5 outline-none text-[13px]" style={{ borderColor: "var(--admin-border-active)" }} />
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
