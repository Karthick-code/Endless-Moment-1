import { ProjectRepo } from "../models/Project.js";

const normalizeProject = ({ title, description, category, images }) => {
  const validImages = Array.isArray(images)
    ? images.map((img) => String(img).trim()).filter(Boolean)
    : [];
  return {
    title: String(title || "").trim(),
    description: String(description || "").trim(),
    category: String(category || "other").trim().toLowerCase(),
    images: validImages,
  };
};

export const getProjects = async (req, res) => {
  try {
    res.json(await ProjectRepo.find());
  } catch (err) {
    res.status(500).json({ msg: "Database failure loading projects portfolio.", error: err.message });
  }
};

export const createProject = async (req, res) => {
  const data = normalizeProject(req.body);
  if (!data.title) return res.status(400).json({ msg: "Project title is required." });
  if (!data.description) return res.status(400).json({ msg: "Project description is required." });
  if (!data.images.length) return res.status(400).json({ msg: "At least one portfolio image URL is required." });

  try {
    res.status(201).json(await ProjectRepo.create(data));
  } catch (err) {
    res.status(500).json({ msg: "Database failure recording new project.", error: err.message });
  }
};

export const updateProject = async (req, res) => {
  const data = normalizeProject(req.body);
  if (!data.title) return res.status(400).json({ msg: "Project title is required." });
  if (!data.description) return res.status(400).json({ msg: "Project description is required." });
  if (!data.images.length) return res.status(400).json({ msg: "At least one portfolio image URL is required." });

  try {
    const project = await ProjectRepo.update(req.params.id, data);
    if (!project) return res.status(404).json({ msg: "Project not found." });
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Database failure updating project.", error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await ProjectRepo.delete(req.params.id);
    if (!project) return res.status(404).json({ msg: "Project not found." });
    res.json({ msg: "Project deleted successfully.", project });
  } catch (err) {
    res.status(500).json({ msg: "Database failure deleting project.", error: err.message });
  }
};
