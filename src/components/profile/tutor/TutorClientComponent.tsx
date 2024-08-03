"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { AppState } from "@/app/store";
import UserSideBar from "@/components/partials/UserSideBar";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";

interface FormData {
  username: string;
  email: string;
  role: string;
  phone: string;
  profileImage: string; // URL for preview
}

interface TutorClientComponentProps {
  tutor: {
    id: string;
    username: string;
    email: string;
    role: string;
    phone: string;
    profileImage: string;
  };
}

const TutorClientComponent: React.FC<TutorClientComponentProps> = ({
  tutor,
}) => {
  const router = useRouter();
  const user = AppState((state) => state.user);
  const isLoggedIn = AppState((state) => state.isLoggedIn);
  const id = tutor.id; // Use tutor.id instead of user.id
  const isAuthorized = AppState((state) => state.isAuthorized);
  const [loading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    username: tutor.username || "",
    email: tutor.email || "",
    role: tutor.role || "tutor",
    phone: tutor.phone || "",
    profileImage: tutor.profileImage || "", // URL for preview
  });

  const [file, setFile] = useState<File | null>(null); // Actual File object

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthorized, router]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newProfileImage = e.target.files[0];
      setFile(newProfileImage); // Store the File object
      setFormData((prevFormData) => ({
        ...prevFormData,
        profileImage: URL.createObjectURL(newProfileImage), // URL for preview
      }));
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
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

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/profile/tutor/edit/${id}`,
        data, // Send FormData directly
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
          id: tutor.id,
          username: response.data.username,
          email: response.data.email,
          phone: response.data.phone,
          profileImage: response.data.profileImage,
          role: tutor.role,
          blocked: user?.blocked!,
          premium: user?.premium!,
          isOnline: user?.isOnline!,
        });

        router.push("/profile/tutor");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Failed to update profile",
        text: "An error occurred while updating your profile.",
        showConfirmButton: true,
      });
      router.push("/error");
    }
  };

  if (loading) {
    return (
      <SpinnerWrapper>
        <div>Loading...</div>
      </SpinnerWrapper>
    );
  }

  return (
    <div>
      <UserSideBar />
      <div className="flex flex-col items-center mb-24 bg-white mt-16 p-4">
        <section className="bg-[#D9D9D9] p-8 rounded-lg shadow-md w-full max-w-lg">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex justify-center">
              <Image
                className="w-24 h-24 rounded-full ring-4 dark:ring-gray-800 mt-[10px]"
                width={100}
                height={100}
                src={formData.profileImage || "/default-profile.png"}
                alt="profile image"
              />
            </div>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              onChange={handleFileChange}
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full"
              accept="image/*"
            />
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full"
            />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full"
            />
            <div className="border border-gray-300 bg-gray-50 rounded-lg p-4 w-full">
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
              className="p-4 bg-gray-50 border border-gray-300 rounded-lg w-full"
            />
            <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl w-full">
              Update
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default TutorClientComponent;
