import { interviewCovers, mappings } from "@/constants";
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

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

// Project defense covers - used for academic projects
const projectCovers = [
  "/academic/university.png",
  "/academic/research.png",
  "/academic/thesis.png",
  "/academic/computer-science.png",
  "/academic/engineering.png",
];

export const generateProjectCover = (technology: string): string => {
  // If we have a specific tech-based cover, use that
  const techMap: Record<string, string> = {
    react: "/academic/web-project.png",
    python: "/academic/python-project.png",
    "machine learning": "/academic/ai-project.png",
    ai: "/academic/ai-project.png",
    blockchain: "/academic/blockchain-project.png",
    iot: "/academic/iot-project.png",
    mobile: "/academic/mobile-project.png",
  };

  // Check if we have a specific cover for this technology
  const techLower = technology.toLowerCase();
  if (techLower in techMap) {
    return techMap[techLower];
  }

  // Otherwise, use a random academic cover
  const randomIndex = Math.floor(Math.random() * projectCovers.length);
  return projectCovers[randomIndex];
};
