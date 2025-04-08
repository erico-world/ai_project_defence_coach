/**
 * Environment Variable Check Script
 *
 * Run this script to validate that all required environment variables are set
 * for the application to function correctly.
 *
 * Usage:
 * - Basic check: node scripts/check-env.js
 * - Generate sample .env file: node scripts/check-env.js --generate-env
 */

// Check command line arguments
const args = process.argv.slice(2);
const shouldGenerateEnv = args.includes("--generate-env");

// Check Firebase configuration
const firebaseVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
];

// Check server-side Firebase Admin configuration
const firebaseAdminVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

// Check VAPI configuration
const vapiVars = ["NEXT_PUBLIC_VAPI_WEB_TOKEN", "NEXT_PUBLIC_VAPI_WORKFLOW_ID"];

// Check Google AI configuration
const googleVars = ["GOOGLE_GENERATIVE_AI_API_KEY"];

// All required variables
const allVars = [
  ...firebaseVars,
  ...vapiVars,
  ...googleVars,
  ...firebaseAdminVars,
];

// Generate a sample .env.local file
if (shouldGenerateEnv) {
  const fs = require("fs");
  const path = require("path");

  let sampleEnv = "# AI Project Defence Coach Environment Variables\n\n";

  sampleEnv += "# Firebase Client Configuration\n";
  firebaseVars.forEach((varName) => {
    sampleEnv += `${varName}="your-${varName
      .toLowerCase()
      .replace(/_/g, "-")}-here"\n`;
  });

  sampleEnv += "\n# Firebase Admin Configuration\n";
  firebaseAdminVars.forEach((varName) => {
    if (varName === "FIREBASE_PRIVATE_KEY") {
      sampleEnv += `${varName}="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_CONTENT_HERE\\n-----END PRIVATE KEY-----\\n"\n`;
    } else {
      sampleEnv += `${varName}="your-${varName
        .toLowerCase()
        .replace(/_/g, "-")}-here"\n`;
    }
  });

  sampleEnv += "\n# VAPI Configuration\n";
  vapiVars.forEach((varName) => {
    sampleEnv += `${varName}="your-${varName
      .toLowerCase()
      .replace(/_/g, "-")}-here"\n`;
  });

  sampleEnv += "\n# Google AI Configuration\n";
  googleVars.forEach((varName) => {
    sampleEnv += `${varName}="your-${varName
      .toLowerCase()
      .replace(/_/g, "-")}-here"\n`;
  });

  const envPath = path.join(process.cwd(), ".env.local.sample");
  fs.writeFileSync(envPath, sampleEnv);

  console.log(`\n✅ Sample environment file created at: ${envPath}`);
  console.log(
    "Rename this file to .env.local and fill in your actual credentials\n"
  );
  process.exit(0);
}

// Check if variables are defined in the environment
const checkVars = (vars) => {
  return vars.map((varName) => {
    const value = process.env[varName];
    const isDefined = !!value && value.trim() !== "";
    return {
      name: varName,
      defined: isDefined,
      value: isDefined
        ? varName.includes("KEY")
          ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}`
          : value.length > 30
          ? `${value.substring(0, 25)}...`
          : value
        : undefined,
    };
  });
};

// Create a helper to check for common errors in values
const validateValue = (varName, value) => {
  if (!value) return null;

  if (
    varName === "FIREBASE_PRIVATE_KEY" &&
    !value.includes("BEGIN PRIVATE KEY")
  ) {
    return "Doesn't look like a valid private key";
  }

  if (varName.includes("API_KEY") && value.length < 10) {
    return "Looks too short for an API key";
  }

  if (varName === "NEXT_PUBLIC_VAPI_WEB_TOKEN" && value.length < 30) {
    return "Looks too short for a VAPI token";
  }

  return null;
};

// Output results
console.log("\n--- Environment Variables Check ---\n");

// Check all categories
const firebaseResults = checkVars(firebaseVars);
const firebaseAdminResults = checkVars(firebaseAdminVars);
const vapiResults = checkVars(vapiVars);
const googleResults = checkVars(googleVars);

// Calculate missing variables
const allResults = [
  ...firebaseResults,
  ...firebaseAdminResults,
  ...vapiResults,
  ...googleResults,
];
const missingVars = allResults.filter((result) => !result.defined);

// Print status
const formatCategory = (name, results) => {
  const defined = results.filter((r) => r.defined).length;
  const total = results.length;
  const symbol = defined === total ? "✅" : defined === 0 ? "❌" : "⚠️";
  return `${symbol} ${name}: ${defined}/${total} variables set`;
};

console.log(formatCategory("Firebase Client", firebaseResults));
console.log(formatCategory("Firebase Admin", firebaseAdminResults));
console.log(formatCategory("VAPI", vapiResults));
console.log(formatCategory("Google AI", googleResults));
console.log();

// Print detailed status of variables
if (missingVars.length > 0) {
  console.log("Missing environment variables:");
  missingVars.forEach((v) => {
    console.log(`  - ${v.name}`);
  });
  console.log("\nTo generate a sample .env.local file, run:");
  console.log("  node scripts/check-env.js --generate-env");
  process.exit(1);
} else {
  console.log("✅ All required environment variables are set!\n");

  // Print values for diagnostic purposes
  console.log("Current values (for debugging):");
  allResults.forEach((result) => {
    const warning = validateValue(result.name, result.value);
    const warningText = warning ? ` ⚠️  ${warning}` : "";
    console.log(`  - ${result.name}: ${result.value}${warningText}`);
  });

  console.log("\nYour application should be ready to go!");
}
