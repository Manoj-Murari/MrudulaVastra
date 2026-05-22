/**
 * migrate-to-cloudinary.js
 * 
 * Migrates product images from Supabase Storage to Cloudinary.
 * Handles: products.image, products.gallery_images[], and 
 *          products.variants[].image + variants[].gallery_images[]
 * 
 * Usage:
 *   node migrate-to-cloudinary.js --test   # Dry run: 2 products, no DB update
 *   node migrate-to-cloudinary.js          # Full migration: all products, updates DB
 */

const { createClient } = require("@supabase/supabase-js");
const cloudinary = require("cloudinary").v2;
const path = require("path");

// ─── Load environment variables from .env.local ────────────────────────────
require("dotenv").config({ path: path.resolve(__dirname, ".env.local") });

// ─── Configuration ─────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.replace(/"/g, "").trim();
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY?.replace(/"/g, "").trim();
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET?.replace(/"/g, "").trim();

const CLOUDINARY_FOLDER = "mrudulavastra_products";
const TEST_MODE = process.argv.includes("--test");

// ─── Validate credentials ─────────────────────────────────────────────────
function validateConfig() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_SERVICE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (!CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
  if (missing.length > 0) {
    console.error(`\n❌ Missing environment variables: ${missing.join(", ")}`);
    console.error("   Ensure these are set in your .env.local file.\n");
    process.exit(1);
  }
}

// ─── Initialize clients ───────────────────────────────────────────────────
validateConfig();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Check if a URL is a Supabase storage URL */
function isSupabaseUrl(url) {
  return typeof url === "string" && url.includes("supabase.co");
}

/** Check if a URL is already on Cloudinary */
function isCloudinaryUrl(url) {
  return typeof url === "string" && url.includes("cloudinary.com");
}

/**
 * Upload a single image URL to Cloudinary.
 * Returns the delivery URL with f_auto,q_auto transformations baked in.
 * Uses overwrite:true + deterministic public_id for idempotency.
 */
async function uploadToCloudinary(imageUrl, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: CLOUDINARY_FOLDER,
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    });

    // Build the delivery URL with f_auto,q_auto transformations
    // Format: https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/v<version>/<folder>/<public_id>.<ext>
    const transformedUrl = cloudinary.url(`${CLOUDINARY_FOLDER}/${publicId}`, {
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });

    return transformedUrl;
  } catch (err) {
    console.error(`   ⚠️  Failed to upload ${publicId}: ${err.message}`);
    return null;
  }
}

/**
 * Process a single image URL. Uploads to Cloudinary if it's a Supabase URL.
 * Returns the new URL, or the original if already migrated / not Supabase.
 */
async function migrateUrl(url, publicId) {
  if (!url || typeof url !== "string") return url;
  if (isCloudinaryUrl(url)) {
    console.log(`   ⏭️  Already on Cloudinary: ${publicId}`);
    return url;
  }
  if (!isSupabaseUrl(url)) {
    console.log(`   ⏭️  Not a Supabase URL, skipping: ${publicId}`);
    return url;
  }

  console.log(`   ☁️  Uploading: ${publicId}`);
  const newUrl = await uploadToCloudinary(url, publicId);
  return newUrl || url; // fallback to original on failure
}

/**
 * Process all image fields for a single product.
 * Returns the update payload (only changed fields).
 */
