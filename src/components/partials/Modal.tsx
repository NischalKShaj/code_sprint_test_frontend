// file for showing the modal during signup
"use client";

// Importing the required modules
import axios from "axios";
import React, { useEffect, useState } from "react";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
dotenv.config();

// Define the type for ModalProps and Category
interface ModalProps {
  showModal: boolean;
  onClose: () => void;
}

interface Category {
  _id: string;
  category_name: string;
}

const Modal: React.FC<ModalProps> = ({ showModal, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/modal/category`
        );
        if (response.status === 202) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("error", error);
        router.push("/error");
      }
    };
    fetchData();
  }, []);

  if (!showModal) {
    return null;
  }

  const handleCheckboxChange = (categoryId: string) => {
    setSelectedCategories((prevSelectedCategories) =>
      prevSelectedCategories.includes(categoryId)
        ? prevSelectedCategories.filter((id) => id !== categoryId)
        : [...prevSelectedCategories, categoryId]
    );
  };

  const handleAccept = () => {
    console.log("Selected categories:", selectedCategories);
    localStorage.setItem(
      "selectedInterest",
      JSON.stringify(selectedCategories)
    );
    onClose();
  };

  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select your interests
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={onClose}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="p-4 md:p-5 space-y-4">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Please select the categories you are interested in:
            </p>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={category._id}
                    value={category._id}
                    onChange={() => handleCheckboxChange(category._id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor={category._id}
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    {category.category_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              type="button"
              className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                selectedCategories.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              }`}
              onClick={handleAccept}
              disabled={selectedCategories.length === 0}
            >
              I accept
            </button>
            <button
              type="button"
              className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={onClose}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
