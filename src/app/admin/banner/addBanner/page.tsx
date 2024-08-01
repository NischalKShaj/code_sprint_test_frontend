// file for adding the banner
"use client";

// importing the required modules
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import axios from "axios";
import React, { useState, ChangeEvent, useLayoutEffect } from "react";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AppState } from "@/app/store";
dotenv.config();

const AddBanner: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<{
    [key: string]: string | File | null;
  }>({
    banner_name: "",
    banner_description: "",
    banner: null,
  });
  const router = useRouter();
  const isAdmin = AppState((state) => state.isAdmin);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    } else {
      setLoading(false);
    }
  }, [isAdmin, router]);

  // image change
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prevData) => ({
        ...prevData,
        banner: file,
      }));
    }
  };

  // removal of image
  const handleRemove = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setFormData((prevData) => ({
      ...prevData,
      banner: null,
    }));
  };

  // changing the formData
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // submitting the formData
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (value !== null) {
        data.append(key, value);
      }
    }
    const token = localStorage.getItem("admin_access_token");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/add_banner`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "upload success",
          text: "Banner added successfully",
          confirmButtonText: "OK",
        });
        router.push("/admin/banner");
      } else if (response.status === 500) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "upload failed",
          text: "error while adding the banner",
          confirmButtonText: "OK",
        });
        router.push("/admin/error");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "upload failed",
        text: "error while adding the banner",
        confirmButtonText: "OK",
      });
      router.push("/admin/error");
    }
  };

  if (loading) {
    return (
      <SpinnerWrapper>
        <div>Loading...</div>
      </SpinnerWrapper>
    );
  }

  return (
    <div>
      <SpinnerWrapper>
        <AdminSidePanel />
        <section className="bg-[#D9D9D9] p-6 sm:p-8 h-full max-w-screen-sm mt-6 sm:mt-8 mx-auto flex items-center justify-center rounded-lg shadow-md">
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="flex flex-col items-center justify-center text-left w-full"
          >
            <input
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
              type="text"
              name="banner_name"
              required
              id="banner_name"
              placeholder="Enter the banner name"
              onChange={handleChange}
            />
            <textarea
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
              name="banner_description"
              required
              id="banner_description"
              placeholder="Enter the description for the banner"
              onChange={handleChange}
            />

            <label htmlFor="banner_image" className="text-gray-500 mt-3">
              Select a valid image format
            </label>
            <input
              onChange={handleImageChange}
              type="file"
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
              id="banner"
              name="banner"
              accept="image/*"
              required
            />
            {imagePreview && (
              <div className="relative mt-4 w-full max-w-xs sm:max-w-sm">
                <img
                  src={imagePreview}
                  alt="Banner Preview"
                  className="w-full rounded-lg shadow-md"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  onClick={handleRemove}
                >
                  &times;
                </button>
              </div>
            )}
            <button
              className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl w-full mt-7"
              type="submit"
            >
              Submit
            </button>
          </form>
        </section>
      </SpinnerWrapper>
    </div>
  );
};

export default AddBanner;
