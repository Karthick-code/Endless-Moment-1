import mongoose, { Schema } from "mongoose";
import { getDbState, readLocalFile, writeLocalFile } from "../config/db.js";

const LeadSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: false, default: "" },
  service: { type: String, required: false, default: "" },
  projectType: { type: String, required: false, default: "" },
  status: {
    type: String,
    enum: ["new", "contacted", "converted"],
    default: "new"
  },
  requirements: { type: String, required: false },
  paymentAmount: { type: String, required: false },
  advancePayment: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const MongoLeadModel = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

// Hybrid handler for Lead
export const LeadRepo = {
  find: async () => {
    if (getDbState()) {
      return await MongoLeadModel.find().sort({ createdAt: -1 });
    } else {
      const leads = readLocalFile("leads.json");
      // Sort descending by createdAt
      return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  create: async (data) => {
    if (getDbState()) {
      return await MongoLeadModel.create(data);
    } else {
      const leads = readLocalFile("leads.json");
      const newLead = {
        _id: `l_${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message || "",
        service: data.service || "",
        projectType: data.projectType || "",
        status: data.status || "new",
        requirements: data.requirements || "",
        paymentAmount: data.paymentAmount || "",
        advancePayment: data.advancePayment || "",
        createdAt: new Date()
      };
      leads.push(newLead);
      writeLocalFile("leads.json", leads);
      return newLead;
    }
  },

  findByIdAndUpdate: async (id, update) => {
    if (getDbState()) {
      return await MongoLeadModel.findByIdAndUpdate(id, update, { new: true });
    } else {
      const leads = readLocalFile("leads.json");
      const index = leads.findIndex(l => l._id === id);
      if (index === -1) return null;
      leads[index] = { ...leads[index], ...update };
      writeLocalFile("leads.json", leads);
      return leads[index];
    }
  }
};

export default MongoLeadModel;
