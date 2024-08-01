// file to show the daily problems
"use client";

// importing the required module
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import { faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useState } from "react";
import dotenv from "dotenv";
dotenv.config();

interface DailyProblem {
  title: string;
  category: string;
  difficulty: string;
  _id: string;
  date: Date;
}

const DailyProblem = () => {
  const [dailyProblems, setDailyProblems] = useState<DailyProblem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // initial loading to get the daily problems
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("admin_access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/problem/dailyProblems`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          console.log("response", response.data);
          const dp: DailyProblem[] = response.data.map((item: any) => ({
            title: item.problem.title,
            category: item.problem.category,
            difficulty: item.problem.difficulty,
            _id: item.problem._id,
            date: new Date(item.date),
          }));
          setDailyProblems(dp);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchData();
  }, []);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dailyProblems.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <SpinnerWrapper>
        <AdminSidePanel />
        <div className="flex-1 ml-[220px] flex justify-center mt-[25px] px-4 sm:px-6">
          {dailyProblems && dailyProblems.length > 0 ? (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-[1000px]">
              <table className="min-w-[1000px] text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3"
                      style={{ width: "200px" }}
                    >
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Difficulty
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((problem) => (
                    <tr
                      key={problem._id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td
                        className="px-6 py-4"
                        style={{
                          width: "300px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {problem.title}
                      </td>
                      <td
                        className={`px-6 py-4 ${
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
                      <td className="px-6 py-4 space-x-2">
                        {problem.category}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(problem.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center mt-4 gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  }`}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage ===
                    Math.ceil(dailyProblems.length / itemsPerPage)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  }`}
                  disabled={
                    currentPage ===
                    Math.ceil(dailyProblems.length / itemsPerPage)
                  }
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No problems found</p>
          )}
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default DailyProblem;
