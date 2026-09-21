import { LeadRepo } from "../models/Lead.js";
import { sendInquiryEmail } from "../utils/mailer.js";
import { notifyNewEnquiry } from "../services/notifications/index.js";

export const createLead = async (req, res) => {
  const {
    name,
    email,
    phone,
    message,
    status,
    requirements,
    paymentAmount,
    advancePayment,
    service,
    projectType,
  } = req.body;

  // Validation
  if (!name || name.trim().length === 0) {
    res.status(400).json({ msg: "Name is required." });
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ msg: "A valid email address is required." });
    return;
  }

  if (!phone || phone.trim().length === 0) {
    res.status(400).json({ msg: "Phone number is required." });
    return;
  }

  const finalMessage =
    message && message.trim().length > 0
      ? message.trim()
      : "Directly registered on CRM Dashboard";

  try {
    const lead = await LeadRepo.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: finalMessage,
      service: service ? service.trim() : "",
      projectType: projectType ? projectType.trim() : "",
      status: status || "new",
      requirements: requirements ? requirements.trim() : "",
      paymentAmount: paymentAmount ? paymentAmount.trim() : "",
      advancePayment: advancePayment ? advancePayment.trim() : "",
    });

    let mailStatus = null;
    try {
      mailStatus = await sendInquiryEmail({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
      });
    } catch (mErr) {
      console.error("Failed to safely dispatch inquiry email notifier:", mErr);
    }

    // Notifications are intentionally fire-and-forget. A Slack/Discord/Telegram
    // failure must never turn a successfully stored enquiry into a failed request.
    const notificationPromise = notifyNewEnquiry(lead);
    notificationPromise.catch((notificationErr) => {
      console.error("Notification service orchestration failed:", notificationErr.message);
    });

    res.status(201).json({
      ...lead,
      lead, // Keep original container clean in case of dependency matching
      mailStatus,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        msg: "Database failure creating inquiry lead.",
        error: err.message,
      });
  }
};

export const getLeads = async (req, res) => {
  try {
    const leads = await LeadRepo.find();
    res.json(leads);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Database failure loading inquiries.", error: err.message });
  }
};

export const updateLead = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    name,
    email,
    phone,
    requirements,
    paymentAmount,
    advancePayment,
    service,
    projectType,
  } = req.body;

  const validStatuses = ["new", "contacted", "converted"];
  if (status && !validStatuses.includes(status)) {
    res
      .status(400)
      .json({
        msg: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    return;
  }

  const updateFields = {};
  if (status !== undefined) updateFields.status = status;
  if (name !== undefined) updateFields.name = name.trim();
  if (email !== undefined) updateFields.email = email.trim();
  if (phone !== undefined) updateFields.phone = phone.trim();
  if (requirements !== undefined)
    updateFields.requirements = requirements.trim();
  if (paymentAmount !== undefined)
    updateFields.paymentAmount = paymentAmount.trim();
  if (advancePayment !== undefined)
    updateFields.advancePayment = advancePayment.trim();
  if (service !== undefined) updateFields.service = service.trim();
  if (projectType !== undefined) updateFields.projectType = projectType.trim();

  try {
    const updatedLead = await LeadRepo.findByIdAndUpdate(id, updateFields);
    if (!updatedLead) {
      res.status(404).json({ msg: "Inquiry lead not found." });
      return;
    }
    res.json(updatedLead);
  } catch (err) {
    res
      .status(500)
      .json({
        msg: "Database failure updating lead data.",
        error: err.message,
      });
  }
};

