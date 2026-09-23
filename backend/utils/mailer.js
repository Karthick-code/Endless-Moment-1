import axios from "axios";

const clean = (value = "") => String(value).replace(/[\'"]/g, "").trim();

const getEmailJSConfig = () => ({
  serviceId: clean(
    process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID,
  ),
  templateId: clean(
    process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID,
  ),
  publicKey: clean(
    process.env.EMAILJS_PUBLIC_KEY ||
      process.env.VITE_EMAILJS_PUBLIC_KEY ||
      process.env.EMAILJS_USER_ID ||
      process.env.VITE_EMAILJS_USER_ID,
  ),
  privateKey: clean(
    process.env.EMAILJS_PRIVATE_KEY ||
      process.env.VITE_EMAILJS_PRIVATE_KEY ||
      process.env.EMAILJS_ACCESS_TOKEN ||
      process.env.VITE_EMAILJS_ACCESS_TOKEN,
  ),
});

const getPasswordResetTemplateId = () =>
  clean(
    process.env.EMAILJS_PASSWORD_RESET_TEMPLATE_ID ||
      process.env.VITE_EMAILJS_PASSWORD_RESET_TEMPLATE_ID,
  );

export function canUseEmailJS() {
  const { serviceId, templateId, publicKey } = getEmailJSConfig();
  return Boolean(serviceId && templateId && publicKey);
}

export function canUsePasswordResetEmail() {
  const { serviceId, publicKey } = getEmailJSConfig();
  return Boolean(serviceId && publicKey && getPasswordResetTemplateId());
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

const sendEmailJSRequest = async ({ templateId, templateParams }) => {
  const { serviceId, publicKey, privateKey } = getEmailJSConfig();

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("EmailJS configuration is incomplete.");
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams,
  };

  if (privateKey) payload.accessToken = privateKey;

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

  return response.data;
};

export async function sendEmailJSEmail({ name, email, phone, message }) {
  const { templateId } = getEmailJSConfig();
  const companyEmail = clean(
    process.env.COMPANY_EMAIL || process.env.VITE_COMPANY_EMAIL,
  );
  const ccEmail = clean(process.env.CC_EMAIL || process.env.VITE_CC_EMAIL);

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

  if (!canUseEmailJS()) {
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
    const responseData = await sendEmailJSRequest({
      templateId,
      templateParams,
    });

    return {
      sent: true,
      mode: "emailjs",
      recipient: `${maskedClientEmail} (and CC'd to ${maskedCompanyEmail})`,
      messageId: "[EMAILJS_OK]",
      telemetry: "Email successfully triggered through the EmailJS REST API over HTTPS.",
      providerResponse: responseData,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const errorDetails = err.response?.data || err.message;
    const errorText =
      typeof errorDetails === "object" ? JSON.stringify(errorDetails) : errorDetails;

    console.error("EmailJS API action failed:", errorText);

    return {
      sent: false,
      mode: "emailjs-failed",
      recipient: `${maskedClientEmail} & ${maskedCompanyEmail}`,
      telemetry: `EmailJS REST client failed. Server response: ${errorText}`,
      error: errorText,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function sendInquiryEmail({ name, email, phone, message }) {
  return sendEmailJSEmail({ name, email, phone, message });
}

export async function sendPasswordResetEmail({ email, resetUrl }) {
  const templateId = getPasswordResetTemplateId();
  if (!templateId || !canUsePasswordResetEmail()) {
    throw new Error(
      "Password reset EmailJS is not configured. Set EMAILJS_PASSWORD_RESET_TEMPLATE_ID along with the existing EmailJS service/public key variables.",
    );
  }

  const subject = "Reset your ENDLESS Moments admin password";
  const maskedRecipient = maskEmail(email);

  try {
    await sendEmailJSRequest({
      templateId,
      templateParams: {
        to_email: email,
        email,
        to_name: email,
        subject,
        reset_url: resetUrl,
        reset_link: resetUrl,
        expires_in: "30 minutes",
        company_name: "ENDLESS Moments",
      },
    });

    return {
      sent: true,
      mode: "emailjs",
      recipient: maskedRecipient,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const errorDetails = err.response?.data || err.message;
    const errorText =
      typeof errorDetails === "object" ? JSON.stringify(errorDetails) : errorDetails;
    throw new Error(`Password reset email failed: ${errorText}`);
  }
}
