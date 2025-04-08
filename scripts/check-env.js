/**
 * Environment Variable Check Script
 *
 * Run this script to validate that all required environment variables are set
 * for the application to function correctly.
 */

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

// Check VAPI configuration
const vapiVars = ["NEXT_PUBLIC_VAPI_WEB_TOKEN", "NEXT_PUBLIC_VAPI_WORKFLOW_ID"];

// Check Google AI configuration
const googleVars = ["GOOGLE_GENERATIVE_AI_API_KEY"];

// All required variables
const allVars = [...firebaseVars, ...vapiVars, ...googleVars];

// Check if variables are set
const missingVars = allVars.filter((varName) => {
  const value = process.env[varName];
  return !value || value.trim() === "";
});

// Output results
console.log("\n--- Environment Variables Check ---\n");

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error("\nPlease set these variables in your .env.local file\n");
  process.exit(1);
} else {
  console.log("✅ All required environment variables are set!\n");

  // Additional checks for token formats
  if (
    process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN &&
    process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN.length < 30
  ) {
    console.warn(
      "⚠️  NEXT_PUBLIC_VAPI_WEB_TOKEN seems too short - verify it is correct"
    );
  }

  if (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY.startsWith("AIza")
  ) {
    console.warn(
      '⚠️  GOOGLE_GENERATIVE_AI_API_KEY format looks incorrect - should start with "AIza"'
    );
  }

  console.log("Environment is properly configured for:");
  console.log("- ✅ Firebase Authentication and Database");
  console.log("- ✅ VAPI Integration");
  console.log("- ✅ Google Generative AI");
  console.log("\nYour application should be ready to go!\n");
}
