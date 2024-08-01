"use client";

// Import all the required modules
import axios from "axios";
import { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import FilterCourse from "@/components/partials/FilterCourse";
import crypto from "crypto";
import { CourseState } from "@/app/store/courseStore";
import { AppState } from "@/app/store";
import AdminSidePanel from "@/components/partials/AdminSidePanel";
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
      try {
        const token = localStorage.getItem("admin_access_token");
        console.log("access_token", token);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/all-courses`,
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
          router.push("/admin/error");
        } else {
          router.push("/admin");
        }
      } catch (error: any) {
        console.error("error fetching the course page", error);
        if (error.response && error.response.status === 401) {
          router.push("/admin");
        } else {
          router.push("/admin/error");
        }
      }
    };
    fetchData();
  }, [findAllCourse, router]);

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
  const handleShow = async (id: string) => {
    console.log("inside");
    try {
      const token = localStorage.getItem("admin_access_token");
      console.log("token", token);
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
        router.push(`/admin/course/${id}`);
      } else if (response.status === 500) {
        router.push("/admin/error");
      } else {
        router.push("/admin");
      }
    } catch (error: any) {
      console.error("error", error);
      if (error.response && error.response.status === 401) {
        router.push("/admin");
      } else {
        router.push("/admin/error");
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
        <AdminSidePanel />
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
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <button
                      onClick={() => handleShow(course._id)}
                      className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl"
                    >
                      Show
                    </button>
                  </div>
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
