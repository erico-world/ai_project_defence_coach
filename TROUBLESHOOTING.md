# Troubleshooting Guide: AI Project Defence Coach

This guide will help you resolve common issues with the AI Project Defence Coach application.

## Table of Contents

- [Firebase Initialization Issues](#firebase-initialization-issues)
- [VAPI SDK Authentication Errors](#vapi-sdk-authentication-errors)
- [Project Defence Form Submission Problems](#project-defence-form-submission-problems)
- [Interview Experience Issues](#interview-experience-issues)
- [Environment Variable Setup](#environment-variable-setup)

## Firebase Initialization Issues

### Symptom: "No Firebase App '[DEFAULT]' has been created" Error

This error occurs when Firebase is not properly initialized before it's being used.

**Solution:**

1. Check that Firebase initialization happens only on the client side:
   ```javascript
   if (typeof window !== "undefined") {
     // Initialize Firebase here
   }
   ```
2. Ensure all Firebase environment variables are properly set in `.env.local`:

   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

3. Run the environment check script:
   ```bash
   node scripts/check-env.js
   ```

## VAPI SDK Authentication Errors

### Symptom: 403 Forbidden Error with VAPI API

This error happens when the VAPI token is not properly set or accessed.

**Solution:**

1. Verify your VAPI Web Token in `.env.local`:

   ```
   NEXT_PUBLIC_VAPI_WEB_TOKEN="your-token-here"
   ```

2. Check the browser console for detailed error messages.

3. Ensure VAPI SDK is initialized correctly in `lib/vapi.sdk.ts`:

   ```javascript
   // Initialize VAPI with the token
   vapiInstance = new Vapi(token);
   ```

4. If problems persist, create a test script:
   ```javascript
   const Vapi = require("@vapi-ai/web");
   const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);
   console.log("VAPI initialized:", !!vapi);
   ```

## Project Defence Form Submission Problems

### Symptom: Form submission fails or doesn't redirect

**Solution:**

1. Check the browser console for API errors.

2. Verify the API response in the Network tab.

3. Ensure the form data is correctly formatted:

   ```javascript
   const requestBody = {
     projectTitle: formData.projectTitle,
     academicLevel: formData.academicLevel,
     technologiesUsed: formData.technologiesUsed,
     focusRatio: formData.focusRatio,
     questionCount: parseInt(formData.questionCount),
     userId: user.id,
     projectFile: fileData,
   };
   ```

4. Verify redirect logic is working:
   ```javascript
   const redirectUrl = `/interview/${data.interviewId}`;
   router.push(redirectUrl);
   ```

## Interview Experience Issues

### Symptom: Call button doesn't work or voice doesn't connect

**Solution:**

1. Check that your browser supports the Web Audio API.

2. Ensure you've granted microphone permissions.

3. Verify VAPI initialization in the `Agent` component:

   ```javascript
   const vapi = getVapi();
   if (!vapi) {
     throw new Error("Failed to initialize VAPI SDK");
   }
   ```

4. Look for detailed errors in the console when clicking the call button.

## Environment Variable Setup

To verify your environment setup:

1. Create or update the `.env.local` file with all required variables.

2. Run the environment check script:

   ```bash
   node scripts/check-env.js
   ```

3. Restart your development server:

   ```bash
   npm run dev
   ```

4. Clear your browser cache or use incognito mode to test.

## Still Having Issues?

If you continue to experience problems:

1. Check the latest logs in the browser console (F12 > Console).
2. Try running in a different browser to isolate browser-specific issues.
3. Verify that your VAPI account has active credits and is properly configured.
4. Check network connections for any blocked requests.

For Firebase issues, you might need to verify your Firebase project settings and authentication methods are properly configured in the Firebase console.
