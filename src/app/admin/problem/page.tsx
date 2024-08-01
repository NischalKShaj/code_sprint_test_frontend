// file to add problems in the admin side
"use client";

// importing the required modules
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import axios from "axios";
import React, { useEffect, useState } from "react";
import dotenv from "dotenv";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";
dotenv.config();

interface Problem {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  premium: boolean;
}

const Problems = () => {
  const [problems, setProblem] = useState<Problem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("admin_access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/problems`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          console.log("response", response.data);
          setProblem(response.data);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchData();
  }, []);

  // Get current problems
  const indexOfLastProblem = currentPage * itemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - itemsPerPage;
  const currentProblems = problems.slice(
    indexOfFirstProblem,
    indexOfLastProblem
  );

  // Change page
  const nextPage = () => {
    if (currentPage < Math.ceil(problems.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <SpinnerWrapper>
        <AdminSidePanel />
        <div className="flex-1 ml-[220px] flex justify-center mt-[25px] px-4 md:ml-[220px]">
          {currentProblems && currentProblems.length > 0 ? (
            <div className="relative items-center justify-center overflow-x-auto shadow-md sm:rounded-lg w-[1000px]">
              <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
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
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Difficulty
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentProblems.map((problem) => (
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
                      <td className="px-6 py-4"> {problem.description} </td>
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
                      <td className="px-6 py-4 space-x-2 justify-center">
                        <FontAwesomeIcon
                          icon={problem.premium ? faLock : faUnlock}
                          style={{
                            color: problem.premium ? "goldenrod" : "black",
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center mt-4 flex-wrap gap-2">
                <button
                  onClick={prevPage}
                  className={`px-4 py-2 mx-1 ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  } rounded`}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  className={`px-4 py-2 mx-1 rounded ${
                    currentPage === Math.ceil(problems.length / itemsPerPage)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  }`}
                  disabled={
                    currentPage === Math.ceil(problems.length / itemsPerPage)
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

export default Problems;
