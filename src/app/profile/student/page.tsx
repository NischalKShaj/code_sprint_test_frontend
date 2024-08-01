// file for profile
"use client";

// Import necessary modules
import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import UserSideBar from "@/components/partials/UserSideBar";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import crypto from "crypto";
import { CourseState } from "@/app/store/courseStore";
import Link from "next/link";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import { AppState } from "@/app/store";
import { useRouter } from "next/navigation";
dotenv.config();

interface Video {
  course_id: string;
  chapter: Chapter[];
}

interface Chapter {
  chapterName: string;
  videos: string[];
}

interface Solved {
  _id: string | undefined;
  title: string | undefined;
  difficulty: string | undefined;
  category: string | undefined;
}

const Profile = () => {
  const user = AppState((state) => state.user);
  const subscribedCourse = CourseState((state) => state.isSubscribed);
  const subscribe = CourseState((state) => state.subscribe);
  const isAuthenticated = AppState((state) => state.isAuthorized);
  const [loading, setIsLoading] = useState(true);
  const [subscribedVideos, setSubscribedVideos] = useState<Video[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [solvedProblems, setSolvedProblems] = useState<Solved[] | null>([]);
  const [difficultyCount, setDifficultyCount] = useState({
    Easy: 0,
    Medium: 0,
    Hard: 0,
  });
  const [solved, setSolved] = useState({ Easy: 0, Medium: 0, Hard: 0 });
  const coursesPerPage = 1;
  const router = useRouter();

  useLayoutEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const id = user?.id;
      const token = localStorage.getItem("access_token");
      console.log("token", token);

      if (!id || !token) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/profile/user/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.status === 202) {
          const subscribed = response.data.subscribed || [];

          const formattedSubscribedCourses = subscribed.map((course: any) => ({
            user_id: user?.id,
            username: user?.username,
            course_name: course.course_name,
            course_category: course.course_category,
            description: course.description,
            tutor_id: course.tutor,
            course_id: course._id,
          }));

          subscribe(formattedSubscribedCourses);

          const formattedSubscribedVideos = subscribed.map((course: any) => ({
            course_id: course._id,
            chapter: course.chapters.map((chapter: any) => ({
              chapterName: chapter.chapterName,
              videos: chapter.videos.map((video: string) =>
                decryptVideo(video)
              ),
            })),
          }));

          setSubscribedVideos(formattedSubscribedVideos);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, user?.id, subscribe, user?.username]);

  // for fetching the solved problems
  useEffect(() => {
    const fetchData = async () => {
      const id = user?.id;
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/profile/user/solutions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          console.log("soln", response.data);
          setSolvedProblems(response.data.problems);
          setSolved(response.data.solvedProblemsDifficulty);
          setDifficultyCount(response.data.difficultyCounts);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchData();
  }, [user?.id]);

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

  const handlePagination = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <SpinnerWrapper>
        <div>Loading...</div>
      </SpinnerWrapper>
    );
  }

  // Calculate index of videos to display based on current page
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = subscribedCourse.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  // For showing the progress in solving problems
  const totalQuestions = Object.values(difficultyCount).reduce(
    (a, b) => a + b,
    0
  );
  const totalSolved = Object.values(solved).reduce((a, b) => a + b, 0);
  const totalQuestionProgress =
    totalQuestions > 0 ? (totalSolved / totalQuestions) * 100 : 0;

  return (
    <div>
      <SpinnerWrapper>
        <UserSideBar />
        <div className="flex flex-col lg:flex-row items-center mb-24 bg-white mt-6 space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Solved Problems Section */}
          <section className="bg-[#D9D9D9] p-8 rounded-lg shadow-lg w-full lg:w-[500px] h-auto lg:h-[300px] lg:ml-[500px]">
            <h1 className="text-left text-xl font-semibold">Solved Problems</h1>
            <div className="flex flex-col lg:flex-row justify-between items-center h-auto lg:h-[200px] space-y-4 lg:space-y-0">
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-x-5 lg:space-y-0">
                <div className="flex flex-col items-start">
                  <h2 className="text-green-500 font-bold">Easy</h2>
                  <h3>
                    {solved.Easy || 0}/{difficultyCount.Easy}
                  </h3>
                </div>
                <div className="flex flex-col items-start">
                  <h2 className="text-yellow-500 font-bold">Medium</h2>
                  <h3>
                    {solved.Medium || 0}/{difficultyCount.Medium}
                  </h3>
                </div>
                <div className="flex flex-col items-start">
                  <h2 className="text-red-500 font-bold">Hard</h2>
                  <h3>
                    {solved.Hard || 0}/{difficultyCount.Hard}
                  </h3>
                </div>
              </div>
              <div className="w-[100px] h-[100px]">
                <CircularProgressbar
                  value={totalQuestionProgress}
                  text={`${totalSolved}/${totalQuestions}`}
                  styles={buildStyles({
                    textSize: "16px",
                    pathColor: "#4CAF50",
                    textColor: "#000",
                    trailColor: "#A5D6A7",
                  })}
                />
              </div>
            </div>
          </section>

          {/* My Courses Section */}
          <section className="bg-[#D9D9D9] p-8 rounded-lg shadow-lg w-full lg:w-[500px]">
            <h1 className="text-left text-xl font-semibold">My Courses</h1>
            {subscribedCourse.length === 0 ? (
              <p className="text-center mt-4">
                Subscribe to any course to see your courses.
              </p>
            ) : (
              <>
                {currentCourses.map((course) => {
                  const foundCourse = subscribedVideos.find(
                    (videoObj) => videoObj.course_id === course.course_id
                  );

                  if (
                    !foundCourse ||
                    !foundCourse.chapter ||
                    foundCourse.chapter.length === 0
                  ) {
                    return (
                      <div
                        key={course.course_id}
                        className="space-y-6 flex flex-col lg:flex-row items-center"
                      >
                        <div className="flex flex-col mt-8">
                          <h3>Course name: {course.course_name}</h3>
                          <p>No videos available</p>
                        </div>
                      </div>
                    );
                  }

                  const firstChapter = foundCourse.chapter[0];
                  const firstVideo =
                    firstChapter && firstChapter.videos.length > 0
                      ? firstChapter.videos[0]
                      : null;

                  return (
                    <div
                      key={course.course_id}
                      className="space-y-6 flex flex-col lg:flex-row items-center"
                    >
                      <div className="flex flex-col mt-8">
                        <h3>Course name: {course.course_name}</h3>
                        {firstVideo ? (
                          <video
                            className="rounded-lg"
                            width="300"
                            height="200"
                          >
                            <source src={firstVideo} type="video/webm" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <p>No videos available</p>
                        )}
                      </div>
                      {firstVideo && (
                        <Link href={`/course/${course.course_id}`}>
                          <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl mt-4 lg:mt-0">
                            Show
                          </button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            {/* Pagination Controls */}
            <div className="mt-4 flex justify-center flex-wrap">
              {Array.from(
                {
                  length: Math.ceil(subscribedCourse.length / coursesPerPage),
                },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePagination(index + 1)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? "bg-gray-300"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
          </section>
        </div>

        {/* Submitted Problems Section */}
        <section className="bg-[#D9D9D9] p-8 rounded-lg shadow-lg w-full lg:w-[1100px] mx-auto mb-5 lg:ml-[500px]">
          <h1 className="text-left text-xl font-semibold">
            Submitted Problems
          </h1>
          <div className="mt-[20px] flex flex-col lg:flex-row">
            {solvedProblems?.length && solvedProblems.length > 0 ? (
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-lg overflow-hidden">
                <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="p-4">
                      Index
                    </th>
                    <th scope="col" className="p-4">
                      Title
                    </th>
                    <th scope="col" className="p-4">
                      Category
                    </th>
                    <th scope="col" className="p-4">
                      Difficulty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {solvedProblems.map((problem, index) => (
                    <tr
                      key={problem._id}
                      className="bg-white border-b text-black dark:bg-gray-800 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
                    >
                      <td className="w-4 p-4">{index + 1}</td>
                      <td className="w-4 p-4">
                        <Link
                          className="text-black hover:text-blue-700"
                          href={`/problems/${problem._id}`}
                        >
                          {problem.title}
                        </Link>
                      </td>
                      <td className="w-4 p-4">{problem.category}</td>
                      <td
                        className={`w-4 p-4 ${
                          problem.difficulty === "Easy"
                            ? "text-green-500"
                            : problem.difficulty === "Medium"
                            ? "text-yellow-500"
                            : problem.difficulty === "Hard"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {problem.difficulty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>
                <h1>No problems solved till now</h1>
              </div>
            )}
          </div>
        </section>
      </SpinnerWrapper>
    </div>
  );
};

export default Profile;
