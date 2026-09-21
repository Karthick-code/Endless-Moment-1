// import axios from "axios";

// // ==========================================
// // SLACK WEBHOOK CONFIGURATION
// // Add your Slack Incoming Webhook URL
// // to SLACK_WEBHOOK_URL in .env
// // ==========================================

// export async function notifySlack(enquiry) {
//   const webhook = process.env.SLACK_WEBHOOK_URL?.trim();
//   if (!webhook) return { skipped: true, service: "slack" };

//   const text = [
//     "📩 *New enquiry — ENDLESS Moments*",
//     `*Name:* ${enquiry.name}`,
//     `*Email:* ${enquiry.email}`,
//     `*Phone:* ${enquiry.phone}`,
//     `*Service / Project Type:* ${enquiry.projectType || enquiry.service || "Not specified"}`,
//     `*Message:* ${enquiry.message || "—"}`,
//     `*Received:* ${new Date(enquiry.createdAt || Date.now()).toLocaleString("en-IN")}`,
//   ].join("\n");

//   await axios.post(webhook, { text }, { timeout: 8000 });
//   return { sent: true, service: "slack" };
// }

import axios from "axios";

// ==========================================
// SLACK WEBHOOK CONFIGURATION
// Add your Slack Incoming Webhook URL
// to SLACK_WEBHOOK_URL in .env
// ==========================================

export async function notifySlack(enquiry) {
  const webhook = process.env.SLACK_WEBHOOK_URL?.trim();

  if (!webhook) {
    console.log("⚠️ Slack notification skipped: SLACK_WEBHOOK_URL is not configured");
    return { skipped: true, service: "slack" };
  }

  const text = [
    "📩 *New enquiry — ENDLESS Moments*",
    `*Name:* ${enquiry.name}`,
    `*Email:* ${enquiry.email}`,
    `*Phone:* ${enquiry.phone}`,
    `*Service:* ${enquiry.service || "Not specified"}`,
    `*Project Type:* ${enquiry.projectType || "Not specified"}`,
    `*Message:* ${enquiry.message || "—"}`,
    `*Received:* ${new Date(
      enquiry.createdAt || Date.now()
    ).toLocaleString("en-IN")}`,
  ].join("\n");

  try {
    const response = await axios.post(
      webhook,
      { text },
      {
        timeout: 8000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Slack notification sent successfully:", response.status);

    return {
      sent: true,
      service: "slack",
    };
  } catch (error) {
    console.error(
      "❌ Slack notification failed:",
      error.response?.data || error.message
    );

    throw error;
  }
}
