// src/components/course/CourseView.tsx

"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import crypto from "crypto";
import { AppState } from "@/app/store";

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

interface CourseViewProps {
  course: Course | null;
}

const CourseView = ({ course }: CourseViewProps) => {
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(0);
  const router = useRouter();
  const isAuthorized = AppState((state) => state.isAuthorized);

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthorized, router]);

  useEffect(() => {
    if (course) {
      setLoading(false);
    }
  }, [course]);

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

  const handlePrevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (course && currentChapter < course.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  if (loading) {
    return (
      <div>
        <SpinnerWrapper>
          <div>Loading...</div>
        </SpinnerWrapper>
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <SpinnerWrapper>
          <div>Course not found</div>
        </SpinnerWrapper>
      </div>
    );
  }

  const currentChapterData = course.chapters[currentChapter];

  return (
    <div>
      <SpinnerWrapper>
        <div className="course-details flex flex-col justify-start text-end bg-gradient-to-r from-purple-500 to-indigo-500 py-4 px-4 md:px-8">
          <Link className="text-left flex" href="/mycourse">
            Back to courses
          </Link>
          <div className="mr-auto ml-auto mt-[100px] mb-5 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg rounded-lg max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">{course.course_name}</h1>
            {course.description}
            <p className="text-md mb-4">
              <strong>Category:</strong> {course.course_category}
            </p>
            <div className="flex justify-between">
              <p>Price: &#8377; {course.price}</p>
              <Link href={`/mycourse/editCourse/`}>
                <button className="bg-[#2a31f8] text-white font-bold py-2 px-4 rounded-xl">
                  Edit Course
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-[#D9D9D9] p-8 w-full max-w-5xl rounded-lg mb-7 shadow-md mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Chapter: {currentChapterData.chapterName}
          </h2>
          <div className="flex flex-col items-center">
            {currentChapterData.videos.map((videoUrl, index) => (
              <div key={`${videoUrl}-${index}`} className="mb-6 text-center">
                <h3 className="text-xl mb-2">{`Video ${index + 1}`}</h3>
                <video
                  key={`${videoUrl}-${index}-video`}
                  className="rounded-lg w-full max-w-lg"
                  controls
                >
                  <source src={decryptVideo(videoUrl)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevChapter}
              className={`px-4 py-2 rounded ${
                currentChapter === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
              disabled={currentChapter === 0}
            >
              Prev
            </button>
            <button
              onClick={handleNextChapter}
              className={`px-4 py-2 rounded ${
                currentChapter === course.chapters.length - 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
              disabled={currentChapter === course.chapters.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default CourseView;
