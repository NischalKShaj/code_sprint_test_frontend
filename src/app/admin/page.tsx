// page to show the login page for the admin
"use client";

// importing the required modules
import React, {
  ChangeEventHandler,
  ReactEventHandler,
  useEffect,
  useState,
} from "react";
import { AppState } from "../store";
import dotenv from "dotenv";
dotenv.config();
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";

const AdminLogin = () => {
  // const isAdmin = AppState((state) => state.isAdmin);// for jwt purpose comment it now
  const isAdminLoggedIn = AppState((state) => state.isAdminLoggedIn);
  const isAdmin = AppState((state) => state.isAdmin);
  const router = useRouter();
  const [formData, setFormData] = useState<{ email: string; password: string }>(
    { email: "", password: "" }
  );

  // function to handle the changing form-data
  const login: ChangeEventHandler<HTMLInputElement> = (e) => {
    const target = e.currentTarget;
    setFormData({ ...formData, [target.id]: target.value });
  };

  // function for handling the login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin`,
        formData
      );
      if (response.status === 202) {
        const { token } = response.data;
        localStorage.setItem("admin_access_token", token);
        isAdminLoggedIn({ email: response.data.email });
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Login successful!",
          showConfirmButton: false,
          timer: 1700,
        });
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  // useEffect for the redirection if the user already present
  useEffect(() => {
    if (isAdmin) {
      router.push("/admin/dashboard");
    } else {
      router.push("/admin");
    }
  }, [isAdmin, router]);

  return (
    <div className="flex flex-col items-center mb-36 bg-white mt-16">
      <h3 className="text-2xl font-bold mb-6">Admin Panel Access</h3>
      <section className="bg-[#D9D9D9] p-8 h-[290px] w-[370px] rounded-lg shadow-md">
        <form onSubmit={handleLogin}>
          <input
            type="text"
            id="email"
            onChange={login}
            name="email"
            placeholder="email"
            className="p-4 bg-gray-50 border border-gray-300 rounded-lg  w-full mt-3"
            required
          />
          <input
            id="password"
            type="password"
            name="password"
            onChange={login}
            placeholder="password"
            className="p-4 bg-gray-50 border border-gray-300 rounded-lg  w-full mt-3"
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

export default AdminLogin;
