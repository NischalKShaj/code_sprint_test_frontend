// page to show the dashboard for the admin
"use client";
// importing the required modules
import AdminSidePanel from "@/components/partials/AdminSidePanel";
import BarGraph from "@/components/graph/UserBarGraph";
import SpinnerWrapper from "@/components/partials/SpinnerWrapper";
import React, { useLayoutEffect, useState } from "react";
import TutorBarGraph from "@/components/graph/TutorBarGraph";
import { AppState } from "@/app/store";
import { useRouter } from "next/navigation";
import CourseBarGraph from "@/components/graph/CourseBarGraph";
import ProblemGraph from "@/components/graph/ProblemGraph";

const AdminDashboard = () => {
  const isAdmin = AppState((state) => state.isAdmin);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    } else {
      setLoading(false);
    }
  }, [isAdmin, router]);

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
        <AdminSidePanel />
        <div className="flex flex-wrap mt-[50px]  mx-4 lg:mx-[150px] gap-4">
          <div className="flex-1 min-w-[300px]  ml-[350px] mr-[150px] lg:min-w-[350px]">
            <BarGraph />
          </div>
          <div className="flex-1 min-w-[300px] lg:min-w-[350px]">
            <TutorBarGraph />
          </div>
        </div>
        <div className="flex flex-wrap mt-[50px]  mx-4 lg:mx-[150px] gap-4">
          <div className="flex-1 min-w-[300px]  ml-[350px] mr-[150px] lg:min-w-[350px]">
            <CourseBarGraph />
          </div>
          <div className="flex-1 min-w-[300px] lg:min-w-[350px]">
            <ProblemGraph />
          </div>
        </div>
      </SpinnerWrapper>
    </div>
  );
};

export default AdminDashboard;
