import Vapi from "@vapi-ai/web";

// Initialize VAPI only on the client side to prevent server-side errors
let vapiInstance: typeof Vapi.prototype | null = null;

// Better initialization with validation, logging, and error handling
const initializeVapi = () => {
  // Prevent server-side execution
  if (typeof window === "undefined") {
    console.log("VAPI initialization skipped on server side");
    return null;
  }

  // If we already have an instance, return it
  if (vapiInstance) {
    console.log("Returning existing VAPI instance");
    return vapiInstance;
  }

  try {
    // Check if the token is available
    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

    if (!token) {
      const error = new Error(
        "VAPI Web Token is missing. Please check your environment variables."
      );
      console.error(error.message);
      throw error;
    }

    console.log("Initializing VAPI with token length:", token.length);

    // Initialize VAPI with the token
    vapiInstance = new Vapi(token);

    // Configure VAPI instance
    if (vapiInstance) {
      // Add event listeners for debugging
      vapiInstance.on("error", (error: Error) => {
        console.error("VAPI Error Event:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
          details: JSON.stringify(error),
        });
      });

      // Add more event listeners for debugging
      vapiInstance.on("call-start", () => console.log("VAPI Call Started"));
      vapiInstance.on("call-end", () => console.log("VAPI Call Ended"));
      vapiInstance.on("message", (message) =>
        console.log("VAPI Message:", message)
      );
      vapiInstance.on("speech-start", () => console.log("VAPI Speech Started"));
      vapiInstance.on("speech-end", () => console.log("VAPI Speech Ended"));

      // Configure CORS and retry settings
      // @ts-expect-error - Property assignment for configuration
      vapiInstance.config = {
        cors: {
          credentials: "include",
          mode: "cors",
        },
        retry: {
          maxAttempts: 3,
          delay: 1000,
        },
      };
    }

    console.log("VAPI SDK initialized successfully");
    return vapiInstance;
  } catch (error) {
    console.error("Failed to initialize VAPI SDK:", error);
    return null;
  }
};

// Lazy initialization - will be initialized when first accessed
export const getVapi = () => {
  // Safety check for server-side rendering
  if (typeof window === "undefined") {
    return null;
  }

  // Initialize and return the instance
  if (!vapiInstance) {
    vapiInstance = initializeVapi();
  }
  return vapiInstance;
};

// For backward compatibility - initialize on demand to prevent hydration issues
export const vapi = typeof window !== "undefined" ? getVapi() : null;
