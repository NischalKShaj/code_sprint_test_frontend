"use client";

// importing all the required files
import React, { useEffect, useLayoutEffect, useState } from "react";
import { AppState } from "@/app/store";
import dynamic from "next/dynamic";
import axios from "axios";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import { useRouter } from "next/navigation";
const AdminSidePanel = dynamic(
  () => import("@/components/partials/AdminSidePanel"),
  { ssr: false }
);

const UserPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const allUser = AppState((state) => state.allUser);
  const isAdmin = AppState((state) => state.isAdmin);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, router]);

  const handleBlock = async (id: any) => {
    try {
      const token = localStorage.getItem("admin_access_token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/user/${id}`,
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
        const userIndex = allUser.findIndex((user) => user.id === id);

        if (userIndex !== -1) {
          AppState.getState().block_unblock(id, !status);
        }
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Calculate the index of the first and last user to display
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = allUser.slice(indexOfFirstUser, indexOfLastUser);

  if (isLoading) {
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

        {allUser && allUser.length > 0 ? (
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
                {currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="w-4 p-4"></td>
                    <th
                      scope="row"
                      className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      <div className="ps-3">
                        <div className="text-base font-semibold">
                          {user.username}
                        </div>
                        <div className="font-normal text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            user.isOnline ? "bg-green-500" : "bg-red-500"
                          } me-2`}
                        ></div>
                        <span
                          className={`${
                            user.isOnline ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {user.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {user.block ? (
                        <button
                          onClick={() => handleBlock(user.id)}
                          className="font-bold py-2 px-4 rounded-xl bg-green-600 text-white"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(user.id)}
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
            <div className="flex flex-col sm:flex-row justify-center mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 text-white bg-blue-500 rounded disabled:bg-gray-400"
              >
                Previous
              </button>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  { length: Math.ceil(allUser.length / usersPerPage) },
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
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === Math.ceil(allUser.length / usersPerPage)
                }
                className="px-4 py-2 mx-1 text-white bg-blue-500 rounded disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p>No users found</p>
        )}
      </SpinnerWrapper>
    </div>
  );
};

export default UserPage;
