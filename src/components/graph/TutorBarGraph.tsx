"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const TutorBarGraph = () => {
  const router = useRouter();
  const [monthlyTutorCounts, setMonthlyTutorCounts] = useState<number[]>([]);
  const [yearlyTutorCounts, setYearlyTutorCounts] = useState<number[]>([]);
  const [totalTutorCount, setTotalTutorCount] = useState(0);
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  });
  const [yearlyCounts, setYearlyCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [view, setView] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/graphs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 202) {
          const tutorGraphs: string[] = response.data.tutorGraphs || [];
          const monthlyCounts = countTutorsByMonth(tutorGraphs);
          const yearlyCounts = countTutorsByYear(tutorGraphs);
          setCounts(monthlyCounts);
          setYearlyCounts(yearlyCounts);
          setMonthlyTutorCounts(Object.values(monthlyCounts));
          setYearlyTutorCounts(Object.values(yearlyCounts));
          setTotalTutorCount(tutorGraphs.length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/admin/error");
      }
    };

    if (token) {
      fetchData();
    }
  }, [router]);

  // Function to count tutors by month
  const countTutorsByMonth = (tutorDates: string[]) => {
    const initialCounts = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    } as { [key: string]: number };

    tutorDates.forEach((dateString) => {
      const date = new Date(dateString);
      const month = date.toLocaleString("default", { month: "long" });

      if (initialCounts.hasOwnProperty(month)) {
        initialCounts[month]++;
      }
    });

    return initialCounts;
  };

  // Function to count tutors by year
  const countTutorsByYear = (tutorDates: string[]) => {
    const yearlyCounts: { [key: string]: number } = {};

    tutorDates.forEach((dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear().toString();

      if (!yearlyCounts.hasOwnProperty(year)) {
        yearlyCounts[year] = 0;
      }
      yearlyCounts[year]++;
    });

    return yearlyCounts;
  };

  const xAxisLabels = Object.keys(counts);
  const xAxisLabelsYearly = Object.keys(yearlyCounts);

  return (
    <div style={{ textAlign: "start", width: "100%" }}>
      <h2>Total Tutors: {totalTutorCount}</h2>
      <div style={{ margin: "20px 0" }}>
        <button
          onClick={() => setView("monthly")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: view === "monthly" ? "#686DE0" : "#D9D9D9",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Monthly
        </button>
        <button
          onClick={() => setView("yearly")}
          style={{
            padding: "10px 20px",
            backgroundColor: view === "yearly" ? "#686DE0" : "#D9D9D9",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Yearly
        </button>
      </div>
      {view === "monthly" ? (
        <div style={{ width: "100%", height: "400px", maxWidth: "100%" }}>
          <BarChart
            series={[{ data: monthlyTutorCounts }]}
            height={290}
            xAxis={[{ data: xAxisLabels, scaleType: "band" }]}
            margin={{ top: 10, bottom: 30, left: 50, right: 10 }}
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: "400px", maxWidth: "100%" }}>
          <BarChart
            series={[{ data: yearlyTutorCounts }]}
            height={290}
            xAxis={[{ data: xAxisLabelsYearly, scaleType: "band" }]}
            margin={{ top: 10, bottom: 30, left: 50, right: 10 }}
          />
        </div>
      )}
    </div>
  );
};

export default TutorBarGraph;