async function processProduct(product) {
  const productId = product.id;
  const changes = {};
  let uploadCount = 0;

  console.log(`\n── Product #${productId}: "${product.name}" ──`);

  // 1. Primary image
  const newImage = await migrateUrl(product.image, `product_${productId}_main`);
  if (newImage !== product.image) {
    changes.image = newImage;
    uploadCount++;
  }

  // 2. Gallery images
  if (Array.isArray(product.gallery_images) && product.gallery_images.length > 0) {
    const newGallery = [];
    let galleryChanged = false;

    for (let i = 0; i < product.gallery_images.length; i++) {
      const newUrl = await migrateUrl(
        product.gallery_images[i],
        `product_${productId}_gallery_${i}`
      );
      newGallery.push(newUrl);
      if (newUrl !== product.gallery_images[i]) galleryChanged = true;
    }

    if (galleryChanged) {
      changes.gallery_images = newGallery;
      uploadCount += newGallery.filter((u, i) => u !== product.gallery_images[i]).length;
    }
  }

  // 3. Variants (JSON array with image + gallery_images per variant)
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const newVariants = [];
    let variantsChanged = false;

    for (let vi = 0; vi < product.variants.length; vi++) {
      const variant = { ...product.variants[vi] };
      const variantLabel = variant.color || `variant_${vi}`;

      // Skip size_inventory type entries (they don't have images)
      if (variant.type === "size_inventory") {
        newVariants.push(variant);
        continue;
      }

      // Variant primary image
      if (variant.image && isSupabaseUrl(variant.image)) {
        const newVarImage = await migrateUrl(
          variant.image,
          `product_${productId}_${variantLabel}_main`
        );
        if (newVarImage !== variant.image) {
          variant.image = newVarImage;
          variantsChanged = true;
          uploadCount++;
        }
      }

      // Variant gallery images
      if (Array.isArray(variant.gallery_images) && variant.gallery_images.length > 0) {
        const newVarGallery = [];
        for (let gi = 0; gi < variant.gallery_images.length; gi++) {
          const newUrl = await migrateUrl(
            variant.gallery_images[gi],
            `product_${productId}_${variantLabel}_gallery_${gi}`
          );
          newVarGallery.push(newUrl);
          if (newUrl !== variant.gallery_images[gi]) {
            variantsChanged = true;
            uploadCount++;
          }
        }
        variant.gallery_images = newVarGallery;
      }

      newVariants.push(variant);
    }

    if (variantsChanged) {
      changes.variants = newVariants;
    }
  }

  return { changes, uploadCount };
}

// ─── Main Execution ────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   Supabase → Cloudinary Image Migration             ║");
  console.log(`║   Mode: ${TEST_MODE ? "🧪 TEST (2 products, no DB writes)" : "🚀 FULL MIGRATION"}           ║`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // Fetch products with Supabase URLs in any image field
  // We cast the filter broadly — the script itself checks each URL
  let query = supabase
    .from("products")
    .select("id, name, image, gallery_images, variants")
    .or("image.ilike.%supabase.co%");

  if (TEST_MODE) {
    query = query.limit(2);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("❌ Failed to fetch products:", error.message);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log("✅ No products found with Supabase image URLs. Nothing to migrate.\n");

    // In case some products have Supabase URLs in gallery_images or variants
    // but not in the primary image field, run a broader query
    console.log("🔍 Running broader check (gallery_images & variants may contain Supabase URLs)...");
    
    let broadQuery = supabase
      .from("products")
      .select("id, name, image, gallery_images, variants");
    
    if (TEST_MODE) {
      broadQuery = broadQuery.limit(2);
    }

    const { data: allProducts, error: broadError } = await broadQuery;

    if (broadError) {
      console.error("❌ Broad query failed:", broadError.message);
      process.exit(1);
    }

    // Filter to products that have any Supabase URL in any image field
    const productsWithSupabase = (allProducts || []).filter((p) => {
      if (isSupabaseUrl(p.image)) return true;
      if (Array.isArray(p.gallery_images) && p.gallery_images.some(isSupabaseUrl)) return true;
      if (Array.isArray(p.variants)) {
        return p.variants.some(
          (v) =>
            isSupabaseUrl(v.image) ||
            (Array.isArray(v.gallery_images) && v.gallery_images.some(isSupabaseUrl))
        );
      }
      return false;
    });

    if (productsWithSupabase.length === 0) {
      console.log("✅ No Supabase URLs found anywhere in the products table. All clean!\n");
      return;
    }

    console.log(`\n📦 Found ${productsWithSupabase.length} products with Supabase URLs in gallery/variants.\n`);
    await processProducts(productsWithSupabase);
    return;
  }

  console.log(`📦 Found ${products.length} products with Supabase image URLs.\n`);
  await processProducts(products);
}

