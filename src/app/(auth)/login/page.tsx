// ================== file to show the login page for the application =================== //
"use client";

// importing the required modules
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import { AppState } from "@/app/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Swal from "sweetalert2";

const Login = () => {
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<{ email: string; password: string }>(
    { email: "", password: "" }
  );
  const router = useRouter();
  const login = AppState((state) => state.isLoggedIn);
  const authorized = AppState((state) => state.isAuthorized);

  // function for the changing value in the form
  const handleLogin: ChangeEventHandler<HTMLInputElement> = (e) => {
    const target = e.currentTarget;

    setFormData({ ...formData, [target.id]: target.value });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");

    if (token && user) {
      localStorage.setItem("access_token", token);
      const userData = JSON.parse(decodeURIComponent(user));

      login({
        id: userData._id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        profileImage: userData.profileImage,
        blocked: userData.blocked,
        phone: userData.phone,
        premium: userData.premium,
        isOnline: userData.isOnline,
      });

      router.push("/");
    }
  }, []);

  // function for google auth
  const handlePassport = () => {
    window.open(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/google/callback`);
  };

  // function for passing the data from the frontend to the backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
        formData,
        { withCredentials: true }
      );
      const { role, token, data } = response.data;

      if (response.status === 202) {
        localStorage.setItem("access_token", token);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Login successful!",
          showConfirmButton: false,
          timer: 1700,
        });
        login({
          id: data._id,
          email: data.email,
          role: data.role,
          username: data.username,
          profileImage: data.profileImage,
          blocked: data.blocked,
          phone: data.phone,
          premium: data.premium,
          isOnline: data.isOnline,
        });
        router.push("/");
      } else if (response.status === 500) {
        router.push("/error");
      } else {
        setMessage("invalid user details");
      }
    } catch (error) {
      setMessage("invalid user details");
    }
  };

  // use effect to check the user is authenticated or not
  useEffect(() => {
    if (authorized) {
      router.push("/");
    }
  }, [authorized]);

  return (
    <div className="flex flex-col items-center mb-36 bg-white mt-16">
      <h3 className="text-2xl font-bold mb-6">
        Login to your CodeSprint account
      </h3>
      {message && <p className="text-red-500 mt-4">{message}</p>}
      <section className="bg-[#D9D9D9] p-8 h-full w-full max-w-[370px] rounded-lg shadow-md">
        <button
          onClick={() => handlePassport()}
          className="p-4 bg-gray-50 border test border-gray-300 rounded-lg w-full mt-3"
        >
          <FontAwesomeIcon className="mr-5" icon={faGoogle} />
          continue with google
        </button>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            id="email"
            placeholder="email"
            className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
            onChange={handleLogin}
            required
          />
          <input
            type="password"
            id="password"
            placeholder="password"
            className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
            onChange={handleLogin}
            required
          />
          <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl w-full mt-7">
            Login
          </button>
        </form>
      </section>
    </div>
  );
};

export default Login;
