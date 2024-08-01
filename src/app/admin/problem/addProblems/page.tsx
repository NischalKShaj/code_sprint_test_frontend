// file to add new problems
"use client";

// importing the required modules
import React, { ChangeEventHandler, useEffect, useState } from "react";
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import axios from "axios";
import dotenv from "dotenv";
import CategoryModal from "@/components/modal/CategoryModal";
import Editor from "@monaco-editor/react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

dotenv.config();

interface Category {
  _id: string;
  category_name: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface FormData {
  problemName: string;
  description: string;
  category: string;
  difficulty: string;
  testCase: TestCase[];
  mainCode: string;
  clientTemplate: string;
  constraints: string;
  premium: boolean;
}

const AddProblems = () => {
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [inputTestCase, setInputTestCase] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    problemName: "",
    description: "",
    difficulty: "",
    category: "",
    testCase: [],
    mainCode: "print('hello world')",
    clientTemplate: "print('hello world')",
    constraints: "",
    premium: false,
  });

  const router = useRouter();

  const totalSections = 3;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("admin_access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/problems/addProblems/categoryAndDifficulty`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          setDifficulty(response.data.difficulty);
          setCategory(response.data.category);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchData();
  }, []);

  const handleAddCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  // function to save the category
  const handleSaveCategory = async (categoryName: string) => {
    const token = localStorage.getItem("admin_access_token");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/problems/addCategory`,
        { category: categoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        setCategory((prev) => [...prev, response.data]);
        setSelectedCategory(response.data.category_name);
      }
    } catch (error) {
      console.error("error", error);
    }
    setIsCategoryModalOpen(false);
  };

  const handleNextSection = () => {
    setCurrentSection((prevSection) =>
      Math.min(prevSection + 1, totalSections)
    );
  };

  const handlePreviousSection = () => {
    setCurrentSection((prevSection) => Math.max(prevSection - 1, 1));
  };

  const progressPercentage = ((currentSection - 1) / (totalSections - 1)) * 100;

  const handleInputChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  > = (e) => {
    const { name, value, type } = e.target;
    if (type === "radio") {
      setFormData((prevData) => ({ ...prevData, premium: value === "true" }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // function to add the test cases to the state
  const handleTestCase: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputTestCase(e.currentTarget.value);
  };

  const handleExpectedOutput: ChangeEventHandler<HTMLInputElement> = (e) => {
    setExpectedOutput(e.currentTarget.value);
  };

  const addTestCase = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent the default form submission

    if (inputTestCase && expectedOutput) {
      const newTestCase = { input: inputTestCase, expectedOutput };
      setTestCases([...testCases, newTestCase]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        testCase: [...prevFormData.testCase, newTestCase],
      }));
      setInputTestCase("");
      setExpectedOutput("");
    }
  };

  // function to handle the verification of the testCases
  const verifyTestCase = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent the default form submission

    const token = localStorage.getItem("admin_access_token");
    let main = formData.mainCode;
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/addProblem/verifyTestCase`,
        { main, testInput: inputTestCase, expectedOutput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        const decodedOutput = response.data.decodedOutput;
        console.log("response", response.data.decodedOutput);
        if (parseInt(decodedOutput) === parseInt(expectedOutput)) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Test case verified",
            confirmButtonText: "Ok",
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Test case not verified",
            text: `Expected output is ${response.data.decodedOutput}`,
            confirmButtonText: "Ok",
          });
        }
      } else if (response.status === 404) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Test case not verified",
          text: `Expected output is ${response.data.decodedOutput}`,
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("error", error);
      router.push("/admin/error");
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Test case not verified",
        confirmButtonText: "Ok",
      });
    }
  };

  // function to handle the change in the editor
  const handleEditorChange = (
    value: string | undefined,
    field: keyof FormData
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value ?? "",
    }));
  };

  // function to add the question
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("admin_access_token");

    console.log("formData", formData);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/problem/addProblem`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        Swal.fire({
          position: "center",
          icon: "success",
          text: "Problem added successfully..!",
          confirmButtonText: "OK",
        });
      }
      router.push("/admin/problem");
    } catch (error) {
      console.error("error", error);
      router.push("/admin/error");
    }
  };

  return (
    <div>
      <SpinnerWrapper>
        <AdminSidePanel />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form
            className="bg-white shadow-lg rounded-lg p-8 space-y-8 divide-y divide-gray-200"
            onSubmit={handleSubmit}
          >
            {/* Progress bar */}
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${progressPercentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                ></div>
              </div>
            </div>

            {/* Section 1 */}
            {currentSection === 1 && (
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Add problems - Step 1
                </h2>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  <div className="col-span-1">
                    <label
                      htmlFor="problem_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Problem Name
                    </label>
                    <input
                      type="text"
                      name="problemName"
                      id="problem_name"
                      value={formData.problemName}
                      onChange={handleInputChange}
                      className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                      placeholder="Enter problem"
                    />
                  </div>
                  <div className="col-span-1">
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Category
                    </label>
                    <div className="flex items-center">
                      <select
                        id="category"
                        name="category"
                        autoComplete="category-name"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                      >
                        <option value="" disabled>
                          Select Category
                        </option>
                        {category.map((cat) => (
                          <option key={cat._id} value={cat.category_name}>
                            {cat.category_name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        Add Category
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                      placeholder="Enter problem description"
                    />
                  </div>
                  <div className="col-span-1">
                    <label
                      htmlFor="difficulty"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      autoComplete="difficulty-name"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                    >
                      <option value="" disabled>
                        Select Difficulty
                      </option>
                      {difficulty.map((diff) => (
                        <option key={diff} value={diff}>
                          {diff}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Section 2 */}
            {currentSection === 2 && (
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Add Test Cases - Step 2
                </h2>
                <div className="mt-6">
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-1">
                      <label
                        htmlFor="test_input"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Test Case
                      </label>
                      <input
                        type="text"
                        name="test_input"
                        value={inputTestCase}
                        onChange={handleTestCase}
                        id="test_input"
                        className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                        placeholder="Enter the test case"
                      />
                    </div>
                    <div className="col-span-1">
                      <label
                        htmlFor="expected_output"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Expected Output
                      </label>
                      <input
                        type="text"
                        name="expected_output"
                        value={expectedOutput}
                        onChange={handleExpectedOutput}
                        id="expected_output"
                        className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                        placeholder="Enter the expected output"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex justify-end space-x-4">
                      <button
                        onClick={(e) => addTestCase(e)}
                        className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl"
                      >
                        Add
                      </button>
                    </div>
                    {testCases.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Saved Test Cases
                        </h3>
                        {testCases.map((testCase, index) => (
                          <div
                            key={index}
                            className="mt-2 p-4 bg-gray-100 border border-gray-300 rounded-lg"
                          >
                            <p>
                              <strong>Test Case {index + 1}:</strong>{" "}
                              {testCase.input}
                            </p>
                            <p>
                              <strong>Expected Output:</strong>{" "}
                              {testCase.expectedOutput}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="col-span-1 sm:col-span-2 mt-6">
                      <label
                        htmlFor="source_code"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Source Code
                      </label>
                      <div className="w-full max-w-4xl p-4 border">
                        <Editor
                          height="50vh"
                          defaultLanguage="python"
                          value={formData.mainCode}
                          onChange={(value) =>
                            handleEditorChange(value, "mainCode")
                          }
                          theme="vs-dark"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex justify-end space-x-4">
                      <button
                        onClick={(e) => verifyTestCase(e)}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                      >
                        Verify Test
                      </button>
                    </div>
                  </div>
                  <div className="pt-5">
                    <div className="flex justify-between space-x-4">
                      <button
                        type="button"
                        onClick={handlePreviousSection}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring-blue-500 active:bg-blue-700 transition duration-150 ease-in-out"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSection}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentSection === 3 && (
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Add Constraints - Step 3
                </h2>
                <div className="col-span-1 sm:col-span-2 mt-6">
                  <label
                    htmlFor="source_code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Client side template
                  </label>
                  <div className="w-full max-w-4xl p-4 border">
                    <Editor
                      height="50vh"
                      defaultLanguage="python"
                      value={formData.clientTemplate}
                      onChange={(value) =>
                        handleEditorChange(value, "clientTemplate")
                      }
                      theme="vs-dark"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-1">
                      <label
                        htmlFor="problem_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Constraint
                      </label>
                      <input
                        type="text"
                        name="constraints"
                        id="constraints"
                        value={formData.constraints}
                        onChange={handleInputChange}
                        className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                        placeholder="Enter the constraints"
                      />
                    </div>
                    <div className="border border-gray-300 bg-gray-50 rounded-lg p-4 w-full mt-3">
                      <label
                        htmlFor="problem_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Premium
                      </label>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="isPremium"
                            name="premium"
                            onChange={handleInputChange}
                            value="true"
                            required
                          />
                          <label htmlFor="isPremium" className="ml-2">
                            True
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="notPremium"
                            onChange={handleInputChange}
                            name="premium"
                            value="false"
                            required
                          />
                          <label htmlFor="notPremium" className="ml-2">
                            False
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-5">
                    <div className="flex justify-between space-x-4">
                      <button
                        type="button"
                        onClick={handlePreviousSection}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring-blue-500 active:bg-blue-700 transition duration-150 ease-in-out"
                      >
                        Previous
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring-blue-500 active:bg-blue-700 transition duration-150 ease-in-out"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </SpinnerWrapper>
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default AddProblems;