async function processProducts(products) {
  const results = [];
  let totalUploads = 0;
  let totalSkipped = 0;

  for (const product of products) {
    const { changes, uploadCount } = await processProduct(product);

    if (Object.keys(changes).length === 0) {
      console.log(`   ✅ No changes needed for product #${product.id}`);
      totalSkipped++;
      continue;
    }

    totalUploads += uploadCount;

    // ─── Collect result for summary ───
    const result = {
      id: product.id,
      name: product.name,
      uploadsCount: uploadCount,
      newImage: changes.image || "(unchanged)",
      newGalleryCount: changes.gallery_images ? changes.gallery_images.length : 0,
      variantsUpdated: !!changes.variants,
    };

    // ─── Log new URLs ───
    if (changes.image) {
      console.log(`   ✅ New primary image: ${changes.image}`);
    }
    if (changes.gallery_images) {
      changes.gallery_images.forEach((url, i) => {
        if (url !== (product.gallery_images || [])[i]) {
          console.log(`   ✅ New gallery[${i}]: ${url}`);
        }
      });
    }
    if (changes.variants) {
      changes.variants.forEach((v, i) => {
        if (v.type === "size_inventory") return;
        const orig = product.variants[i];
        if (v.image !== orig?.image) {
          console.log(`   ✅ Variant "${v.color}" image: ${v.image}`);
        }
        if (Array.isArray(v.gallery_images)) {
          v.gallery_images.forEach((url, gi) => {
            if (url !== orig?.gallery_images?.[gi]) {
              console.log(`   ✅ Variant "${v.color}" gallery[${gi}]: ${url}`);
            }
          });
        }
      });
    }

    // ─── Database Update (skip in test mode) ───
    if (TEST_MODE) {
      console.log(`\n   🧪 TEST MODE — Skipping database update for product #${product.id}`);
      result.dbUpdated = false;
    } else {
      const { error: updateError } = await supabase
        .from("products")
        .update(changes)
        .eq("id", product.id);

      if (updateError) {
        console.error(`   ❌ DB update failed for product #${product.id}: ${updateError.message}`);
        result.dbUpdated = false;
      } else {
        console.log(`   ✅ Database updated for product #${product.id}`);
        result.dbUpdated = true;
      }
    }

    results.push(result);
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║                  MIGRATION SUMMARY                  ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  Mode:              ${TEST_MODE ? "🧪 TEST (dry run)" : "🚀 PRODUCTION"}              ║`);
  console.log(`║  Products processed: ${String(results.length).padEnd(4)}                           ║`);
  console.log(`║  Products skipped:   ${String(totalSkipped).padEnd(4)}                           ║`);
  console.log(`║  Images uploaded:    ${String(totalUploads).padEnd(4)}                           ║`);
  console.log(`║  DB updates:         ${TEST_MODE ? "NONE (test mode)" : `${results.filter(r => r.dbUpdated).length} successful`}       ║`);
  console.log("╚══════════════════════════════════════════════════════╝");

  if (TEST_MODE && results.length > 0) {
    console.log("\n🔗 Verify these Cloudinary URLs in your browser:");
    console.log("─".repeat(55));
    results.forEach((r) => {
      if (r.newImage !== "(unchanged)") {
        console.log(`  Product #${r.id} (${r.name}):`);
        console.log(`    ${r.newImage}`);
      }
    });
    console.log("─".repeat(55));
    console.log("\n✅ If URLs load correctly, run without --test for full migration:");
    console.log("   node migrate-to-cloudinary.js\n");
  }
}

main().catch((err) => {
  console.error("\n💥 Unexpected error:", err);
  process.exit(1);
});
