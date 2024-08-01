// file for creating the side panel
"use client";
// importing the required modules
import axios from "axios";
import React from "react";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
import { AppState } from "@/app/store";
import Swal from "sweetalert2";
import Link from "next/link";
dotenv.config();

const AdminSidePanel = () => {
  const router = useRouter();
  const admin = AppState((state) => state.isAdmin);
  const logout = AppState((state) => state.isAdminLoggedOut);
  const findUsers = AppState((state) => state.findAllUsers);
  const findTutors = AppState((state) => state.findAllTutor);

  // function to show the user data

  const userRoute = async () => {
    try {
      const token = localStorage.getItem("admin_access_token");
      console.log("Token:", token);

      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log("Response:", response.data);

        const formattedData = response.data.map((user: any) => ({
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          block: user.blocked,
          isOnline: user.isOnline,
        }));

        console.log("Formatted Data:", formattedData);

        findUsers(formattedData);
        router.push("/admin/user");
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  // function to show the dashboard
  const dashboardRoute = () => {
    router.push("/admin/dashboard");
  };

  // function to show the tutor data
  const tutorRoute = async () => {
    try {
      const token = localStorage.getItem("admin_access_token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/tutors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const formate_data = response.data.map((tutor: any) => ({
          id: tutor._id,
          username: tutor.username,
          email: tutor.email,
          profileImage: tutor.profileImage,
          block: tutor.blocked,
        }));
        console.log("formate", formate_data);
        findTutors(formate_data);
        router.push("/admin/tutor");
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        position: "center",
        icon: "warning",
        title: "Are you sure you want to logout",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        denyButtonText: "Cancel",

        customClass: {
          confirmButton: "btn-confirm",
          denyButton: "btn-deny",
        },
      });

      if (result.isConfirmed) {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/logout`
        );
        if (response.status === 200) {
          logout();
          localStorage.removeItem("admin_access_token");
          router.push("/admin");
        }
      }
    } catch (error) {
      console.error("error");
    }
  };

  // function to move to the banner page
  const bannerRoute = () => {
    router.push("/admin/banner");
  };

  // function to move to the problems page
  const problemRoute = () => {
    router.push("/admin/problem");
  };

  const dailyProblemRoute = () => {
    router.push("/admin/dailyProblem");
  };

  const courseRoute = () => {
    router.push("/admin/course");
  };

  return (
    <div>
      <button
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            fill-rule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      <aside
        id="default-sidebar"
        className="absolute top-[200px] left-[50px] z-40 w-64  transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className=" px-3 py-4 rounded-lg overflow-y-auto bg-[#D9D9D9] dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li>
              <button
                onClick={dashboardRoute}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={userRoute}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Users</span>
              </button>
            </li>
            <li>
              <button
                onClick={tutorRoute}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Tutor</span>
              </button>
            </li>
            <li>
              <button
                onClick={courseRoute}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 18"
                >
                  <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                </svg>

                <span className="flex-1 ms-3 whitespace-nowrap">Courses</span>
              </button>
            </li>
            <li>
              <button
                onClick={dailyProblemRoute}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-5 text-gray-500 mr-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V10h14v9zM5 8V5h14v3H5z" />
                </svg>

                <span className="flex-1 ms-3 whitespace-nowrap">
                  Daily Problems
                </span>
              </button>
            </li>
            <li>
              <button
                onClick={problemRoute}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-5 text-gray-500 mr-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 2.93 1.95 5.43 4.63 6.32L10 17h4l.37-1.68C17.05 14.43 19 11.93 19 9c0-3.87-3.13-7-7-7zM12 22c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2zm3-5H9v-1h6v1z" />
                </svg>

                <span className="flex-1 ms-3 whitespace-nowrap">Problems</span>
              </button>
            </li>
            <li>
              <button
                onClick={bannerRoute}
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 2c0-1.105.895-2 2-2h10c1.105 0 2 .895 2 2v10.586l-3.707-3.707a1 1 0 0 0-1.414 0l-5.586 5.586a1 1 0 0 1-1.414 0L3 12.586V2zM5 4v7.586l5.293 5.293a1 1 0 0 0 1.414 0l5.586-5.586a1 1 0 0 0 0-1.414L15 4H5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Banner</span>
              </button>
            </li>
            <li>
              <Link href="/admin/payout">
                <button className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <svg
                    className="w-5 h-5 text-gray-500 mr-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 8c1.104 0 2 .896 2 2v8c0 1.104-.896 2-2 2H3c-1.104 0-2-.896-2-2V8c0-1.104.896-2 2-2h1V5c0-1.104.896-2 2-2h12c1.104 0 2 .896 2 2v1h1zm-3-3H6v2h12V5zm-3 8h2v2h-2v-2zM3 10v8h18v-8H3z" />
                  </svg>

                  <span className="flex-1 ms-3 whitespace-nowrap">Payouts</span>
                </button>
              </Link>
            </li>
            <li>
              <Link href="/admin/category">
                <button className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <svg
                    className="w-5 h-5 text-gray-500 mr-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 4h5v5H4V4zm6 0h5v5h-5V4zm6 0h5v5h-5V4zM4 10h5v5H4v-5zm6 0h5v5h-5v-5zm6 0h5v5h-5v-5zM4 16h5v5H4v-5zm6 0h5v5h-5v-5zm6 0h5v5h-5v-5z" />
                  </svg>

                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Category
                  </span>
                </button>
              </Link>
            </li>
            <li>
              {admin && (
                <button
                  onClick={handleLogout}
                  className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl"
                >
                  logout
                </button>
              )}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default AdminSidePanel;
