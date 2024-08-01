// page for the otp verification
"use client";
import axios from "axios";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
dotenv.config();

const OTP = () => {
  const [otp, setOtp] = useState({});
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  // adding the otp to the state
  const handleValue: ChangeEventHandler<HTMLInputElement> = (e) => {
    const target = e.currentTarget;
    setOtp({ ...otp, [target.id]: target.value });
  };

  // function for passing the otp to the backend
  const handleOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const selectedRole = localStorage.getItem("selectedRole");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/otp`,
        { ...otp, selectedRole }
      );
      if (response.status === 201) {
        localStorage.removeItem("selectedRole");
        localStorage.removeItem("email");
        console.log(response.data);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Signup successful!",
          showConfirmButton: false,
          timer: 1700,
        });
        router.push("/login");
      } else {
        setMessage("invalid otp");
      }
    } catch (error) {
      setMessage("invalid otp");
      console.log("error", error);
    }
  };

  // Function for handling the otp resend functionality
  const handleResend = async () => {
    try {
      const email = localStorage.getItem("email");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/otp/resend`,
        { email }
      );

      console.log(response.data);
      setTimer(60);
      setIsResending(false);
    } catch (error) {
      console.error("error", error);
    }
  };

  // Implementing timer for the otp resending option
  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (timer === 0 && !isResending) {
      setIsResending(true);
      handleResend();
    }
  }, [timer, isResending]);

  return (
    <div className="flex flex-col items-center mb-36 bg-white mt-16 px-4 sm:px-0">
      <section className="bg-gray-100 p-8 h-auto sm:h-[400px] w-full max-w-[400px] rounded-3xl shadow-md">
        <h3 className="text-center text-2xl font-bold mb-6">
          OTP Verification
        </h3>
        <p className="text-sm text-red-500 mb-6">
          {timer > 0
            ? `Resend in ${timer} seconds`
            : `New OTP has been sent to the mail`}
        </p>

        <div className="mb-6">
          {message && <p className="text-sm text-red-500">{message}</p>}
          <form onSubmit={handleOtp}>
            <label
              htmlFor="email"
              className="text-gray-700 text-center font-bold mb-2 block"
            >
              Please enter the OTP sent to your email
            </label>
            <div className="mt-11 flex justify-between space-x-2 sm:space-x-4">
              <input
                type="text"
                id="otp1"
                onChange={handleValue}
                maxLength={1}
                required
                className="w-1/6 p-3 rounded-lg bg-gray-200 border border-gray-300 outline-none focus:border-indigo-500 text-center"
              />
              <input
                type="text"
                id="otp2"
                onChange={handleValue}
                maxLength={1}
                required
                className="w-1/6 p-3 rounded-lg bg-gray-200 border border-gray-300 outline-none focus:border-indigo-500 text-center"
              />
              <input
                type="text"
                id="otp3"
                onChange={handleValue}
                required
                maxLength={1}
                className="w-1/6 p-3 rounded-lg bg-gray-200 border border-gray-300 outline-none focus:border-indigo-500 text-center"
              />
              <input
                type="text"
                id="otp4"
                onChange={handleValue}
                maxLength={1}
                required
                className="w-1/6 p-3 rounded-lg bg-gray-200 border border-gray-300 outline-none focus:border-indigo-500 text-center"
              />
            </div>
            <div className="mt-16 flex justify-center items-center">
              <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">
                Verify
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default OTP;
