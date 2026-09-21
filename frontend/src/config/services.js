import {
  Camera,
  Heart,
  Cake,
  House,
  Baby,
  BookOpen,
  Sparkles,
  Clapperboard,
} from "lucide-react";

// Single source of truth for every service offered by ENDLESS Moments.
// Reuse this list anywhere services/categories are displayed or selected.
export const services = [
  {
    slug: "wedding-shoots",
    title: "Wedding Shoots",
    icon: Camera,
    description:
      "Full-day wedding photography covering traditional rituals, grand entries, and candid tender expressions.",
  },
  {
    slug: "pre-wedding-romance",
    title: "Pre-Wedding Romance",
    icon: Heart,
    description:
      "Unscripted, romantic couple captures at scenic spots, utilizing golden reflections and customized color tones.",
  },
  {
    slug: "cinematic-video-edits",
    title: "Cinematic Video Edits",
    icon: Clapperboard,
    description:
      "Transform raw footage into engaging cinematic videos with professional editing, color grading, transitions, sound design, and storytelling.",
  },
  {
    slug: "birthday-captures",
    title: "Birthday Captures",
    icon: Cake,
    description:
      "Celebrate milestones with vibrant and candid photography that captures the joy, laughter, and memories of your birthday event.",
  },
  {
    slug: "house-warming",
    title: "House Warming",
    icon: House,
    description:
      "Document the happiness of your new beginning with beautiful photography of your housewarming ceremony and family gatherings.",
  },
  {
    slug: "baby-shower",
    title: "Baby Shower",
    icon: Baby,
    description:
      "Cherish the excitement of welcoming a new family member with heartwarming baby shower photography.",
  },
  {
    slug: "editorial-portraits",
    title: "Editorial Portraits",
    icon: Sparkles,
    description:
      "Professionally edited portraits tailored to your preferences, with advanced retouching, creative enhancements, and custom framing options.",
  },
  {
    slug: "album-designing",
    title: "Album Designing",
    icon: BookOpen,
    description:
      "Transform your favorite moments into professionally designed photo albums that tell your story beautifully.",
  },
];

export const getServiceBySlug = (slug) =>
  services.find((service) => service.slug === slug);
