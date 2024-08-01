"use client";

// Importing the required modules
import Link from "next/link";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { AppState } from "../store";
import axios from "axios";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import TutorSideBar from "@/components/partials/TutorSideBar";
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

interface FlattenedVideo {
  courseTitle: string;
  videoUrl: string;
  description: string;
  courseId: string;
}

const MyCourse: React.FC = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [flattenedVideos, setFlattenedVideos] = useState<FlattenedVideo[]>([]);
  const tutorId = AppState((state) => state.user?.id);
  const isAuthorized = AppState((state) => state.isAuthorized);
  const [loading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthorized, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/mycourse/${tutorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          console.log("response", response.data);
          const decryptedCourse = response.data.map((course: Course) => ({
            ...course,
            chapters: course.chapters.map((chapter) => ({
              ...chapter,
              videos: chapter.videos.map((video) => decryptVideo(video)),
            })),
          }));
          setCourses(decryptedCourse);

          const flattened = decryptedCourse.flatMap((course: any) => {
            const firstChapter = course.chapters[0];
            const firstVideo = firstChapter.videos[0]; // Only get the first video
            return {
              courseTitle: course.title,
              videoUrl: firstVideo,
              description: course.description,
              courseId: course.courseId,
            };
          });
          console.log("flattened", flattened);

          setFlattenedVideos(flattened);
        } else {
          router.push("/login");
        }
      } catch (error) {
        if (!tutorId) {
          router.push("/login");
        } else {
          console.error("Error fetching courses:", error);
          router.push("/error");
        }
      }
    };

    fetchData();
  }, [router, tutorId]);

  const decryptVideo = (encryptedUrl: string): string => {
    try {
      const parts = encryptedUrl.split(":");
      console.log("parts", parts.length);
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

  const getMimeType = (url: string): string => {
    const extension = url.split(".").pop();
    switch (extension) {
      case "mp4":
        return "video/mp4";
      case "webm":
        return "video/webm";
      default:
        return "video/mp4";
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
    <div className="flex flex-col items-center mb-36 bg-white mt-16">
      <SpinnerWrapper>
        <TutorSideBar />
        <section className="bg-[#D9D9D9] p-8 w-full max-w-6xl rounded-lg shadow-md">
          {flattenedVideos.map((video, index) => (
            <div key={index} className="my-5">
              <h3 className="text-2xl text-center font-bold mb-6">
                {video.courseTitle}
              </h3>
              <div className="mb-6">
                <p className="text-md text-left mb-4">{video.description}</p>
                <div className="flex justify-center">
                  <video className="rounded-lg w-full max-w-xl" controls>
                    <source
                      src={video.videoUrl}
                      type={getMimeType(video.videoUrl)}
                      onError={(e) =>
                        console.error(
                          `Error loading video at ${video.videoUrl}:`,
                          e
                        )
                      }
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="flex justify-end mt-4">
                  <Link href={`/mycourse/${video.courseId}`}>
                    <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl">
                      Show
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>
      </SpinnerWrapper>
    </div>
  );
};

export default MyCourse;
