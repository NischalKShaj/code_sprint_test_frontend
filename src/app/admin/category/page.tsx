"use client";

// importing the required modules
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
import { AppState } from "@/app/store";
dotenv.config();

interface Category {
  category_name: string;
  _id: string;
}

const Category = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 5;
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const isAdmin = AppState((state) => state.isAdmin);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    } else {
      setLoading(false);
    }
  }, [isAdmin, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("admin_access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/category`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          setCategories(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("error", error);
        router.push("/admin/error");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Calculate the index of the first and last category to display
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

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
        {categories && categories.length > 0 ? (
          <div className="relative mt-6 overflow-x-auto shadow-md sm:rounded-lg lg:w-[950px] lg:ml-[500px] mx-4 sm:mx-6">
            <table className="min-w-[950px] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Index
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category, index) => (
                  <tr
                    key={category._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4">
                      {indexOfFirstCategory + index + 1}
                    </td>
                    <td className="px-6 py-4">{category.category_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap justify-center mt-4 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white"
                } rounded`}
              >
                Previous
              </button>
              {Array.from(
                { length: Math.ceil(categories.length / categoriesPerPage) },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 ${
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
                  currentPage ===
                  Math.ceil(categories.length / categoriesPerPage)
                }
                className={`px-4 py-2 ${
                  currentPage ===
                  Math.ceil(categories.length / categoriesPerPage)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white"
                } rounded`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p>No categories found</p>
        )}
      </SpinnerWrapper>
    </div>
  );
};

export default Category;
