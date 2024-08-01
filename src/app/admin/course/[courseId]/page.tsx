"use client";

import { CourseState } from "@/app/store/courseStore";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import dotenv from "dotenv";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import { loadScript } from "@/utils/razorpay";
import { AppState } from "@/app/store";
import Swal from "sweetalert2";
import crypto from "crypto";
dotenv.config();

interface Course {
  _id: string;
  course_name: string;
  description: string;
  course_category: string;
  price: number;
  tutor: string;
  chapters: Chapter[];
}

interface Chapter {
  chapterName: string;
  videos: string[];
}

const CourseId = () => {
  const userData = AppState((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 2;
  const { courseId } = useParams() as { courseId: string };
  const course = CourseState((state) => state.course);
  const showCourse = CourseState((state) => state.showCourse);
  const toggleVideoCompletion = CourseState(
    (state) => state.toggleVideoCompletion
  );
  const id = courseId;
  const router = useRouter();

  const [decryptedVideos, setDecryptedVideos] = useState<string[]>([]);

  const isAdmin = AppState((state) => state.isAdmin);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, router]);

  // function to decrypt the videos url
  const decryptVideo = (encryptedUrl: string): string => {
    try {
      console.log("Decrypting video:", encryptedUrl);

      const parts = encryptedUrl.split(":");
      console.log("parts", parts.length);
      if (parts.length !== 3) {
        throw new Error(`Invalid encrypted URL format: ${encryptedUrl}`);
      }

      const iv = Buffer.from(parts[0], "hex");
      const tag = Buffer.from(parts[1], "hex");
      const ciphertext = Buffer.from(parts[2], "hex");
      const key = Buffer.from(process.env.NEXT_PUBLIC_CIPHER_SECRETKEY!, "hex");

      console.log("IV:", iv);
      console.log("Tag:", tag);
      console.log("Ciphertext:", ciphertext);
      console.log("env", process.env.NEXT_PUBLIC_CIPHER_SECRETKEY);

      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(ciphertext, undefined, "utf8");
      decrypted += decipher.final("utf8");

      console.log("Decrypted video URL:", decrypted);

      return decrypted;
    } catch (error: any) {
      console.error("Decryption error:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    setIsLoading(false);
    const fetchData = async (id: string) => {
      try {
        const token = localStorage.getItem("admin_access_token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/courses/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        console.log("response", response.data);
        if (response.status === 202) {
          const decryptedCourse = {
            ...response.data,
            chapters: response.data.chapters.map((chapter: Chapter) => ({
              ...chapter,
              videos: chapter.videos.map((video: string) =>
                decryptVideo(video)
              ),
            })),
          };
          showCourse(decryptedCourse);
          setDecryptedVideos(
            decryptedCourse.chapters.flatMap(
              (chapter: Chapter) => chapter.videos
            )
          );
        } else if (response.status === 500) {
          router.push("/admin/error");
        } else {
          router.push("/admin");
        }
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          router.push("/admin");
        } else {
          router.push("/admin/error");
        }
      }
    };
    if (courseId) {
      fetchData(courseId);
    }
  }, [courseId, router, showCourse, userData?.id, userData?.username]);

  const handleCheckboxChange = (videoUrl: string) => {
    toggleVideoCompletion(courseId, videoUrl);
  };

  const { completedVideos } = CourseState();
  const courseCompletion =
    completedVideos && completedVideos[courseId]
      ? completedVideos[courseId]
      : {};

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const currentChapter = course?.chapters[currentPage - 1];
  const currentVideos = currentChapter?.videos || [];

  const renderPagination = () => {
    if (!course?.chapters.length) return null;

    const pageNumbers = [];
    for (let i = 1; i <= course.chapters.length; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center mt-4">
        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`mx-1 px-3 py-1 rounded-lg ${
              currentPage === number
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div>
        <SpinnerWrapper>Loading</SpinnerWrapper>
      </div>
    );
  }

  return (
    <div>
      <SpinnerWrapper>
        {course && (
          <>
            <div className="course-details flex flex-col justify-start text-end bg-gradient-to-r from-purple-500 to-indigo-500 py-4 px-4 sm:px-8">
              <Link className="text-left flex mb-4" href="/admin/course">
                Back to courses
              </Link>
              <div className="mx-auto text-start max-w-screen-lg mt-5 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg rounded-lg">
                <h2 className="font-bold">{course.course_name}</h2>
                {course.description}
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:ml-[50px] lg:ml-[300px]">
              <section className="bg-[#D9D9D9] p-4 sm:p-8 mx-4 md:mx-8 mt-5 mb-5 w-full md:w-[650px] rounded-lg shadow-lg">
                <div className="flex flex-col mt-4 gap-4">
                  <h2 className="text-xl sm:text-2xl font-medium text-center">
                    {currentChapter?.chapterName}
                  </h2>
                  {currentVideos?.map((videoUrl, index) => (
                    <div
                      className="flex flex-col sm:flex-row items-start"
                      key={index}
                    >
                      <video
                        src={videoUrl}
                        className="rounded-lg mb-4 sm:mb-0 sm:mr-4"
                        width="300"
                        height="200"
                        controls
                      />
                    </div>
                  ))}
                  {renderPagination()}
                </div>
              </section>
            </div>
          </>
        )}
      </SpinnerWrapper>
    </div>
  );
};

export default CourseId;
