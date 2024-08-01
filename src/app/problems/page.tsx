// file for showing problems
"use client";

// importing required modules
import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import { AppState } from "../store";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import { useRouter } from "next/navigation";
import { ProblemState } from "../store/problemStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
dotenv.config();

interface Category {
  _id: string;
  category_name: string;
}

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  category: string;
  premium: boolean;
}

const Problems = () => {
  const isAuthorized = AppState((state) => state.isAuthorized);
  const showProblems = ProblemState((state) => state.showProblems);
  const problems = ProblemState((state) => state.problems) as Problem[];
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);

  const router = useRouter();

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthorized, router]);

  // for getting all the problems
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/problems`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          console.log("response", response.data);
          showProblems(response.data);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchData();
  }, [showProblems]);

  // for getting the categories and difficulties
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/category_difficulty`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          const { category, difficulty } = response.data;
          setCategory(category);
          setDifficulty(difficulty);
        }
      } catch (error) {
        console.error("Error fetching categories and difficulties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Filter the problems based on the selected category and difficulty
    const filterProblems = () => {
      let filtered = problems;

      if (selectedCategory) {
        filtered = filtered.filter(
          (problem) => problem.category === selectedCategory
        );
      }

      if (selectedDifficulty) {
        filtered = filtered.filter(
          (problem) => problem.difficulty === selectedDifficulty
        );
      }

      setFilteredProblems(filtered);
    };

    filterProblems();
  }, [selectedCategory, selectedDifficulty, problems]);

  if (loading) {
    return (
      <SpinnerWrapper>
        <div>Loading...</div>
      </SpinnerWrapper>
    );
  }

  // Get current problems
  const indexOfLastProblem = currentPage * itemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - itemsPerPage;
  const currentProblems = filteredProblems?.slice(
    indexOfFirstProblem,
    indexOfLastProblem
  );

  // Change page
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredProblems.length / itemsPerPage)) {
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
        <div className="flex flex-wrap items-center justify-center space-x-0 md:space-x-10 left-0 md:left-24">
          <div className="flex justify-center col-span-1 w-full md:w-[300px]">
            <select
              id="category"
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
            >
              <option value="">Select Category</option>
              {category.map((cat) => (
                <option key={cat._id} value={cat.category_name}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1 flex justify-center w-full md:w-[300px] mt-3 md:mt-0">
            <select
              id="difficulty"
              name="difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
            >
              <option value="">Select Difficulty</option>
              {difficulty.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 flex justify-center mt-[25px] mb-7">
          {currentProblems && currentProblems.length > 0 ? (
            <div className="relative items-center justify-center overflow-x-auto shadow-md sm:rounded-lg w-full max-w-[1000px]">
              <table className="w-full items-center justify-items-center text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-300 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Q.No
                    </th>
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
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentProblems.map((problem, index) => (
                    <tr
                      key={problem._id}
                      className="bg-white border-b text-black dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <td className="px-6 py-4">{index + 1}</td>
                      <td
                        className="px-6 py-4 text-start"
                        style={{
                          width: "300px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <Link
                          className="text-black hover:text-blue-500"
                          href={`/problems/${problem._id}`}
                        >
                          {problem.title}
                        </Link>
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
              <div className="flex justify-center mt-4">
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
                    currentPage ===
                    Math.ceil(filteredProblems.length / itemsPerPage)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  }`}
                  disabled={
                    currentPage ===
                    Math.ceil(filteredProblems.length / itemsPerPage)
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
