"use client";

// importing all the required modules for the file
import { AppState } from "@/app/store";
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import axios from "axios";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
dotenv.config();
import React, { useEffect, useLayoutEffect, useState } from "react";

const TutorPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 5;
  const allTutors = AppState((state) => state.allTutor);
  const isAdmin = AppState((state) => state.isAdmin);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    } else {
      setLoading(false);
    }
  }, [isAdmin, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // function to handle tutor block and unblock
  const handleBlock = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_access_token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/tutor/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const status = response.data.status;
        localStorage.removeItem("access_token");
        const tutorIndex = allTutors.findIndex((tutor) => tutor.id === id);

        if (tutorIndex !== -1) {
          AppState.getState().blockUnblock(id, !status);
        }
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Calculate the index of the first and last tutor to display
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = allTutors.slice(indexOfFirstTutor, indexOfLastTutor);

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
        {allTutors && allTutors.length > 0 ? (
          <div className="relative ml-[10px] mt-[25px] sm:ml-[50px] md:ml-[100px] lg:ml-[500px] w-full max-w-[1000px] mx-auto items-center justify-center overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="p-4"></th>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTutors.map((tutor) => (
                  <tr
                    key={tutor.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="w-4 p-4"></td>
                    <th
                      scope="row"
                      className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      <div className="ps-3">
                        <div className="text-base font-semibold">
                          {tutor.username}
                        </div>
                        <div className="text-base font-thin">{tutor.email}</div>
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            tutor.isOnline ? "bg-green-500" : "bg-red-500"
                          } me-2`}
                        ></div>
                        <span
                          className={`${
                            tutor.isOnline ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {tutor.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {tutor.block ? (
                        <button
                          onClick={() => handleBlock(tutor.id)}
                          className="font-bold py-2 px-4 rounded-xl bg-green-600 text-white"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(tutor.id)}
                          className="font-bold py-2 px-4 rounded-xl bg-red-600 text-white"
                        >
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 text-white bg-blue-500 rounded disabled:bg-gray-400"
              >
                Previous
              </button>
              {Array.from(
                { length: Math.ceil(allTutors.length / tutorsPerPage) },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 mx-1 ${
                      currentPage === index + 1
                        ? "bg-blue-700 text-white"
                        : "bg-blue-500 text-white"
                    } rounded`}
                  >
                    {index + 1}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === Math.ceil(allTutors.length / tutorsPerPage)
                }
                className="px-4 py-2 mx-1 text-white bg-blue-500 rounded disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p>No tutors found</p>
        )}
      </SpinnerWrapper>
    </div>
  );
};

export default TutorPage;
