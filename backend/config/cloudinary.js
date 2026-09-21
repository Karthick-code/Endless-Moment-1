import crypto from "crypto";

const clean = (value) => String(value || "").replace(/["']/g, "").trim();

export const cloudinaryConfig = {
  cloudName: clean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKey: clean(process.env.CLOUDINARY_API_KEY),
  apiSecret: clean(process.env.CLOUDINARY_API_SECRET),
};

export const isCloudinaryConfigured = () =>
  Boolean(cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret);

export async function uploadImageDataUri(dataUri, folder = "the_pixel_studio") {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary is not configured on the backend.");
  if (!/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(dataUri)) {
    throw new Error("Only PNG, JPEG, WebP, and GIF image data is supported.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { folder, timestamp };
  const signatureBase = Object.keys(paramsToSign).sort().map((key) => `${key}=${paramsToSign[key]}`).join("&");
  const signature = crypto.createHash("sha1").update(signatureBase + cloudinaryConfig.apiSecret).digest("hex");

  const form = new FormData();
  form.append("file", dataUri);
  form.append("api_key", cloudinaryConfig.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const payload = await response.json();
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload?.error?.message || "Cloudinary upload failed.");
  }
  return payload.secure_url;
}
