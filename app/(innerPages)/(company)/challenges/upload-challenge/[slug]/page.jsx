"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";

export default function UploadPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);

  const router = useRouter();
  const params = useParams();
  const { slug } = params;

  // Fetch challenge details
  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchChallengesOne({
        slug,
      });
      setChallenge(response.data.challenge);
    } catch (error) {
      toast.error("Failed to load challenge details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));

      // Convert image to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!base64Image) {
      toast.error("Please select an image before uploading.");
      return;
    }
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
      console.log(token)
    const formData = {
      challenge_id: challenge?.id,
      token: token,
      image: base64Image, // assuming `image` is in base64 format after `handleFileChange`
    };
    try {
      toast.loading("Uploading image...");

      const response = await fetch("/api/challengeUpload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("Image uploaded successfully!");
        setImage(null);
        setPreview(null);
        setBase64Image(null);
        router.push("/my-companies");
      } else {
        throw new Error("Failed to upload image.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Image upload failed. Please try again.");
    }
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#2a2b27]">
      <motion.div
        className="bg-white shadow-xl rounded-lg p-6 w-full max-w-md text-center space-y-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <h1 className="text-2xl font-bold text-[#845EC2]">Upload Image</h1>
        <p className="text-gray-500">{challenge?.title}</p>

        {/* Image Preview */}
        {preview ? (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md shadow-md"
            />
          </motion.div>
        ) : (
          <motion.div
            className="w-full h-48 bg-[#845EC2]/20 rounded-md flex items-center justify-center text-white border-dashed border-2 border-[#845EC2]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-medium">No image selected</p>
          </motion.div>
        )}

        <div className="flex flex-col gap-4">
          {/* Upload Button */}
          <motion.label
            htmlFor="fileInput"
            className="inline-block cursor-pointer px-4 py-2 bg-[#845EC2] hover:bg-[#7a4ab4] text-white font-medium rounded-lg shadow-md transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Choose File
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </motion.label>

          {/* Submit Button */}
          {image && (
            <motion.button
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#845EC2] hover:bg-[#7a4ab4] text-white font-medium rounded-lg shadow-md transition-transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upload
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
