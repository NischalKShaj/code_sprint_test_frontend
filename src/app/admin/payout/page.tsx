"use client";

// importing all the required modules for the file
import { AppState } from "@/app/store";
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import Swal from "sweetalert2";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import dotenv from "dotenv";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
dotenv.config();

// Interface for payout
interface Payment {
  tutor_name: string;
  tutor_email: string;
  wallet: string;
  status: boolean;
  _id: string;
}

const PayoutPage = () => {
  const [loading, setLoading] = useState(true);
  const [payoutData, setPayoutData] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const payoutsPerPage = 5;
  const router = useRouter();
  const isAdmin = AppState((state) => state.isAdmin);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    } else {
      setLoading(false);
    }
  }, [isAdmin, router]);

  // Fetching the data from the database
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("admin_access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/payout-request`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          const combinedData: Payment[] = response.data.payouts.map(
            (payout: any) => {
              const tutor = response.data.tutorData.find(
                (tutor: any) => tutor._id === payout.tutor
              );
              return {
                tutor_name: tutor?.username || "Unknown",
                tutor_email: tutor?.email || "Unknown",
                wallet: payout.wallet,
                status: payout.status,
                _id: payout._id,
              };
            }
          );
          setPayoutData(combinedData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Function to make the payment to the tutor
  const handlePay = async (payment: Payment) => {
    const result = await Swal.fire({
      position: "center",
      icon: "question",
      title: "Make payment?",
      text: `Send $${payment.wallet} to ${payment.tutor_name}`,
      confirmButtonText: "OK",
    });
    if (result.isConfirmed) {
      setCurrentPayment(payment);
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    try {
      const token = localStorage.getItem("admin_access_token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/update-payout-status`,
        {
          id: currentPayment?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Payment Successful",
          text: `Payment of $${currentPayment?.wallet} to ${currentPayment?.tutor_name} was successful!`,
          confirmButtonText: "OK",
        });

        // Update the payment status and amount in the state
        setPayoutData((prevData) =>
          prevData.map((payment) =>
            payment._id === currentPayment?._id
              ? { ...payment, status: true, wallet: "0" }
              : payment
          )
        );

        // Reset current payment
        setCurrentPayment(null);
      } else {
        throw new Error("Failed to update the payment status in the backend");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Payment Failed",
        text: "There was an error updating the payment status. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  // Pagination logic
  const indexOfLastPayment = currentPage * payoutsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - payoutsPerPage;
  const currentPayouts = payoutData.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );

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
        <div className="flex-1 ml-[220px] flex justify-center mt-[25px] px-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="relative items-center justify-center overflow-x-auto shadow-md sm:rounded-lg">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="p-4">
                        Index
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Amount to be paid
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Payment Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayouts.map((payment, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <td className="w-4 p-4 text-base font-semibold">
                          {(currentPage - 1) * payoutsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 text-base font-semibold">
                          {payment.tutor_name}
                        </td>
                        <td className="px-6 py-4 text-base font-semibold">
                          {payment.tutor_email}
                        </td>
                        <td className="px-6 py-4 text-base font-semibold">
                          {payment.wallet}
                        </td>
                        <td className="px-6 py-4 text-base font-semibold text-center">
                          {payment.wallet !== "0" ? (
                            <button
                              onClick={() => handlePay(payment)}
                              className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl"
                            >
                              Pay
                            </button>
                          ) : (
                            <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl">
                              Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination buttons */}
              <div className="flex justify-center mt-4 flex-wrap gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 mx-1 ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  } rounded`}
                >
                  Previous
                </button>
                {Array.from(
                  { length: Math.ceil(payoutData.length / payoutsPerPage) },
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 mx-1 ${
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
                    currentPage ===
                    Math.ceil(payoutData.length / payoutsPerPage)
                  }
                  className={`px-4 py-2 mx-1 ${
                    currentPage ===
                    Math.ceil(payoutData.length / payoutsPerPage)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 text-white"
                  } rounded`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </SpinnerWrapper>
      {/* PayPal buttons for payment */}
      {currentPayment && (
        <PayPalScriptProvider
          options={{ clientId: `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}` }}
        >
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          currency_code: "USD", // Specify the currency code here
                          value: currentPayment.wallet,
                        },
                      },
                    ],
                    intent: "CAPTURE", // Specify the intent here
                  });
                }}
                onApprove={(data, actions) => {
                  if (actions.order) {
                    return actions.order.capture().then((details) => {
                      handlePaymentSuccess(details);
                    });
                  } else {
                    Swal.fire({
                      position: "center",
                      icon: "error",
                      title: "Payment Error",
                      text: "There was an issue capturing the order. Please try again.",
                      confirmButtonText: "OK",
                    });
                    return Promise.reject(new Error("Order capture failed"));
                  }
                }}
                onCancel={() => setCurrentPayment(null)}
                onError={(err) => {
                  console.error("PayPal error", err);
                  Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Payment Failed",
                    text: "There was an error processing your payment. Please try again.",
                    confirmButtonText: "OK",
                  });
                }}
              />
            </div>
          </div>
        </PayPalScriptProvider>
      )}
    </div>
  );
};

export default PayoutPage;
