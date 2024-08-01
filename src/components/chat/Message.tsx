// component for showing the chat
"use client";

// importing the required modules
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Receiver {
  username: string | undefined;
  profileImage: string | undefined;
  isOnline: boolean | undefined;
}

interface MessageProps {
  senderId: string;
  receiverId: string;
  receiver: Receiver;
  socket: any;
}

interface Messages {
  _id: string;
  createdAt: string;
  message: string;
  senderId: string;
  receiverId: string;
  senderModel: string;
  receiverModel: string;
}

const Message = ({ senderId, receiverId, receiver, socket }: MessageProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Messages[]>([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle incoming messages and typing events
  useEffect(() => {
    socket.on("message", (message: Messages) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("typing", (data: { senderId: string; receiverId: string }) => {
      if (data.receiverId === senderId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1000);
      }
    });

    return () => {
      socket.off("message");
      socket.off("typing");
    };
  }, [socket, senderId]);

  // Fetch previous conversation between the sender and receiver
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/message/get-conversation/${senderId}/${receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          // Update messages state with the fetched conversation data
          const fetchedMessages = response.data.conversation.map(
            (msg: any) => ({
              _id: msg._id,
              createdAt: msg.createdAt,
              message: msg.message,
              senderId: msg.senderId,
              receiverId: msg.receiverId,
              senderModel: msg.senderModel,
              receiverModel: msg.receiverModel,
            })
          );
          setMessages(fetchedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      }
    };
    if (senderId && receiverId) {
      fetchData();
    }
  }, [receiverId, senderId]);

  // Scroll to the end of the message list when messages are updated
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message sending
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (message && senderId && receiverId) {
      const newMessage: Messages = {
        _id: "",
        createdAt: new Date().toISOString(),
        message,
        senderId,
        receiverId,
        senderModel: "student",
        receiverModel: "tutor",
      };
      socket.emit("sendMessage", newMessage);
      setMessage("");
    }
  };

  // Handle typing event
  const handleTyping = () => {
    socket.emit("typing", { senderId, receiverId });
  };

  return (
    <div className="flex justify-end w-full lg:ml-[250px]">
      <div className="chat-container w-full max-w-7xl mx-auto p-4 relative left-4">
        <div className="chat-header flex items-center p-4 bg-gray-200 rounded-lg">
          <div className="relative">
            <Image
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
              src={receiver.profileImage || ""}
              alt="Receiver Profile Image"
            />
            <span
              className={`bottom-0 left-7 absolute w-3.5 h-3.5 ${
                receiver.isOnline ? "bg-green-400" : "bg-red-500"
              } border-2 border-white dark:border-gray-800 rounded-full`}
            ></span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">{receiver.username}</h3>
            <span
              className={`text-sm ${
                receiver.isOnline ? "text-green-500" : "text-red-500"
              }`}
            >
              {receiver.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <div className="chat-messages h-96 overflow-y-auto p-4 bg-gray-100 rounded-lg mt-2">
          <ul className="space-y-2">
            {messages.length === 0 ? (
              <li className="text-center text-gray-500">Start conversation</li>
            ) : (
              messages.map((msg) => (
                <li
                  key={msg._id}
                  className={`flex ${
                    msg.senderId === senderId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`message p-2 rounded-lg max-w-xs break-words ${
                      msg.senderId === senderId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <span className="text-xs text-black">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </li>
              ))
            )}
            {typing && (
              <li className="flex justify-start">
                <div className="message bg-gray-500 text-white p-2 rounded-lg max-w-xs break-words">
                  <p>Typing...</p>
                </div>
              </li>
            )}
          </ul>
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSubmit}
          className="chat-input flex items-center p-4 bg-white rounded-lg mt-2"
        >
          <input
            type="text"
            value={message}
            placeholder="Your message"
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={handleTyping}
            className="flex-grow p-2 border rounded-lg focus:outline-none"
          />
          <button
            type="submit"
            className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Message;
