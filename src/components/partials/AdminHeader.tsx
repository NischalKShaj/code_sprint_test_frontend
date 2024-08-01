// admin header

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { AppState } from "@/app/store";
import dotenv from "dotenv";
import { usePathname, useRouter } from "next/navigation";
dotenv.config();

const AdminHeader = () => {
  const admin = AppState((state) => state.isAdmin);
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    // make it a skeleton
    return <div>Loading...</div>;
  }

  return (
    <>
      <header className="bg-[#F0E6E6] flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center">
          <Link href="/admin">
            <Image
              src="/image/test-removebg-preview.png"
              width={150} // Adjusted for smaller screens
              height={150} // Adjusted for smaller screens
              alt="logo"
            />
          </Link>
        </div>
        <div className="flex items-center space-x-4 md:space-x-8">
          {pathname === "/admin/banner" && (
            <Link href="/admin/banner/addBanner">
              <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl">
                Add Banner
              </button>
            </Link>
          )}
          {pathname === "/admin/category" && (
            <Link href="/admin/category/addCategory">
              <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl">
                Add Category
              </button>
            </Link>
          )}
          {pathname === "/admin/problem" && (
            <Link href="/admin/problem/addProblems">
              <button className="bg-[#686DE0] text-white font-bold py-2 px-4 rounded-xl">
                Add Problems
              </button>
            </Link>
          )}
        </div>
      </header>
    </>
  );
};

export default AdminHeader;
