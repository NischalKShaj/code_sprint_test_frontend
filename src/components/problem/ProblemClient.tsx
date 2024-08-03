// src/app/problems/[problemId]/ProblemClient.tsx

"use client";

import React, { useState } from "react";
import { Editor } from "@monaco-editor/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import Link from "next/link";
import Swal from "sweetalert2";
import axios from "axios";

interface TestCase {
  input: string;
  expectedOutput: string;
  output: string;
}

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  constraints: string;
  testCases: TestCase[];
  exampleTestCase: TestCase[];
  premium: boolean;
  clientCode: string;
}

interface ProblemClientProps {
  problem: Problem;
}

const ProblemClient: React.FC<ProblemClientProps> = ({ problem }) => {
  const [editorContent, setEditorContent] = useState<string>(
    problem.clientCode || ""
  );
  const [loading, setLoading] = useState(false);
  const [change, setChange] = useState(false);
  const [results, setResults] = useState<TestCase[]>([]);
  const [testCaseStatus, setTestCaseStatus] = useState("");

  const handleTestCase = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/problem/execute`,
        {
          id: problem._id,
          clientCode: editorContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        setChange(true);
        setTestCaseStatus("passed");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const filteredData = error.response.data.map((value: any) => ({
          input: value.data.input || "",
          expectedOutput: value.data.expectedOutput || "",
          output: value.data.decodedOutput || "",
        }));
        setResults(filteredData);
        setTestCaseStatus("failed");
      } else {
        console.error("Error checking test cases", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/problem/submit`,
        {
          id: problem._id,
          clientCode: editorContent,
          userId: localStorage.getItem("userId"),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Code submitted successfully",
          confirmButtonText: "OK",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const filteredData = error.response.data.map((value: any) => ({
          input: value.data.input || "",
          expectedOutput: value.data.expectedOutput || "",
          output: value.data.decodedOutput || "",
        }));
        setResults(filteredData);
        setTestCaseStatus("failed");
      } else {
        console.error("Error submitting code", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
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
      <div className="bg-gray-800 p-4 rounded-md">
        <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
        <p className="text-white mt-2">{problem.description}</p>
        <p className="mt-2">
          <strong className="text-white">Difficulty:</strong>{" "}
          <span
            className={
              problem.difficulty === "Easy"
                ? "text-green-500"
                : problem.difficulty === "Medium"
                ? "text-yellow-500"
                : problem.difficulty === "Hard"
                ? "text-red-500"
                : ""
            }
          >
            {problem.difficulty}
          </span>
        </p>
        <p className="text-white mt-2">
          <strong>Category:</strong> {problem.category}
        </p>
        <p className="text-white mt-2">
          <strong>Constraints:</strong> {problem.constraints}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
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
              <div className="flex flex-wrap space-x-2 mt-4">
                <button
                  onClick={handleTestCase}
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faPlay} /> Run Test Cases
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-red-600 font-bold text-xl">
                <p>Test Cases Status:</p>
              </div>
              <p>No results to show</p>
            </div>
          )}
        </div>
        <div className="flex justify-end text-white mt-4">
          <Link href="/problems">Back to Problems</Link>
        </div>
      </div>
    </div>
  );
};

export default ProblemClient;
