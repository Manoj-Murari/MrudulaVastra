import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.replace(/"/g, ""),
  api_key: process.env.CLOUDINARY_API_KEY?.replace(/"/g, ""),
  api_secret: process.env.CLOUDINARY_API_SECRET?.replace(/"/g, ""),
});

const CLOUDINARY_FOLDER = "mrudulavastra_products";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadResults: string[] = [];

    for (const file of files) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        continue; // Skip files over 5MB
      }
      if (!file.type.startsWith("image/")) {
        continue; // Skip non-image files
      }

      // Convert File to base64 data URI for Cloudinary upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;

      // Generate a deterministic-ish public_id
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      const publicId = `upload_${timestamp}_${random}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: CLOUDINARY_FOLDER,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });

      // Build the delivery URL with f_auto,q_auto transformations
      const transformedUrl = cloudinary.url(`${CLOUDINARY_FOLDER}/${publicId}`, {
        fetch_format: "auto",
        quality: "auto",
        secure: true,
      });

      uploadResults.push(transformedUrl);
    }

    if (uploadResults.length === 0) {
      return NextResponse.json(
        { error: "No valid files could be uploaded" },
        { status: 400 }
      );
    }

    return NextResponse.json({ urls: uploadResults });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
