// file for signup
"use client";

// importing the required modules
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import React, { ChangeEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isValidUsername,
  isStrongPassword,
  validPhone,
} from "../../../utils/validation";
import Modal from "@/components/partials/Modal";

// Define the type for form data
interface FormData {
  username?: string;
  email?: string;
  role?: string;
  phone?: string;
  password?: string;
  interests?: string[];
}

const Signup = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormData>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const router = useRouter();
  const [message, setMessage] = useState("");

  // Function to handle the changing elements in the form
  const handleSignup: ChangeEventHandler<HTMLInputElement> = (e) => {
    const target = e.currentTarget;
    const { id, value, type } = target;
    let error = "";

    if (id === "username" && !isValidUsername(value)) {
      error = "Username should only contain alphabetic characters";
    } else if (id === "password" && !isStrongPassword(value)) {
      error =
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character";
    } else if (id === "phone" && !validPhone(value)) {
      error = "Phone number must be exactly 10 digits";
    }

    setErrors((prevErrors) => ({ ...prevErrors, [id]: error }));

    if (type === "radio") {
      setFormData((prevData) => ({ ...prevData, role: value }));
      localStorage.setItem("selectedRole", value);
      if (value === "student") {
        setShowModal(true);
      }
    } else {
      setFormData((prevData) => ({ ...prevData, [id]: value }));

      if (type === "email") {
        localStorage.setItem("email", value);
      }
    }
  };

  // function to handle the signup of the user
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check for validation errors before submitting
    if (Object.values(errors).some((error) => error !== "")) {
      setMessage("Please fix the errors before submitting");
      return;
    }

    const interests = JSON.parse(
      localStorage.getItem("selectedInterest") || "[]"
    );
    setFormData((prevData) => ({ ...prevData, interests }));

    console.log("base url", process.env.NEXT_PUBLIC_BASE_URL);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/signup`,
        { ...formData, interests }
      );
      if (response.status === 201) {
        localStorage.removeItem("selectedInterest");
        router.push("/otp");
      } else if (response.status === 409) {
        setMessage("User already exists");
      } else {
        setMessage("An unexpected error occurred");
      }
      console.log(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setMessage("User already exists");
      } else {
        setMessage("An error occurred during signup. Please try again.");
      }
      console.log("error", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center mb-24 bg-white mt-16 px-4 sm:px-0">
      <h3 className="text-2xl font-bold mb-6 text-center">
        Learn with Passion. Connect with Experts.
        <br /> Sign up today!
      </h3>
      {message && <p className="text-red-500 mt-4">{message}</p>}
      <section className="bg-[#D9D9D9] p-8 w-full max-w-[370px] rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="username"
            name="username"
            onChange={handleSignup}
            placeholder="username"
            className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
            required
          />
          {errors.username && (
            <p className="text-red-500 mt-1">{errors.username}</p>
          )}
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleSignup}
            placeholder="email"
            className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
            required
          />
          <div className="border border-gray-300 bg-gray-50 rounded-lg p-4 w-full mt-3">
            <div className="flex items-center mb-4">
              <input
                type="radio"
                id="student"
                onChange={handleSignup}
                name="role"
                value="student"
                required
              />
              <label htmlFor="student" className="ml-2">
                Student
              </label>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="radio"
                id="tutor"
                name="role"
                onChange={handleSignup}
                value="tutor"
                required
              />
              <label htmlFor="tutor" className="ml-2">
                Tutor
              </label>
            </div>
          </div>
          <input
            type="text"
            id="phone"
            name="phone"
            placeholder="phone"
            onChange={handleSignup}
            required
            className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
          />
          {errors.phone && <p className="text-red-500 mt-1">{errors.phone}</p>}
          <input
            type="password"
            id="password"
            name="password"
            placeholder="password"
            onChange={handleSignup}
            required
            className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
          />
          {errors.password && (
            <p className="text-red-500 mt-1">{errors.password}</p>
          )}
          <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl w-full mt-7">
            signup
          </button>
        </form>
      </section>
      <Modal showModal={showModal} onClose={closeModal} />
    </div>
  );
};

export default Signup;
