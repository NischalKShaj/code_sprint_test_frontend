"use client";

// Importing required modules
import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useLayoutEffect,
} from "react";
import TutorSideBar from "@/components/partials/TutorSideBar";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { AppState } from "@/app/store";
import dotenv from "dotenv";
import { CourseState } from "@/app/store/courseStore";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";

dotenv.config();

// Define Chapter interface
interface Chapter {
  chapterName: string;
  videos: (File | string)[]; // Updated to accept File objects or string URLs/filenames
}

// Define Course interface
interface Course {
  _id: string;
  course_name: string;
  description: string;
  course_category: string;
  price: number;
  chapters: Chapter[];
}

const EditCoursePage = () => {
  const isAuthorized = AppState((state) => state.isAuthorized);
  const myCourse = CourseState((state) => state.myCourse);
  const router = useRouter();
  const user = AppState((state) => state.user);
  const id = user?.id;
  const [loading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthorized, router]);

  // Initialize form state using myCourse data or defaults
  const [formData, setFormData] = useState<Course>({
    _id: myCourse?._id || "",
    course_name: myCourse?.course_name || "",
    course_category: myCourse?.course_category || "",
    description: myCourse?.description || "",
    price: myCourse?.price || 0,
    chapters: myCourse?.chapters || [],
  });

  // State to manage new video previews for each chapter
  const [newVideoFiles, setNewVideoFiles] = useState<Record<number, File[]>>(
    {}
  );

  // State to manage video file names for preview
  const [newVideoFileNames, setNewVideoFileNames] = useState<
    Record<number, string[]>
  >({});

  // Effect to load initial video previews when chapters change
  useEffect(() => {
    if (formData.chapters.length > 0) {
      const initialFileNames: Record<number, string[]> = {};
      formData.chapters.forEach((chapter, index) => {
        initialFileNames[index] = chapter.videos.map(
          (video) =>
            typeof video === "string" ? video : URL.createObjectURL(video) // Create object URL for File objects
        );
      });
      setNewVideoFileNames(initialFileNames);
    }
  }, [formData.chapters]);

  // Handle change in chapter name input
  const handleChapterChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter, idx) =>
        idx === index ? { ...chapter, chapterName: value } : chapter
      ),
    }));
  };

  // Handle adding a new chapter
  const handleAddChapter = () => {
    setFormData((prev) => ({
      ...prev,
      chapters: [...prev.chapters, { chapterName: "", videos: [] }],
    }));
  };

  // Handle removing a chapter
  const handleRemoveChapter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index),
    }));
    setNewVideoFiles((prev) => {
      const updatedFiles = { ...prev };
      delete updatedFiles[index];
      return updatedFiles;
    });
    setNewVideoFileNames((prev) => {
      const updatedFileNames = { ...prev };
      delete updatedFileNames[index];
      return updatedFileNames;
    });
  };

  // Handle video file selection and preview update
  const handleVideoChange = (
    chapterIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewVideoFiles((prev) => ({
        ...prev,
        [chapterIndex]: files,
      }));
      setNewVideoFileNames((prev) => ({
        ...prev,
        [chapterIndex]: files.map((file) => file.name),
      }));
      setFormData((prev) => ({
        ...prev,
        chapters: prev.chapters.map((chapter, idx) =>
          idx === chapterIndex ? { ...chapter, videos: files } : chapter
        ),
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate chapters
    const chaptersToSend = formData.chapters.map((chapter, index) => {
      // Check if chapter name is provided
      if (!chapter.chapterName.trim()) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: `Chapter ${index + 1} is missing a name`,
          showConfirmButton: false,
          timer: 2000,
        });
        throw new Error(`Chapter ${index + 1} is missing a name`);
      }

      // Return organized chapter data
      return {
        chapterName: chapter.chapterName,
        videos: chapter.videos, // Updated to handle both File objects and string URLs/filenames
      };
    });

    // If there are no chapters to send, stop further processing
    if (chaptersToSend.length === 0) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "No chapters found",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    // Prepare formDataToSend only if there are videos to send
    const formDataToSend = new FormData();
    formDataToSend.append("courseId", formData._id);
    formDataToSend.append("course_name", formData.course_name);
    formDataToSend.append("course_category", formData.course_category);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price.toString());

    let hasVideos = false; // Flag to check if any videos are present

    chaptersToSend.forEach((chapter, index) => {
      chapter.videos.forEach((video, videoIndex) => {
        // Check if video is a File object or just a string (filename or URL)
        if (typeof video === "string") {
          formDataToSend.append(`chapters[${index}][files],`, video);
          hasVideos = true; // Set flag to true if any video is appended
        } else {
          formDataToSend.append(`chapters[${index}][files]`, video, video.name);
          hasVideos = true; // Set flag to true if any video is appended
        }
      });
      formDataToSend.append(
        `chapters[${index}][chapterName]`,
        chapter.chapterName
      );
    });

    // Check if there are no videos to send
    if (!hasVideos) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "No videos found to upload",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    console.log("formdata", formDataToSend);

    const token = localStorage.getItem("access_token");
    try {
      Swal.fire({
        position: "center",
        icon: "success",
        title:
          "Course update in progress. Wait for a while or login after sometime!",
        showConfirmButton: false,
        timer: 2500,
      });

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/course/edit/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 202) {
        console.log("Course updated successfully:", response.data);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Course updated successfully!",
          showConfirmButton: false,
          timer: 2500,
        });
        router.push(`/mycourse/${myCourse?._id}`);
      }
    } catch (error) {
      console.error("Error updating course:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Error while updating course",
        showConfirmButton: false,
        timer: 1700,
      });
    }
  };
  // Handle course deletion
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      position: "center",
      icon: "warning",
      title: "Are you sure you want to delete this course?",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      denyButtonText: "Cancel",
      customClass: {
        confirmButton: "btn-confirm",
        denyButton: "btn-deny",
      },
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_BASE_URL}/course/delete/${id}?userId=${user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.status === 204) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Course Deleted Successfully",
            text: "You have successfully deleted the course",
          });
          router.push("/mycourse");
        }
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  // Handle input changes for course details (name, category, description, price)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (loading) {
    return (
      <SpinnerWrapper>
        <div>Loading...</div>
      </SpinnerWrapper>
    );
  }

  // Render the EditCoursePage component
  return (
    <div>
      <SpinnerWrapper>
        <div className="flex flex-col lg:flex-row min-h-screen pt-4 pb-16 bg-gray-100">
          <TutorSideBar />
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-lg rounded-lg p-8 space-y-8 divide-y divide-gray-200"
            >
              <div className="space-y-8 divide-y divide-gray-200">
                <div className="pt-8">
                  <div>
                    <h2 className="text-lg leading-6 font-medium text-gray-900">
                      Course Information
                    </h2>
                  </div>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-1">
                      <label
                        htmlFor="course_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Course Name
                      </label>
                      <input
                        type="text"
                        name="course_name"
                        id="course_name"
                        className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                        placeholder="Enter course name"
                        value={formData.course_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <label
                        htmlFor="course_category"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Category
                      </label>
                      <input
                        type="text"
                        name="course_category"
                        id="course_category"
                        className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                        placeholder="Enter course category"
                        value={formData.course_category}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                        placeholder="Enter course description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Chapters section */}
                <div className="pt-8">
                  <div>
                    <h2 className="text-lg leading-6 font-medium text-gray-900">
                      Chapters
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Edit or delete chapters for the course.
                    </p>
                  </div>

                  {formData.chapters.map((chapter, index) => (
                    <div key={index} className="mt-6">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                        <div className="w-full">
                          <label
                            htmlFor={`chapter_name_${index}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Chapter {index + 1}
                          </label>
                          <input
                            type="text"
                            name={`chapter_name_${index}`}
                            id={`chapter_name_${index}`}
                            className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                            placeholder={`Enter chapter ${index + 1} name`}
                            value={chapter.chapterName}
                            onChange={(e) => handleChapterChange(index, e)}
                          />
                        </div>
                        <div className="mt-4 lg:mt-0 lg:ml-4">
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={() => handleRemoveChapter(index)}
                          >
                            Remove Chapter
                          </button>
                        </div>
                      </div>

                      {/* Videos section for each chapter */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Videos
                        </label>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                          {newVideoFileNames[index]?.map((url, fileIndex) => (
                            <div
                              key={fileIndex}
                              className="col-span-1 flex items-center"
                            >
                              <video
                                controls
                                className="w-full h-auto rounded-lg shadow-md"
                              >
                                <source src={url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          ))}
                          <div className="col-span-1">
                            <label
                              htmlFor={`video_${index}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Upload Video
                            </label>
                            <div className="mt-1 flex items-center">
                              <input
                                type="file"
                                id={`video_${index}`}
                                name={`chapters[${index}][files]`}
                                className="hidden"
                                accept="video/*"
                                onChange={(e) => handleVideoChange(index, e)}
                                multiple
                              />
                              <label
                                htmlFor={`video_${index}`}
                                className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-blue-300 focus:ring-blue-500"
                              >
                                Select Video
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add chapter button */}
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={handleAddChapter}
                    >
                      Add Chapter
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit and delete buttons */}
              <div className="pt-5">
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring-blue-500 active:bg-blue-700 transition duration-150 ease-in-out"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(formData._id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:border-red-700 focus:ring-red-500 active:bg-red-700 transition duration-150 ease-in-out"
                  >
                    Delete Course
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default EditCoursePage;
