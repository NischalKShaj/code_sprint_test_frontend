// file to show the daily coding questions
"use client";

// Importing the required modules
import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dotenv from "dotenv";
import { AppState } from "../store";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import base64 from "base-64";
import { ProblemState } from "../store/problemStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { Editor } from "@monaco-editor/react";
import Link from "next/link";
dotenv.config();

interface TestCase {
  input: string;
  expectedOutput: string;
  output: string;
}

const Contest = () => {
  const isAuthorized = AppState((state) => state.isAuthorized);
  const showProblem = ProblemState((state) => state.showProblem);
  const problem = ProblemState((state) => state.problem);
  const user = AppState((state) => state.user);
  const [change, setChange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState<string>("");
  const [results, setResults] = useState<TestCase[]>([]);
  const [testCaseStatus, setTestCaseStatus] = useState("");
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const router = useRouter();

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthorized, router]);

  // Fetching the data for the daily coding challenge
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/problems/dailyProblems/${date}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          console.log("response", response.data);
          const decodedClientCode = base64.decode(
            response.data.problem.clientCode
          );
          showProblem({
            _id: response.data.problem._id,
            title: response.data.problem.title,
            description: response.data.problem.description,
            difficulty: response.data.problem.difficulty,
            category: response.data.problem.category,
            testCases: response.data.testCases.testCases,
            exampleTestCase: response.data.testCases.exampleTest,
            constraints: response.data.problem.constraints,
            premium: response.data.testCases.premium,
            clientCode: decodedClientCode,
          });
          setEditorContent(decodedClientCode);
        }
      } catch (error) {
        console.error("error", error);
      }
    };

    if (date) {
      fetchData();
    }
  }, [date, showProblem]);

  // function to check whether the test are cleared
  const handleTestCases = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/problem/execute`,
        {
          id: problem?._id,
          clientCode: editorContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        console.log("response", response.data);
        setChange(true);
        setTestCaseStatus("passed");
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          console.log("response 400", error.response.data);
          setChange(true);

          // Ensure the map function correctly assigns properties
          const filteredData = error.response.data.map((value: any) => ({
            input: value.data.input || "",
            expectedOutput: value.data.expectedOutput || "",
            output: value.data.decodedOutput || "", // Adjust property based on your response structure
          }));

          console.log("filtered Data", filteredData);

          setResults(filteredData);
          setTestCaseStatus("failed");
        } else {
          console.error("Unexpected error response", error.response.data);
        }
      } else if (error.request) {
        console.error("No response received", error.request);
      } else {
        console.error("Error", error.message);
      }
    }
  };

  // to get the current state of the editor
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
    }
  };

  // function to submit the code after checking the test cases
  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/problem/submit`,
        {
          id: problem?._id,
          clientCode: editorContent,
          userId: user?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        console.log("response", response.data);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "code submitted successfully",
          confirmButtonText: "OK",
        });
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          console.log("response 400", error.response.data);
          setChange(true);

          // Ensure the map function correctly assigns properties
          const filteredData = error.response.data.map((value: any) => ({
            input: value.data.input || "",
            expectedOutput: value.data.expectedOutput || "",
            output: value.data.decodedOutput || "", // Adjust property based on your response structure
          }));

          console.log("filtered Data", filteredData);

          setResults(filteredData);
          setTestCaseStatus("failed");
        } else {
          console.error("Unexpected error response", error.response.data);
        }
      } else if (error.request) {
        console.error("No response received", error.request);
      } else {
        console.error("Error", error.message);
      }
    }
  };

  if (loading) {
    return (
      <SpinnerWrapper>
        <div>Loading...</div>
      </SpinnerWrapper>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <SpinnerWrapper>
        <div className="bg-gray-800 p-4 rounded-md">
          <h1 className="text-2xl font-bold text-white">{problem?.title}</h1>
          <p className="text-white mt-2">{problem?.description}</p>
          <p className="mt-2">
            <strong className="text-white">Difficulty:</strong>{" "}
            <span
              className={
                problem?.difficulty === "Easy"
                  ? "text-green-500"
                  : problem?.difficulty === "Medium"
                  ? "text-yellow-500"
                  : problem?.difficulty === "Hard"
                  ? "text-red-500"
                  : ""
              }
            >
              {problem?.difficulty}
            </span>
          </p>
          <p className="text-white mt-2">
            <strong>Category:</strong> {problem?.category}
          </p>
          <p className="text-white mt-2">
            <strong>Constraints:</strong> {problem?.constraints}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label
                htmlFor="source_code"
                className="block text-green-600 text-sm font-medium"
              >
                Code {"</>"} <span className="text-white"> python</span>
              </label>
              <div className="w-full p-4 border">
                <Editor
                  height="50vh"
                  defaultLanguage="python"
                  value={editorContent}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                />
              </div>
            </div>
            {change ? (
              <div>
                <label
                  htmlFor="example_test_case"
                  className="block text-green-600 text-sm font-medium"
                >
                  Result
                </label>
                <div className="w-full p-4 border bg-gray-700 text-white">
                  {testCaseStatus === "passed" ? (
                    <div className="text-green-600">
                      <p>Test cases passed!</p>
                    </div>
                  ) : (
                    results.map((test, index) => (
                      <div key={index} className="mb-4">
                        <div className="text-red-600 font-bold text-xl">
                          <p>Wrong Answer!</p>
                        </div>

                        <p>
                          <strong>Input:</strong> {test.input}
                        </p>
                        <p>
                          <strong>Expected Output: </strong>
                          <span className="text-green-600 font-bold">
                            {test.expectedOutput}
                          </span>
                        </p>
                        <p>
                          <strong>Your Output: </strong>
                          <span className="text-red-600 font-bold">
                            {test.output}
                          </span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex space-x-5 mt-4">
                  <button
                    onClick={handleTestCases}
                    className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="example_test_case"
                  className="block text-green-600 text-sm font-medium"
                >
                  Example Test Case
                </label>
                <div className="w-full p-4 border bg-gray-700 text-white">
                  {problem?.exampleTestCase?.map((test: any, index) => (
                    <div key={index} className="mb-4">
                      <p>
                        <strong>Input:</strong> {test.input}
                      </p>
                      <p>
                        <strong>Output:</strong> {test.expectedOutput}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-5 mt-4">
                  <button
                    onClick={handleTestCases}
                    className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="items-right justify-end flex text-white mt-4">
            <Link href="/problems">Back to Problems</Link>
          </div>
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default Contest;
