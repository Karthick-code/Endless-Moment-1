import { isCloudinaryConfigured, uploadImageDataUri } from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({ msg: "Cloudinary image hosting is not configured." });
  }

  const { dataUri } = req.body;
  if (!dataUri || typeof dataUri !== "string") {
    return res.status(400).json({ msg: "Image data is required." });
  }

  try {
    const url = await uploadImageDataUri(dataUri);
    res.status(201).json({ url });
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    res.status(502).json({ msg: "Unable to upload image to Cloudinary.", error: err.message });
  }
};
