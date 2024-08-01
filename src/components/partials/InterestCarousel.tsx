// file for showing the interested videos
"use effect";

// importing the required modules
import React, { useEffect, useState } from "react";
import dotenv from "dotenv";
import axios from "axios";
import { AppState } from "@/app/store";
import crypto from "crypto";
dotenv.config();

interface Chapter {
  chapterName: string;
  videos: string[];
}

interface Course {
  course_name: string;
  course_category: string;
  chapters: Chapter[];
  _id: string;
}

const InterestCarousel = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const user = AppState((state) => state.user);
  const id = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      let url;
      if (token) {
        url = `${process.env.NEXT_PUBLIC_BASE_URL}/interested-course?id=${id}`;
      } else {
        url = `${process.env.NEXT_PUBLIC_BASE_URL}/suggested`;
      }
      try {
        const response = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });
        if (response.status === 202) {
          const decryptedCourses = response.data.map((course: any) => ({
            ...course,
            chapters: course.chapters.map((chapter: any) => ({
              chapterName: chapter.chapterName,
              videos: chapter.videos.map((video: any) => decryptVideo(video)),
            })),
          }));
          setCourses(decryptedCourses);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchData();
  }, [id]);

  // function to decrypt the videos
  const decryptVideo = (encryptedUrl: string): string => {
    try {
      const parts = encryptedUrl.split(":");
      if (parts.length !== 3) {
        throw new Error(`Invalid encrypted URL format: ${encryptedUrl}`);
      }

      const iv = Buffer.from(parts[0], "hex");
      const tag = Buffer.from(parts[1], "hex");
      const ciphertext = Buffer.from(parts[2], "hex");
      const key = Buffer.from(process.env.NEXT_PUBLIC_CIPHER_SECRETKEY!, "hex");

      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(ciphertext, undefined, "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error: any) {
      console.error("Decryption error:", error.message);
      throw error;
    }
  };

  const nextSlide = () => {
    setCurrentSlideIndex(
      (prevIndex) => (prevIndex + 1) % Math.ceil(courses.length / 3)
    );
  };

  const prevSlide = () => {
    setCurrentSlideIndex(
      (prevIndex) =>
        (prevIndex - 1 + Math.ceil(courses.length / 3)) %
        Math.ceil(courses.length / 3)
    );
  };

  return (
    <div className="relative w-full">
      <h1 className="text-center text-3xl mt-[90px] font-bold mb-6 text-gray-800">
        Suggested Courses for You
      </h1>
      <hr className="w-20 h-1 mx-auto my-4 bg-black border-0 mt-2 rounded md:my-6 dark:bg-gray-700" />

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 "
          style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
        >
          {courses.map((course, index) => (
            <div
              key={course._id}
              className="flex-shrink-0 w-1/3 p-4"
              style={{ flexBasis: "33.3333%" }}
            >
              <div className="flex flex-col items-center text-center bg-[#E0F7FA] rounded-lg shadow-lg p-4">
                {course.chapters.length > 0 &&
                  course.chapters[0].videos.length > 0 && (
                    <video
                      className="w-full h-auto max-h-80 rounded-lg shadow-lg"
                      src={course.chapters[0].videos[0]}
                      controls={false}
                    />
                  )}
                <h3 className="text-lg font-semibold mt-4 text-gray-700">
                  {course.course_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {course.course_category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 flex justify-center space-x-4">
        {[...Array(Math.ceil(courses.length / 3))].map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSlideIndex ? "bg-blue-600" : "bg-gray-300"
            }`}
            onClick={() => setCurrentSlideIndex(index)}
          />
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 text-gray-800"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 text-gray-800"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default InterestCarousel;
