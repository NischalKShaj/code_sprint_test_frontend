// file for user profile editing
"use client";

// importing the required modules
import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { AppState } from "@/app/store";
import UserSideBar from "@/components/partials/UserSideBar";
import dotenv from "dotenv";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
dotenv.config();

const StudentId = () => {
  const router = useRouter();
  const user = AppState((state) => state.user);
  const isLoggedIn = AppState((state) => state.isLoggedIn);
  const isAuthenticated = AppState((state) => state.isAuthorized);
  const [loading, setLoading] = useState(true);
  const id = user?.id;

  useLayoutEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  // Initialize form state
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "student",
    phone: user?.phone || "",
    profileImage: user?.profileImage || "", // URL for preview
  });
  const [file, setFile] = useState<File | null>(null); // Actual File object

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newProfileImage = e.target.files[0];
      setFile(newProfileImage); // Store the File object
      setFormData({
        ...formData,
        profileImage: URL.createObjectURL(newProfileImage), // URL for preview
      });
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    if (file) {
      data.append("profileImage", file); // Append the File object, not URL
    }

    const token = localStorage.getItem("access_token");

    console.log("data", data);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/profile/edit/${id}`,
        data, // Send FormData directly
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("response", response.data);

      if (response.status === 202) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Profile updated successfully!",
          showConfirmButton: false,
          timer: 1700,
        });

        isLoggedIn({
          id: user?.id!,
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone,
          profileImage: response.data.profileImage,
          role: user?.role!,
          blocked: user?.blocked!,
          premium: user?.premium!,
          isOnline: user?.isOnline!,
        });

        router.push("/profile/student");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      router.push("/error");
    }
  };

  if (loading) {
    // eslint-disable-next-line react/no-children-prop
    return <SpinnerWrapper children={undefined} />;
  }

  return (
    <div>
      <SpinnerWrapper>
        <UserSideBar />
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

export default StudentId;
