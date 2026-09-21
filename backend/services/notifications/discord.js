import axios from "axios";

// ==========================================
// DISCORD WEBHOOK CONFIGURATION
// Add your Discord Webhook URL
// to DISCORD_WEBHOOK_URL in .env
// ==========================================

export async function notifyDiscord(enquiry) {
  const webhook = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhook) return { skipped: true, service: "discord" };

  const content = [
    "📩 **New enquiry — ENDLESS Moments**",
    `**Name:** ${enquiry.name}`,
    `**Email:** ${enquiry.email}`,
    `**Phone:** ${enquiry.phone}`,
    `**Service / Project Type:** ${enquiry.projectType || enquiry.service || "Not specified"}`,
    `**Message:** ${enquiry.message || "—"}`,
    `**Received:** ${new Date(enquiry.createdAt || Date.now()).toLocaleString("en-IN")}`,
  ].join("\n");

  await axios.post(webhook, { content }, { timeout: 8000 });
  return { sent: true, service: "discord" };
}
