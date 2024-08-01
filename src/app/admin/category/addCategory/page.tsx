// file to add the category
"use client";
// importing required modules
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import { isValid } from "@/utils/validation";
import React, { ChangeEventHandler, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { AppState } from "@/app/store";
dotenv.config();

type Errors = { [key: string]: string };
interface FormData {
  category_name: string;
}

const AddCategory = () => {
  const [formData, setFormData] = useState<FormData>({
    category_name: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isAdmin = AppState((state) => state.isAdmin);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    } else {
      setLoading(false);
    }
  }, [isAdmin, router]);

  // Function to handle change
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const target = e.currentTarget;
    const { id, value } = target;

    let error = "";
    if (id === "category_name" && !isValid(value)) {
      error = "Enter a valid category";
    }

    setErrors((prev) => ({ ...prev, [id]: error }));
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Function to handle the submit functionality
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Revalidate before submission
    const newErrors: Errors = {};
    if (!isValid(formData.category_name)) {
      newErrors.category_name = "Enter a valid category";
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      setMessage("Fix errors before submitting");
      return;
    }

    try {
      const token = localStorage.getItem("admin_access_token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/addCategory`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "category added",
          text: "category added successfully!",
          confirmButtonText: "OK",
        });
        setFormData({ category_name: "" });
        router.push("/admin/category");
      }
    } catch (error) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "error while uploading",
        text: "Make sure to give a valid category",
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
      <SpinnerWrapper>
        <AdminSidePanel />
        <section className="bg-[#D9D9D9] p-8 mt-[30px] flex items-center justify-center rounded-lg shadow-md mx-auto max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center text-left w-full"
          >
            <input
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
              type="text"
              name="category_name"
              required
              id="category_name"
              placeholder="Enter the category name"
              onChange={handleChange}
            />
            {errors.category_name && (
              <span className="text-red-500">{errors.category_name}</span>
            )}
            <button
              className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl w-full mt-7"
              type="submit"
            >
              Submit
            </button>
            {message && (
              <p className="mt-3 text-red-500 text-center">{message}</p>
            )}
          </form>
        </section>
      </SpinnerWrapper>
    </div>
  );
};

export default AddCategory;
