import crypto from "crypto";

const clean = (value) => String(value || "").replace(/[\'"]/g, "").trim();

const getCloudinaryConfig = () => ({
  cloudName: clean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKey: clean(process.env.CLOUDINARY_API_KEY),
  apiSecret: clean(process.env.CLOUDINARY_API_SECRET),
  folder: clean(process.env.CLOUDINARY_FOLDER || "Endless-Moment"),
});

export const cloudinaryConfig = getCloudinaryConfig;

export const isCloudinaryConfigured = () => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return Boolean(cloudName && apiKey && apiSecret);
};

export async function uploadImageDataUri(dataUri, folder) {
  const config = getCloudinaryConfig();

  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the backend environment.",
    );
  }

  if (typeof dataUri !== "string" || !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(dataUri)) {
    throw new Error("Only PNG, JPEG, WebP, and GIF image data is supported.");
  }

  const uploadFolder = clean(folder || config.folder) || "Endless-Moment";
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { folder: uploadFolder, timestamp };
  const signatureBase = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase + config.apiSecret)
    .digest("hex");

  const form = new FormData();
  form.append("file", dataUri);
  form.append("api_key", config.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", uploadFolder);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`,
    {
      method: "POST",
      body: form,
    },
  );

  const responseText = await response.text();
  let payload = {};
  try {
    payload = JSON.parse(responseText);
  } catch {
    payload = { raw: responseText };
  }

  if (!response.ok || !payload.secure_url) {
    throw new Error(
      payload?.error?.message ||
        payload?.raw ||
        `Cloudinary upload failed with status ${response.status}.`,
    );
  }

  return payload.secure_url;
}
