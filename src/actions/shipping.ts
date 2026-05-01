"use server";

import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "src/config/shipping.json");

export async function getShippingSettings() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    // fallback
  }
  return { shippingCharge: 100, minFreeShippingOrderValue: 2000 };
}

export async function updateShippingSettings(settings: { shippingCharge: number; minFreeShippingOrderValue: number }) {
  try {
    const dirPath = path.dirname(configPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(settings, null, 2), "utf-8");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
