"use client";

// importing the required modules
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppState } from "@/app/store";
import Swal from "sweetalert2";
dotenv.config();

interface Banner {
  _id: string;
  name: string;
  description: string;
  bannerImage: string;
}

const Banner = () => {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const bannersPerPage = 5;
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
        const response = await axios.get<Banner[]>(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/banner`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setBanners(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("error", error);
        router.push("/admin/error");
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleEdit = (bannerId: string) => {
    router.push(`/admin/banner/${bannerId}`);
  };

  const handleDelete = async (id: string) => {
    console.log(`Deleting banner with ID: ${id}`);
    const token = localStorage.getItem("admin_access_token");
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/banner/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === 202) {
        setBanners((prevBanners) =>
          prevBanners.filter((banner) => banner._id !== id)
        );
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Banner Deleted Successfully",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  // Pagination logic
  const indexOfLastBanner = currentPage * bannersPerPage;
  const indexOfFirstBanner = indexOfLastBanner - bannersPerPage;
  const currentBanners = banners.slice(indexOfFirstBanner, indexOfLastBanner);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
        <div className="flex-1 ml-[220px] flex justify-center mt-[25px] px-4 sm:px-6">
          {loading ? (
            <div>Loading...</div>
          ) : banners && banners.length > 0 ? (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-[1100px]">
              {/* <div className="w-[1000px]"> */}
              {/* Container for fixed width */}
              <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3">
                      Banner Image
                    </th>
                    <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentBanners.map((banner) => (
                    <tr
                      key={banner._id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="px-4 py-2 sm:px-6 sm:py-4">
                        {banner.name}
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-4">
                        {banner.description}
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-4">
                        <Image
                          width={150}
                          height={100}
                          src={banner.bannerImage}
                          alt={banner.name}
                          className="object-cover rounded-lg shadow-md"
                        />
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-4 flex justify-center gap-2">
                        <button
                          className="font-bold py-1 px-2 sm:py-2 sm:px-4 rounded-xl bg-green-600 text-white"
                          onClick={() => handleEdit(banner._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="font-bold py-1 px-2 sm:py-2 sm:px-4 rounded-xl bg-red-600 text-white"
                          onClick={() => handleDelete(banner._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* </div> */}
              {/* Pagination buttons */}
              <div className="flex flex-wrap justify-center mt-4 gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
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
                  { length: Math.ceil(banners.length / bannersPerPage) },
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
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
                  onClick={() => paginate(currentPage + 1)}
                  disabled={
                    currentPage === Math.ceil(banners.length / bannersPerPage)
                  }
                  className={`px-4 py-2 ${
                    currentPage === Math.ceil(banners.length / bannersPerPage)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  } rounded`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No banners found</p>
          )}
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default Banner;
