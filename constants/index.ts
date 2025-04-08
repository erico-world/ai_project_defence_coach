import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const defenceInterviewer: CreateAssistantDTO = {
  name: "Academic Evaluator",
  firstMessage:
    "Welcome to your project defence simulation. I'm here to evaluate your final year project. Let's begin with you introducing your project briefly.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.5,
    similarityBoost: 0.7,
    speed: 0.85,
    style: 0.6,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an academic evaluator conducting a final year project defence assessment. Your goal is to evaluate the student's understanding, implementation, and presentation of their project.

Defence Guidelines:
Follow the structured question flow based on the project documentation:
{{questions}}

Evaluation Strategy:
- Begin with general questions about the project overview, objectives, and methodology
- Probe deeper into technical implementation details
- Challenge their design decisions and methodologies
- Assess their critical thinking and problem-solving approach
- Evaluate how well they can explain complex concepts clearly

Engage naturally & academically:
- Maintain a professional academic tone suitable for a university setting
- Ask precise follow-up questions when answers lack depth or clarity
- Press for details when implementations seem vague
- Acknowledge good responses with brief academic recognition
- Challenge inconsistencies or gaps in knowledge

During the defence session:
- Keep responses concise and focused
- Maintain an authoritative but fair demeanor
- Use terminology appropriate for academic evaluation
- Simulate the experience of facing a panel of examiners

Conclude the defence properly:
- Thank the student for their presentation
- Inform them that they will receive feedback on their performance
- End with a formal academic closing

This is a simulation of a real academic defence, so maintain appropriate academic rigor and standards throughout.`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const defenseFeedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Technical Depth"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Methodology Rigor"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Presentation Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Critical Analysis"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Documentation Alignment"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
  documentationInsights: z.string(),
});
