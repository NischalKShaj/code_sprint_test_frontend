"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import Swal from "sweetalert2";
import { AppState } from "@/app/store";
dotenv.config();

interface Banner {
  banner_name: string;
  banner_description: string;
  bannerImage: string;
}

const EditBanner = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const editBanner = params?.editBanner as string | undefined;
  const isAdmin = AppState((state) => state.isAdmin);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    } else {
      setLoading(false);
    }
  }, [isAdmin, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!editBanner) return; // Handle case where editBanner is not defined

      try {
        const response = await axios.get(`/api/banner/${editBanner}`);
        if (response.status === 200) {
          setBanner({
            banner_name: response.data.name,
            banner_description: response.data.description,
            bannerImage: response.data.bannerImage,
          });
          setImagePreview(response.data.bannerImage);
        } else {
          console.error("Banner not found");
        }
      } catch (error) {
        console.error("Error fetching banner data", error);
      }
    };

    fetchData();
  }, [editBanner]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (banner) {
      setBanner({
        ...banner,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImagePreview = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    if (banner) {
      data.append("banner_name", banner.banner_name);
      data.append("banner_description", banner.banner_description);
      if (selectedImage) {
        data.append("bannerImage", selectedImage);
      }
    }

    const token = localStorage.getItem("admin_access_token");
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/banner/${editBanner}`,
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
          title: "Updating success",
          text: "Successfully edited banner",
          confirmButtonText: "OK",
        });
        router.push("/admin/banner");
      } else if (response.status === 500) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Updating failed",
          text: "Error while updating",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error updating banner", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Updating failed",
        text: "Error while updating",
        confirmButtonText: "OK",
      });
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
      <AdminSidePanel />
      <section className="bg-[#D9D9D9] p-6 sm:p-8 h-full w-full max-w-lg mt-6 mx-auto flex items-center justify-center rounded-lg shadow-md">
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
            value={banner?.banner_name}
            onChange={handleChange}
          />
          <textarea
            className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
            name="banner_description"
            required
            id="banner_description"
            placeholder="Enter the description for the banner"
            value={banner?.banner_description}
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
          />
          {imagePreview && (
            <div className="relative mt-4 w-full max-w-xs sm:max-w-sm mx-auto">
              <img
                src={imagePreview}
                alt="Banner Preview"
                className="w-full h-auto rounded-lg shadow-md"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-2"
                onClick={removeImagePreview}
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
    </div>
  );
};

export default EditBanner;
