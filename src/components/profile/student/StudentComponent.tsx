// src/components/StudentClientComponent.tsx

"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { AppState } from "@/app/store";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";

interface StudentClientComponentProps {
  student: {
    id: string;
    username: string;
    email: string;
    role: string;
    phone: string;
    profileImage: string;
  };
}

const StudentClientComponent = ({ student }: StudentClientComponentProps) => {
  const router = useRouter();
  const isLoggedIn = AppState((state) => state.isLoggedIn);
  const isAuthenticated = AppState((state) => state.isAuthorized);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState({
    username: student.username,
    email: student.email,
    role: student.role,
    phone: student.phone,
    profileImage: student.profileImage,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newProfileImage = e.target.files[0];
      setFile(newProfileImage);
      setFormData({
        ...formData,
        profileImage: URL.createObjectURL(newProfileImage),
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    if (file) {
      data.append("profileImage", file);
    }

    const token = localStorage.getItem("access_token");

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/profile/edit/${student.id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 202) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Profile updated successfully!",
          showConfirmButton: false,
          timer: 1700,
        });

        isLoggedIn({
          id: student.id,
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone,
          profileImage: response.data.profileImage,
          role: response.data.role,
          blocked: response.data.blocked,
          isOnline: response.data.isOnline,
          premium: response.data.premium,
        });

        router.push("/profile/student");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      router.push("/error");
    }
  };

  if (loading) {
    return <SpinnerWrapper>loading</SpinnerWrapper>;
  }

  return (
    <div>
      <SpinnerWrapper>
        <div className="flex flex-col items-center mb-24 bg-white mt-16 px-4 lg:px-8">
          <section className="bg-[#D9D9D9] p-8 rounded-lg shadow-md max-w-md w-full">
            <form onSubmit={handleUpdate}>
              <div className="flex justify-center mb-4">
                <Image
                  className="w-24 h-24 rounded-full ring-4 dark:ring-gray-800"
                  width={100}
                  height={100}
                  src={formData.profileImage || ""}
                  alt="profile image"
                />
              </div>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                onChange={handleFileChange}
                className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
                accept="image/*"
              />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
              />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
              />
              <div className="border border-gray-300 bg-gray-50 rounded-lg p-4 w-full mt-3">
                <div className="flex items-center mb-4">
                  <span className="mr-2">Role:</span>
                  <span className="font-normal">
                    {formData.role.charAt(0).toUpperCase() +
                      formData.role.slice(1)}
                  </span>
                </div>
              </div>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full mt-3"
              />
              <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl w-full mt-7">
                Update
              </button>
            </form>
          </section>
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default StudentClientComponent;
