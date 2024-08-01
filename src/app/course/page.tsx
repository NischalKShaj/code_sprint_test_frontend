"use client";

// Import all the required modules
import axios from "axios";
import { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
import { CourseState } from "../store/courseStore";
import { AppState } from "../store";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import FilterCourse from "@/components/partials/FilterCourse";
import crypto from "crypto";
dotenv.config();

interface VideoDetails {
  url: string;
  key: string;
  originalname: string;
}

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

const Course = () => {
  const showCourse = CourseState((state) => state.showCourse);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(5);
  const user = AppState((state) => state.user);
  const role = user?.role === "student" ? "student" : "";
  const findAllCourse = CourseState((state) => state.findAllCourse);
  const allCourse = CourseState((state) => state.allCourse);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();
  const isSubscribed = CourseState((state) => state.isSubscribed);
  const isAuthorized = AppState((state) => state.isAuthorized);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthorized, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        console.log("access_token", token);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          console.log("response", response.data);
          const decryptedCourses = response.data.map((course: Course) => ({
            ...course,
            chapters: course.chapters.map((chapter) => ({
              ...chapter,
              videos: chapter.videos.map((video) => decryptVideo(video)),
            })),
          }));
          findAllCourse(decryptedCourses);
        } else if (response.status === 500) {
          router.push("/error");
        } else {
          router.push("/");
        }
      } catch (error: any) {
        console.error("error fetching the course page", error);
        if (error.response && error.response.status === 401) {
          router.push("/login");
        } else {
          router.push("/error");
        }
      }
    };
    fetchData();
  }, [router]);

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

  // Function to get the videos type
  const getMimeType = (url: string): string => {
    const extension = url.split(".").pop();
    switch (extension) {
      case "webm":
        return "video/webm";
      default:
        return "video/mp4";
    }
  };

  // Function for showing the main course page and the payment details etc..
  const handleSubscribe = async (id: string) => {
    console.log("inside");
    try {
      const token = localStorage.getItem("access_token");
      console.log("token", token);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${id}`,
        { id: user?.id },
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
          ...response.data.courses,
          chapters: response.data.courses.chapters.map((chapter: Chapter) => ({
            ...chapter,
            videos: chapter.videos.map((video: string) => decryptVideo(video)),
          })),
        };
        showCourse({
          _id: decryptedCourse._id,
          course_name: decryptedCourse.course_name,
          description: decryptedCourse.description,
          course_category: decryptedCourse.course_category,
          chapters: decryptedCourse.chapters,
          price: decryptedCourse.price,
          tutor: decryptedCourse.tutor,
        });
        router.push(`/course/${id}`);
      } else if (response.status === 500) {
        router.push("/error");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("error");
      if (error.response && error.response.status === 401) {
        router.push("/login");
      } else {
        router.push("/error");
      }
    }
  };

  // Get current courses
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = allCourse.slice(indexOfFirstCourse, indexOfLastCourse);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
        <FilterCourse />
        <div className="flex flex-col items-center mb-36 bg-white mt-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            Explore, Learn, Achieve, Master
          </h1>
          <section className="bg-[#D9D9D9] p-4 sm:p-6 md:p-8 w-full max-w-screen-lg rounded-lg shadow-md">
            {currentCourses.map((course) => {
              const isCourseSubscribed = isSubscribed.some(
                (sub) => sub.course_id === course._id
              );
              const firstVideoUrl = course.chapters?.[0]?.videos?.[0] ?? "";
              return (
                <div
                  key={course._id}
                  className="flex flex-col md:flex-row items-start border border-black p-4 mb-4 rounded-lg relative"
                >
                  {firstVideoUrl && (
                    <video
                      className="rounded-lg w-full md:w-72 mb-4 md:mb-0 md:mr-4"
                      controls={false}
                    >
                      <source
                        src={firstVideoUrl}
                        type={getMimeType(firstVideoUrl)}
                      />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <div className="flex-grow">
                    <h2 className="text-lg sm:text-xl font-bold mb-2">
                      {course.course_name}
                    </h2>
                    <p className="text-sm mb-1">
                      Course Category: {course.course_category}
                    </p>
                    <p className="text-sm">{course.description}</p>
                  </div>
                  {role && (
                    <div className="mt-4 md:mt-0 md:ml-4">
                      {isCourseSubscribed || user?.premium ? (
                        <button
                          onClick={() => handleSubscribe(course._id)}
                          className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl"
                        >
                          Show
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(course._id)}
                          className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl"
                        >
                          Subscribe
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
          <nav className="mt-4" aria-label="Pagination">
            <ul className="flex flex-wrap justify-center">
              {Array.from({
                length: Math.ceil(courses.length / coursesPerPage),
              }).map((_, index) => (
                <li key={index}>
                  <button
                    className="px-4 py-2 mx-1 bg-gray-200 rounded-md"
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default Course;
