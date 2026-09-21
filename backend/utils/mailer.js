import axios from "axios";

const clean = (value = "") =>
  String(value).replace(/['"]/g, "").trim();

export function canUseEmailJS() {
  const serviceId = clean(
    process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID,
  );
  const templateId = clean(
    process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID,
  );
  const publicKey = clean(
    process.env.EMAILJS_PUBLIC_KEY ||
      process.env.VITE_EMAILJS_PUBLIC_KEY ||
      process.env.EMAILJS_USER_ID ||
      process.env.VITE_EMAILJS_USER_ID,
  );

  return Boolean(serviceId && templateId && publicKey);
}

export function maskEmail(email) {
  if (!email) return "[REDACTED_RECIPIENT]";

  const parts = email.split("@");
  if (parts.length !== 2) return "******";

  const [name, domain] = parts;

  if (name.length <= 2) {
    return `${name[0] || "*"}***@${domain}`;
  }

  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}

export async function sendEmailJSEmail({ name, email, phone, message }) {
  const serviceId = clean(
    process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID,
  );
  const templateId = clean(
    process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID,
  );
  const publicKey = clean(
    process.env.EMAILJS_PUBLIC_KEY ||
      process.env.VITE_EMAILJS_PUBLIC_KEY ||
      process.env.EMAILJS_USER_ID ||
      process.env.VITE_EMAILJS_USER_ID,
  );
  const privateKey = clean(
    process.env.EMAILJS_PRIVATE_KEY ||
      process.env.VITE_EMAILJS_PRIVATE_KEY ||
      process.env.EMAILJS_ACCESS_TOKEN ||
      process.env.VITE_EMAILJS_ACCESS_TOKEN,
  );

  const companyEmail = clean(
    process.env.COMPANY_EMAIL || process.env.VITE_COMPANY_EMAIL,
  );
  const ccEmail = clean(
    process.env.CC_EMAIL || process.env.VITE_CC_EMAIL,
  );

  const maskedCompanyEmail = maskEmail(companyEmail);
  const maskedClientEmail = maskEmail(email);

  const directorSubject = `[CRM] New Photoshoot Session Inquiry from ${name}`;
  const clientSubject = `We Received Your Photoshoot Session Vision - ENDLESS Moments`;

  const templateParams = {
    name,
    from_name: name,
    email,
    from_email: email,
    phone,
    phone_number: phone,
    message,
    reply_to: email,
    company_email: companyEmail,
    cc: ccEmail,
    subject: directorSubject,
    client_subject: clientSubject,
    summary_text: `New booking request from ${name} (${email}, Phone: ${phone}). Vision: ${message}`,
  };

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams,
  };

  if (privateKey) {
    payload.accessToken = privateKey;
  }

  if (!serviceId || !templateId || !publicKey) {
    return {
      sent: false,
      mode: "emailjs-not-configured",
      recipient: `${maskedClientEmail} & ${maskedCompanyEmail}`,
      telemetry:
        "EmailJS is not configured. Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID and EMAILJS_PUBLIC_KEY in the backend environment.",
      error: "EmailJS configuration is incomplete.",
      timestamp: new Date().toISOString(),
    };
  }

  try {
    console.log(
      `Dispatching live email via EmailJS API. Service: ${serviceId}, Template: ${templateId}`,
    );

    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "ENDLESS-Moments/1.0",
        },
      },
    );

    console.log("EmailJS API call successful:", response.data);

    return {
      sent: true,
      mode: "emailjs",
      recipient: `${maskedClientEmail} (and CC'd to ${maskedCompanyEmail})`,
      messageId: "[EMAILJS_OK]",
      telemetry:
        "Email successfully triggered through the EmailJS REST API over HTTPS.",
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const errorDetails = err.response?.data || err.message;

    console.error("EmailJS API action failed:", errorDetails);

    return {
      sent: false,
      mode: "emailjs-failed",
      recipient: `${maskedClientEmail} & ${maskedCompanyEmail}`,
      telemetry: `EmailJS REST client failed. Server response: ${
        typeof errorDetails === "object"
          ? JSON.stringify(errorDetails)
          : errorDetails
      }`,
      error:
        typeof errorDetails === "object"
          ? JSON.stringify(errorDetails)
          : errorDetails,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function sendInquiryEmail({ name, email, phone, message }) {
  return sendEmailJSEmail({ name, email, phone, message });
}
