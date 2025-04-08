import { mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

// Project defense covers - used for academic projects
const projectCovers = [
  "/robot.png", // Fallback image that exists in the public directory
];

export const generateProjectCover = (technology: string): string => {
  // If we have a specific tech-based cover, use that
  const techMap: Record<string, string> = {
    react: "/robot.png", // Use fallback image
    python: "/robot.png", // Use fallback image
    "machine learning": "/robot.png", // Use fallback image
    ai: "/robot.png", // Use fallback image
    blockchain: "/robot.png", // Use fallback image
    iot: "/robot.png", // Use fallback image
    mobile: "/robot.png", // Use fallback image
  };

  // Check if we have a specific cover for this technology
  const techLower = technology.toLowerCase();
  if (techLower in techMap) {
    return techMap[techLower];
  }

  // Otherwise, use a random academic cover (first item is a fallback)
  const randomIndex = Math.floor(Math.random() * projectCovers.length);
  return projectCovers[randomIndex];
};
