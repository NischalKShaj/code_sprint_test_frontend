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
  const subscribe = CourseState((state) => state.subscribe);
  const unsubscribe = CourseState((state) => state.unsubscribe);
  const subCourses = CourseState((state) => state.isSubscribed);

  const courseSubscribed = subCourses?.some(
    (sub) => sub.course_id === course?._id
  );

  const [decryptedVideos, setDecryptedVideos] = useState<string[]>([]);

  const isAuthorized = AppState((state) => state.isAuthorized);

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthorized]);

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
        const token = localStorage.getItem("access_token");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${id}`,
          { id: userData?.id },
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
            chapters: response.data.courses.chapters.map(
              (chapter: Chapter) => ({
                ...chapter,
                videos: chapter.videos.map((video: string) =>
                  decryptVideo(video)
                ),
              })
            ),
          };
          showCourse(decryptedCourse);
          setDecryptedVideos(
            decryptedCourse.chapters.flatMap(
              (chapter: Chapter) => chapter.videos
            )
          );

          if (response.data.subCourse) {
            const subscribedCourse = {
              user_id: userData?.id,
              username: userData?.username,
              course_name: response.data.courses.course_name,
              course_category: response.data.courses.course_category,
              description: response.data.courses.description,
              course_id: response.data.courses._id,
              tutor_id: response.data.courses.tutor,
            };
            subscribe([subscribedCourse]);
          }
        } else if (response.status === 500) {
          router.push("/error");
        } else {
          router.push("/");
        }
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          router.push("/login");
        } else {
          router.push("/error");
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
  const completedCount = Object.values(courseCompletion).filter(Boolean).length;
  const totalTutorials = decryptedVideos.length;
  const completionPercentage = Math.round(
    (completedCount / totalTutorials) * 100
  );

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

  const handleSubscribe = async () => {
    try {
      const scriptLoaded = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/razorpay`,
        {
          user: userData?.id,
          course: course?._id,
          amount: course?.price,
        }
      );
      const { id: order_id, currency } = response.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: (course?.price ?? 0) * 100,
        currency,
        name: course?.course_name,
        order_id,
        handler: async function (response: any) {
          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-success`,
              { user: userData?.id, course: course?._id }
            );
            if (res.status === 202) {
              Swal.fire({
                title: "Payment Success!",
                text: "Thank you for subscribing! Get ready to dive into the course and unlock your potential!",
                icon: "success",
                confirmButtonText: "OK",
              });

              const courseDetails = res.data.courses;
              if (courseDetails && courseDetails.length > 0) {
                const subscribedCourses = courseDetails.map(
                  (courseDetail: { tutorId: any; courseId: any }) => ({
                    user_id: userData?.id,
                    username: userData?.username,
                    course_name: course?.course_name,
                    course_category: course?.course_category,
                    description: course?.description,
                    tutor_id: courseDetail.tutorId,
                    course_id: courseDetail.courseId,
                  })
                );

                subscribe(subscribedCourses);
              }
            } else {
              Swal.fire({
                title: "Payment Failed!",
                text: "Your payment has been rejected!",
                icon: "warning",
                confirmButtonText: "OK",
              });
            }
          } catch (error) {
            Swal.fire({
              title: "Payment Failed!",
              text: "Your payment has been rejected!",
              icon: "warning",
              confirmButtonText: "OK",
            });
          }
        },
        prefill: {
          name: userData?.username,
          email: userData?.email,
          contact: userData?.phone,
        },
        notes: {
          address: "1234 Main Street",
        },
        theme: {
          color: "#1a202c",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/course/unsubscribe/${id}`,
        {
          user_id: userData?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 202) {
        Swal.fire({
          title: "Unsubscribed!",
          text: "You have successfully unsubscribed from the course.",
          icon: "success",
          confirmButtonText: "OK",
        });

        unsubscribe(course?._id);
      } else {
        Swal.fire({
          title: "Unsubscription Failed!",
          text: "There was an error while trying to unsubscribe.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error while unsubscribing:", error);
    }
  };

  return (
    <div>
      <SpinnerWrapper>
        {course && (
          <>
            <div className="course-details flex flex-col justify-start text-end bg-gradient-to-r from-purple-500 to-indigo-500 py-4 px-4 sm:px-8">
              <Link className="text-left flex mb-4" href="/course">
                Back to courses
              </Link>
              <div className="mx-auto max-w-screen-lg mt-5 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg rounded-lg">
                {course.description}
                {!courseSubscribed && !userData?.premium && (
                  <>
                    <button
                      className="bg-[#2a31f8] mt-5 text-white font-bold py-2 px-4 rounded-xl"
                      onClick={handleSubscribe}
                    >
                      Subscribe
                    </button>
                    <p>Price: &#8377; {course.price}</p>
                  </>
                )}
                {courseSubscribed && !userData?.premium && (
                  <button
                    className="bg-[#f82a2a] mt-5 text-white font-bold py-2 px-4 rounded-xl"
                    onClick={handleUnsubscribe}
                  >
                    Unsubscribe
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:ml-[50px] lg:ml-[300px]">
              <section className="bg-[#D9D9D9] p-4 sm:p-8 mx-4 md:mx-8 mt-5 mb-5 w-full md:w-[650px] rounded-lg shadow-lg">
                <h1 className="text-center text-2xl sm:text-3xl font-semibold">
                  {course?.course_name}
                </h1>
                {courseSubscribed || userData?.premium ? (
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
                        <div className="flex items-center mt-2 sm:mt-0">
                          <input
                            type="checkbox"
                            className="w-6 h-6"
                            checked={!!courseCompletion[videoUrl]}
                            onChange={() => handleCheckboxChange(videoUrl)}
                          />
                        </div>
                      </div>
                    ))}
                    {renderPagination()}
                  </div>
                ) : (
                  <p className="text-center">Subscribe to watch the videos</p>
                )}
              </section>
              <section className="bg-[#D9D9D9] p-4 sm:p-8 mx-4 md:mx-8 mt-5 mb-5 w-full md:w-[500px] h-auto md:h-[300px] rounded-lg shadow-lg">
                <h1 className="text-left text-lg sm:text-xl font-semibold">
                  Course Completion Status
                </h1>
                <div className="mt-4 sm:mt-[60px] space-y-4 sm:space-y-6 flex flex-col sm:flex-row items-center">
                  <div>
                    <h3>Total Tutorials: {totalTutorials}</h3>
                    <h3>Completed: {completedCount}</h3>
                  </div>
                  <div className="mt-4 sm:mt-0 ml-0 sm:ml-4">
                    <div className="w-[100px] h-[100px]">
                      <CircularProgressbar
                        value={completionPercentage}
                        text={`${completionPercentage}%`}
                        styles={buildStyles({
                          pathColor: "#4CAF50",
                          textColor: "#000",
                          trailColor: "#A5D6A7",
                        })}
                      />
                    </div>
                  </div>
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
