import axios from "axios";

// ==========================================
// TELEGRAM BOT CONFIGURATION
// Create a bot with @BotFather and place its
// token in TELEGRAM_BOT_TOKEN. Put the target
// group/channel/chat ID in TELEGRAM_CHAT_ID.
// ==========================================

export async function notifyTelegram(enquiry) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return { skipped: true, service: "telegram" };

  const text = [
    "📩 New enquiry — ENDLESS Moments",
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `Service / Project Type: ${enquiry.projectType || enquiry.service || "Not specified"}`,
    `Message: ${enquiry.message || "—"}`,
    `Received: ${new Date(enquiry.createdAt || Date.now()).toLocaleString("en-IN")}`,
  ].join("\n");

  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text,
  }, { timeout: 8000 });

  return { sent: true, service: "telegram" };
}
