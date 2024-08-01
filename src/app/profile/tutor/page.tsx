// file to show the tutors profile page
"use client";

// importing the required modules
import { AppState } from "@/app/store";
import TotalSubscriber from "@/components/graph/TotalSubscriber";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import TutorSideBar from "@/components/partials/TutorSideBar";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useLayoutEffect, useState } from "react";

// interface for the subscriber
interface Subscriber {
  username: string;
  email: string;
  courseTitle: string;
}

const TutorProfilePage = () => {
  const [loading, setIsLoading] = useState(true);
  const user = AppState((state) => state.user);
  const router = useRouter();
  const [totalSub, setTotalSub] = useState<Subscriber[]>([]);
  const isAuthorized = AppState((state) => state.isAuthorized);

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthorized, router]);

  useEffect(() => {
    setIsLoading(false);
    const id = user?.id;
    const token = localStorage.getItem("access_token");

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/profile/tutor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.status === 202) {
          console.log("response", response.data.subscribers);

          setTotalSub((prev) => [...response.data.subscribers]);
        } else {
          router.push("/login");
        }
      } catch (error) {
        if (!id) {
          router.push("/login");
        } else {
          console.error("Error fetching data:", error);
          router.push("/error");
        }
      }
    };

    fetchData();
  }, [router, user?.id, user?.username]);

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
        <TutorSideBar />
        <div className="flex flex-col lg:flex-row items-center mb-36 bg-white mt-6">
          <section className="bg-[#D9D9D9] p-8 w-full lg:w-[950px] mt-5 lg:mt-[50px] lg:ml-[500px] rounded-lg shadow-lg">
            <h1 className="text-left text-xl font-semibold mb-4">
              Subscribers list
            </h1>
            <div className="w-full overflow-x-auto">
              {totalSub.length > 0 ? (
                // Table to display subscribers
                <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-lg overflow-hidden">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="p-4">
                        Username
                      </th>
                      <th scope="col" className="p-4">
                        Email
                      </th>
                      <th scope="col" className="p-4">
                        Course
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Map over totalSub array and render each subscriber */}
                    {totalSub.map((subscriber, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="p-4">{subscriber.username}</td>
                        <td className="p-4">{subscriber.email}</td>
                        <td className="p-4">{subscriber.courseTitle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="mt-4 text-gray-500 text-center">
                  No subscribers
                </div>
              )}
            </div>
          </section>
        </div>
        <section className="bg-[#D9D9D9] p-8 w-full lg:w-[950px] mt-5 lg:mt-[-45px] lg:ml-[500px] mb-5 rounded-lg shadow-lg">
          <h1 className="text-left text-xl font-semibold">
            Total Subscribers: {totalSub.length}
          </h1>
          <div className="mt-2 flex items-center">
            <TotalSubscriber />
          </div>
        </section>
      </SpinnerWrapper>
    </div>
  );
};

export default TutorProfilePage;
