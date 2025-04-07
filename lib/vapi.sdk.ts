import Vapi from "@vapi-ai/web";

// Better initialization with validation, logging, and error handling
const initializeVapi = () => {
  try {
    // Check if the token is available
    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

    if (!token) {
      console.error(
        "VAPI Web Token is missing. Please check your environment variables."
      );
      throw new Error("VAPI Web Token is required");
    }

    // Initialize VAPI with the token
    const vapiInstance = new Vapi(token, {
      debug: true, // Enable debugging for development
    });

    console.log("VAPI SDK initialized successfully");

    return vapiInstance;
  } catch (error) {
    console.error("Failed to initialize VAPI SDK:", error);
    // Return a minimal implementation to prevent crashes
    return new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || "");
  }
};

export const vapi = initializeVapi();
