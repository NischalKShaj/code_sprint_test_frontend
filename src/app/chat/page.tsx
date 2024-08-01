"use client";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { io } from "socket.io-client";
import { AppState } from "../store";
import { useRouter } from "next/navigation";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import dotenv from "dotenv";
import Message from "@/components/chat/Message";
dotenv.config();

// Create socket instance
const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
  transports: ["websocket", "polling"],
});

interface User {
  _id: string;
  username: string;
  isOnline: boolean;
  profileImage: string;
}

interface ReceiverStatus {
  username: string | undefined;
  profileImage: string | undefined;
  isOnline: boolean | undefined;
}

const Chat = () => {
  const user = AppState((state) => state.user);
  const isAuthorized = AppState((state) => state.isAuthorized);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [receiverId, setReceiverId] = useState("");
  const [receiverStatus, setReceiverStatus] = useState<ReceiverStatus>({
    username: "",
    profileImage: "",
    isOnline: false,
  });
  const [chatArea, setChatArea] = useState(false);
  const router = useRouter();

  useLayoutEffect(() => {
    if (!isAuthorized) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthorized, router]);

  // for fetching the tutors/students details
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      const id = user?.id;

      // determining the endpoints according to the role
      const endpoint =
        user?.role === "student"
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/getTutors/${id}`
          : user?.role === "tutor"
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/getUsers/${id}`
          : "";

      try {
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        if (response.status === 202) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  // setting the receiver
  const handleReceiverClick = (
    id: string,
    username: string,
    profileImage: string,
    isOnline: boolean
  ) => {
    setChatArea(true);
    setReceiverId(id);
    setReceiverStatus({
      username: username,
      profileImage: profileImage,
      isOnline: isOnline,
    });
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
      <SpinnerWrapper>
        <div>
          <button
            data-drawer-target="default-sidebar"
            data-drawer-toggle="default-sidebar"
            aria-controls="default-sidebar"
            type="button"
            className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
          </button>

          <aside
            id="default-sidebar"
            className="absolute top-[250px] left-[50px] z-40 w-72  transition-transform -translate-x-full sm:translate-x-0"
            aria-label="Sidebar"
          >
            <div className=" px-3 py-4 rounded-lg items-center justify-center overflow-y-auto bg-[#D9D9D9] dark:bg-gray-800">
              <ul className="space-y-2 font-medium flex flex-col items-center">
                <li>
                  <div className="relative">
                    {user?.profileImage && (
                      <Image
                        className="w-24 h-24 rounded-full ring-4 dark:ring-gray-800 mt-[10px]"
                        width={100}
                        height={100}
                        src={user.profileImage}
                        alt="Profile Image"
                      />
                    )}
                    <span
                      className={`bottom-0 left-16 absolute w-3.5 h-3.5 ${
                        user?.isOnline === true ? "bg-green-400" : "bg-red-500"
                      } border-2 border-white dark:border-gray-800 rounded-full`}
                    ></span>
                  </div>
                </li>
                <li className="flex flex-col items-start mt-[10px]">
                  <div className="relative mt-[10px] flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 10a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-6 2-6 4v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1c0-2-2-4-6-4z" />
                    </svg>
                    <h3>{user?.username}</h3>
                  </div>
                  <div className="relative mt-[10px] flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 text-gray-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 5.08V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5.08M12 10l10-7H2l10 7zm0 0l-10 7a2 2 0 0 0 2.18 0L12 10z" />
                    </svg>
                    <p>{user?.email}</p>
                  </div>

                  <div className="relative mt-[10px] flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                    </svg>
                    <p>{user?.role}</p>
                  </div>
                </li>
                <li className="mt-">
                  <hr className="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 mb-[20px] rounded md:my-10 dark:bg-gray-700" />
                </li>
              </ul>
              <div className="text-center font-semibold">
                {user?.role === "student" ? (
                  <h4>Tutors</h4>
                ) : user?.role === "tutor" ? (
                  <h4>Subscribers</h4>
                ) : null}
              </div>
              <ul>
                {users.map((user) => (
                  <li
                    key={user._id}
                    className="flex items-center mt-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() =>
                      handleReceiverClick(
                        user._id,
                        user.username,
                        user.profileImage,
                        user.isOnline
                      )
                    }
                  >
                    <Image
                      className="w-10 h-10 rounded-full ring-4 dark:ring-gray-800"
                      width={40}
                      height={40}
                      src={user.profileImage}
                      alt="Profile Image"
                    />
                    <div className="ml-4 flex flex-col">
                      <span className="font-medium">{user.username}</span>
                      <span
                        className={`text-sm ${
                          user.isOnline ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {user.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
        <div
          className={`transition-transform duration-300 ${
            chatArea ? "w-[calc(100%-10rem)] ml-[18rem] mt-10" : "mt-10"
          } sm:ml-0`}
        >
          {chatArea && user?.id ? (
            <Message
              senderId={user.id}
              receiverId={receiverId}
              receiver={receiverStatus}
              socket={socket}
            />
          ) : (
            <div className="chat-placeholder w-[calc(100%-50rem)] mb-10 ml-[30rem] mt-10 h-[450px] flex items-center justify-center p-4 bg-gray-100 rounded-lg">
              <h3 className="text-center text-gray-500">Start conversation</h3>
            </div>
          )}
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default Chat;
