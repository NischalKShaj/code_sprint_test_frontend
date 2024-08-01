// file to filter the course price
"use client";

// importing the required modules
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CourseState } from "@/app/store/courseStore";

const FilterCourse: React.FC = () => {
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(
    null
  );
  const findAllCourse = CourseState((state) => state.findAllCourse);
  const router = useRouter();

  const handleFilter = async () => {
    try {
      let minPrice = 0;
      let maxPrice = 0;

      switch (selectedPriceRange) {
        case "299-499":
          minPrice = 299;
          maxPrice = 499;
          break;
        case "699-999":
          minPrice = 699;
          maxPrice = 999;
          break;
        case "1200 above":
          minPrice = 1200;
          maxPrice = Infinity; // No upper limit
          break;
        default:
          return;
      }

      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/courses`,
        {
          params: {
            minPrice,
            maxPrice,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const transformedCourses = response.data.map((course: any) => ({
          _id: course._id,
          course_name: course.course_name,
          description: course.description,
          course_category: course.course_category,
          videos: course.videos,
          price: course.price,
        }));
        findAllCourse(transformedCourses);
      } else if (response.status === 500) {
        router.push("/error");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("error filtering courses", error);
      if (error.response && error.response.status === 401) {
        router.push("/login");
      } else {
        router.push("/error");
      }
    }
  };

  return (
    <div className="absolute top-[300px] left-[50px] z-40 w-72">
      <ul className="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
          <div className="flex items-center ps-3">
            <input
              type="radio"
              id="price-range-1"
              value="299-499"
              name="price-range"
              onChange={() => setSelectedPriceRange("299-499")}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
            />
            <label
              htmlFor="price-range-1"
              className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              299-499
            </label>
          </div>
        </li>
        <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
          <div className="flex items-center ps-3">
            <input
              type="radio"
              id="price-range-2"
              value="699-999"
              name="price-range"
              onChange={() => setSelectedPriceRange("699-999")}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
            />
            <label
              htmlFor="price-range-2"
              className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              699-999
            </label>
          </div>
        </li>
        <li className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
          <div className="flex items-center ps-3">
            <input
              type="radio"
              id="price-range-3"
              value="1200 above"
              name="price-range"
              onChange={() => setSelectedPriceRange("1200 above")}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
            />
            <label
              htmlFor="price-range-3"
              className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              1200 above
            </label>
          </div>
        </li>
        <div className="flex justify-center items-center">
          <button
            onClick={handleFilter}
            className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl"
          >
            Check
          </button>
        </div>
      </ul>
    </div>
  );
};

export default FilterCourse;
