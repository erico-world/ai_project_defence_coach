"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

import ProjectFileUpload from "./ProjectFileUpload";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/firebase/client";

const projectLevels = ["Bachelor's", "Master's", "PhD"];
const focusTypes = ["Mostly Theory", "Balanced", "Mostly Implementation"];

const ProjectDefenceForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    projectTitle: "",
    academicLevel: "Bachelor's",
    technologiesUsed: "",
    focusRatio: "Balanced",
    questionCount: "5",
  });

  // Get current user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // If no user is found, redirect to login
        router.push("/sign-in");
      }
    };
    fetchUser();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (file: File) => {
    setProjectFile(file);
  };

  // Function to upload file to Firebase Storage
  const uploadFileToStorage = async (file: File) => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const storage = getStorage(app);
      const timestamp = Date.now();
      const fileName = `projects/${user.id}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return {
        name: file.name,
        type: file.type,
        url: downloadURL,
        path: fileName,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, validating fields...");
    console.log("Form data:", formData);

    if (!formData.projectTitle || !formData.technologiesUsed) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user?.id) {
      toast.error("Please sign in to continue");
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);
    console.log("Starting form submission process...");

    try {
      // Handle file upload if there is a file
      let fileData = null;

      if (projectFile) {
        console.log("Uploading project file...");
        try {
          fileData = await uploadFileToStorage(projectFile);
          console.log("File uploaded successfully:", fileData);
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          toast.error("Failed to upload file. Continuing without file.");
          // Continue with submission without file
        }
      }

      console.log("Sending data to API...");
      const requestBody = {
        projectTitle: formData.projectTitle,
        academicLevel: formData.academicLevel,
        technologiesUsed: formData.technologiesUsed,
        focusRatio: formData.focusRatio,
        questionCount: parseInt(formData.questionCount),
        userId: user.id,
        projectFile: fileData,
      };

      console.log("Request payload:", JSON.stringify(requestBody));

      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      let responseData;
      try {
        responseData = await response.json();
        console.log("API response received:", responseData);
      } catch (error) {
        // If JSON parsing fails, get the text response
        const errorText = await response.text();
        console.error("Failed to parse response as JSON:", error);
        throw new Error(`Invalid API response: ${errorText}`);
      }

      if (!response.ok) {
        console.error(
          "API response not OK:",
          response.status,
          response.statusText
        );
        throw new Error(
          `API response error: ${response.status} ${response.statusText} - ${
            responseData.error || responseData.message || "Unknown error"
          }`
        );
      }

      if (responseData.success) {
        console.log(
          "Defence session created successfully, ID:",
          responseData.interviewId
        );
        toast.success("Defence session created successfully!");

        // Force a delay to ensure toast is shown
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Make sure we have a valid interview ID
        if (!responseData.interviewId) {
          console.error("Missing interviewId in response");
          throw new Error("Invalid response: missing interview ID");
        }

        // Redirect to the interview page
        const redirectUrl = `/interview/${responseData.interviewId}`;
        console.log("Redirecting to:", redirectUrl);

        // Use try-catch for navigation
        try {
          router.push(redirectUrl);
          console.log("Navigation successful");
        } catch (navError) {
          console.error("Navigation failed:", navError);
          // Fallback direct navigation
          window.location.href = redirectUrl;
        }
      } else {
        console.error("API returned success: false", responseData);
        toast.error(responseData.message || "Failed to create defence session");
      }
    } catch (error) {
      console.error("Error creating defence session:", error);
      let errorMessage = "An error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-12 px-4">
      <div className="mb-8 flex flex-col items-center">
        <Image
          src="/robot.png"
          width={80}
          height={80}
          alt="Academic Defence"
          className="mb-4"
        />
        <h1 className="text-2xl font-semibold text-primary-100 mb-2">
          Project Defence Preparation
        </h1>
        <p className="text-sm text-gray-400">
          Set up a mock defence session for your academic project
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-field">
          <label htmlFor="projectTitle" className="form-label">
            Project Title
          </label>
          <input
            id="projectTitle"
            name="projectTitle"
            type="text"
            placeholder="Enter your project title"
            value={formData.projectTitle}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-field">
            <label htmlFor="academicLevel" className="form-label">
              Academic Level
            </label>
            <select
              id="academicLevel"
              name="academicLevel"
              value={formData.academicLevel}
              onChange={handleChange}
              className="form-input"
              title="Select your academic level"
              aria-label="Academic Level"
            >
              {projectLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="focusRatio" className="form-label">
              Focus Type
            </label>
            <select
              id="focusRatio"
              name="focusRatio"
              value={formData.focusRatio}
              onChange={handleChange}
              className="form-input"
              title="Select your focus ratio"
              aria-label="Focus Type"
            >
              {focusTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="technologiesUsed" className="form-label">
            Technologies Used
          </label>
          <input
            id="technologiesUsed"
            name="technologiesUsed"
            type="text"
            placeholder="e.g., React, Node.js, Machine Learning"
            value={formData.technologiesUsed}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="questionCount" className="form-label">
            Number of Questions
          </label>
          <input
            id="questionCount"
            type="number"
            name="questionCount"
            value={formData.questionCount}
            onChange={handleChange}
            min="3"
            max="10"
            className="form-input"
            title="Choose number of questions"
            placeholder="Number of questions"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Project Documentation (Optional)</label>
          <ProjectFileUpload onFileUpload={handleFileUpload} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3 rounded-lg"
        >
          {isLoading ? "Creating Defence..." : "Create Defence Session"}
        </button>
      </form>
    </div>
  );
};

export default ProjectDefenceForm;
