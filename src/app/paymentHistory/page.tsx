// file to show the payment history of the user
"use client";

import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import dotenv from "dotenv";
import { AppState } from "../store";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import { useRouter } from "next/navigation";
dotenv.config();

interface PaymentData {
  _id: string;
  tutor: string;
  course_name: string;
  amount: number;
  date: Date;
  status: string;
}

const PaymentHistory = () => {
  const user = AppState((state) => state.user);
  const isAuthorized = AppState((state) => state.isAuthorized);
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthorized, router]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      const id = user?.id;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/payment-history/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          setPaymentData(response.data);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchData();
  }, [user?.id]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = paymentData.slice(indexOfFirstItem, indexOfLastItem);

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
        <div className="flex-1 ml-[10px] flex justify-center mt-[25px] px-4 sm:px-6">
          {loading ? (
            <div>Loading...</div>
          ) : paymentData && paymentData.length > 0 ? (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-[1000px]">
              <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3">
                      Tutor Name
                    </th>
                    <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3">
                      Course Name
                    </th>
                    <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3">
                      Subscribed On
                    </th>
                    <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((payment) => (
                    <tr
                      key={payment._id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="px-4 py-2 sm:px-6 sm:py-4">
                        {payment.tutor}
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-4">
                        {payment.course_name}
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-4">
                        {payment.amount}
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-4">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-4 text-green-500">
                        {payment.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
                  { length: Math.ceil(paymentData.length / itemsPerPage) },
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
                    currentPage === Math.ceil(paymentData.length / itemsPerPage)
                  }
                  className={`px-4 py-2 ${
                    currentPage === Math.ceil(paymentData.length / itemsPerPage)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  } rounded`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No payment history found</p>
          )}
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default PaymentHistory;
