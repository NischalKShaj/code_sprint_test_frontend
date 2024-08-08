"use client";

import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import { AppState } from "../../store";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import TutorSideBar from "@/components/partials/TutorSideBar";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";

dotenv.config();

interface Category {
  category_name: string;
}

interface Chapter {
  chapter_name: string;
  files: File[];
}

const AddCourse = () => {
  const email = AppState((state) => state.user?.email);
  const router = useRouter();
  const isAuthorized = AppState((state) => state.isAuthorized);
  const [loading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthorized, router]);

  const [form, setForm] = useState({
    course_name: "",
    course_category: "",
    description: "",
    amount: "",
  });

  const [chapters, setChapters] = useState<Chapter[]>([
    { chapter_name: "", files: [] },
  ]);

  const [category, setCategory] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/category`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          setCategory(response.data);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!email) {
        alert("User email is not available. Please log in.");
        return;
      }

      const formData = new FormData();
      formData.append("course_name", form.course_name);
      formData.append("course_category", form.course_category);
      formData.append("description", form.description);
      formData.append("amount", form.amount);

      chapters.forEach((chapter, index) => {
        formData.append(
          `chapters[${index}][chapter_name]`,
          chapter.chapter_name
        );
        chapter.files.forEach((file, fileIndex) => {
          formData.append(`chapters[${index}][files]`, file);
        });
      });

      const token = localStorage.getItem("access_token");

      Swal.fire({
        icon: "success",
        title: "Playlist Uploading in Progress",
        text: "Your playlist will be uploaded within a few minutes. Please check back later.",
        confirmButtonText: "OK",
      });
      router.push("/mycourse");

      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/uploads?userEmail=${encodeURIComponent(email)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status !== 202) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error uploading files", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "There was an error processing your request. Please try again.",
        confirmButtonText: "Try Again",
      });
      router.push("/error");
    }
  };

  const handleChapterChange = (index: number, field: string, value: string) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setChapters(newChapters);
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    const newChapters = [...chapters];
    if (files) {
      newChapters[index].files = Array.from(files);
    } else {
      newChapters[index].files = [];
    }
    setChapters(newChapters);
  };

  const addChapter = () => {
    setChapters([...chapters, { chapter_name: "", files: [] }]);
  };

  const removeChapter = (index: number) => {
    const newChapters = chapters.filter((_, i) => i !== index);
    setChapters(newChapters);
  };

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
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
        <div className="flex flex-col items-center mb-24 bg-white mt-8 px-4 sm:px-6 lg:px-8">
          <TutorSideBar />
          <h3 className="text-2xl font-bold mb-6 text-center items-center">
            Add New Course
          </h3>
          <section className="bg-[#D9D9D9] p-8 h-auto w-full max-w-xl rounded-lg shadow-md">
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="flex flex-col items-center justify-center text-left"
            >
              <input
                className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                type="text"
                name="course_name"
                required
                id="course_name"
                value={form.course_name}
                onChange={handleChange}
                placeholder="Course Name"
              />
              <select
                className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                required
                id="course_category"
                value={form.course_category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {category.map((category, index) => (
                  <option key={index} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <textarea
                className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                name="description"
                id="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Course Description"
              ></textarea>
              <input
                className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                type="number"
                name="amount"
                required
                id="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Amount"
              />
              {chapters.map((chapter, index) => (
                <div key={index} className="chapter-section mt-4 w-full">
                  <input
                    className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                    type="text"
                    placeholder={`Chapter ${index + 1} Name`}
                    value={chapter.chapter_name}
                    onChange={(e) =>
                      handleChapterChange(index, "chapter_name", e.target.value)
                    }
                  />
                  <label
                    htmlFor="videos"
                    className="text-gray-500 mr-[50px] block mt-3"
                  >
                    Select MP4 or WebM format
                  </label>
                  <input
                    className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                    type="file"
                    multiple
                    accept="video/webm, video/mp4"
                    name={`chapters[${index}][files]`}
                    onChange={(e) => handleFileChange(index, e.target.files)}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      className="mt-3 p-2 bg-red-500 text-white rounded w-full"
                      onClick={() => removeChapter(index)}
                    >
                      Remove Chapter
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="mt-3 p-2 bg-[#686DE0] text-white rounded w-full"
                onClick={addChapter}
              >
                Add Chapter
              </button>
              <button
                type="submit"
                className="mt-6 p-4 bg-[#686DE0] text-white rounded-lg w-full"
              >
                Submit
              </button>
            </form>
          </section>
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default AddCourse;
