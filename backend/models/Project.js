import mongoose, { Schema } from "mongoose";
import { getDbState, readLocalFile, writeLocalFile } from "../config/db.js";

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, default: "other" },
  images: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MongoProjectModel = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

const DEFAULT_PROJECT_SEEDS = [
  {
    _id: "proj_1",
    title: "Elysian Bloom Wedding",
    description: "An elegant outdoor garden wedding ceremony in pristine daylight capturing candid intimate moments.",
    category: "wedding-shoots",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
    ],
    createdAt: new Date("2026-04-10"),
    updatedAt: new Date("2026-04-10"),
  },
  {
    _id: "proj_2",
    title: "Golden Hour Romance",
    description: "Pre-wedding cinematic session at a serene lakeside location during the majestic sunset twilight.",
    category: "pre-wedding-romance",
    images: ["https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200"],
    createdAt: new Date("2026-05-12"),
    updatedAt: new Date("2026-05-12"),
  },
  {
    _id: "proj_3",
    title: "Vanguard Fashion Reel",
    description: "High-definition video production, narrative storytelling reels and professional sound synthesis capturing dynamic motion.",
    category: "cinematic-video-edits",
    images: ["https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200"],
    createdAt: new Date("2026-05-20"),
    updatedAt: new Date("2026-05-20"),
  },
  {
    _id: "proj_4",
    title: "Vogue Portrait Session",
    description: "Studio lighting and studio-grade portraits focusing on high contrast, visual clarity, and editorial look.",
    category: "editorial-portraits",
    images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200"],
    createdAt: new Date("2026-05-22"),
    updatedAt: new Date("2026-05-22"),
  },
];

export const ProjectRepo = {
  find: async () => {
    if (getDbState()) {
      const dbProjects = await MongoProjectModel.find().sort({ createdAt: -1 });
      return dbProjects.length ? dbProjects : DEFAULT_PROJECT_SEEDS;
    }
    return readLocalFile("projects.json", DEFAULT_PROJECT_SEEDS);
  },

  create: async (data) => {
    if (getDbState()) return await MongoProjectModel.create(data);

    const projects = readLocalFile("projects.json", DEFAULT_PROJECT_SEEDS);
    const newProj = {
      _id: `proj_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    projects.push(newProj);
    writeLocalFile("projects.json", projects);
    return newProj;
  },

  update: async (id, data) => {
    if (getDbState()) return await MongoProjectModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    const projects = readLocalFile("projects.json", DEFAULT_PROJECT_SEEDS);
    const index = projects.findIndex((project) => project._id === id);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...data, updatedAt: new Date() };
    writeLocalFile("projects.json", projects);
    return projects[index];
  },

  delete: async (id) => {
    if (getDbState()) return await MongoProjectModel.findByIdAndDelete(id);
    const projects = readLocalFile("projects.json", DEFAULT_PROJECT_SEEDS);
    const index = projects.findIndex((project) => project._id === id);
    if (index === -1) return null;
    const [deleted] = projects.splice(index, 1);
    writeLocalFile("projects.json", projects);
    return deleted;
  },
};

export default MongoProjectModel;
