import { notifySlack } from "./slack.js";
import { notifyDiscord } from "./discord.js";
import { notifyTelegram } from "./telegram.js";

export async function notifyNewEnquiry(enquiry) {
  const services = [
    ["slack", notifySlack],
    ["discord", notifyDiscord],
    ["telegram", notifyTelegram],
  ];

  const results = await Promise.allSettled(
    services.map(async ([name, fn]) => {
      try {
        return await fn(enquiry);
      } catch (error) {
        console.error(`❌ ${name} notification failed:`, error.message);
        return { sent: false, service: name, error: error.message };
      }
    })
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    return { sent: false, service: services[index][0], error: result.reason?.message || "Unknown error" };
  });
}
