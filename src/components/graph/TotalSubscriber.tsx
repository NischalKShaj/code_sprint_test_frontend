"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import dotenv from "dotenv";
import { AppState } from "@/app/store";
dotenv.config();

interface SubscriberData {
  label: string;
  count: number;
}

const TotalSubscriber: React.FC = () => {
  const router = useRouter();
  const [monthlyData, setMonthlyData] = useState<SubscriberData[]>([]);
  const [yearlyData, setYearlyData] = useState<SubscriberData[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [loading, setLoading] = useState(true);
  const user = AppState((state) => state.user);
  const id = user?.id;
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("admin_access_token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user/graph/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.status === 202) {
          const dataFromBackend = response.data;

          const transformedMonthlyData =
            countSubscribersByMonth(dataFromBackend);
          const transformedYearlyData = countSubscribersByYear(dataFromBackend);

          setMonthlyData(transformedMonthlyData);
          setYearlyData(transformedYearlyData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/error");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const countSubscribersByMonth = (data: any[]): SubscriberData[] => {
    const initialCounts: { [key: string]: number } = {
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
    };

    data.forEach((item) => {
      const date = new Date(item.year, item.month - 1);
      const monthLabel = date.toLocaleString("default", { month: "long" });
      if (initialCounts.hasOwnProperty(monthLabel)) {
        initialCounts[monthLabel] += 1;
      }
    });

    return Object.keys(initialCounts).map((label) => ({
      label,
      count: initialCounts[label],
    }));
  };

  const countSubscribersByYear = (data: any[]): SubscriberData[] => {
    const initialCounts: { [key: string]: number } = {};

    data.forEach((item) => {
      const year = item.year.toString();
      if (!initialCounts.hasOwnProperty(year)) {
        initialCounts[year] = 0;
      }
      initialCounts[year] += 1;
    });

    return Object.keys(initialCounts).map((year) => ({
      label: year,
      count: initialCounts[year],
    }));
  };

  const handleIntervalChange = (
    event: SelectChangeEvent<"monthly" | "yearly">
  ) => {
    setSelectedInterval(event.target.value as "monthly" | "yearly");
  };

  return (
    <div style={{ textAlign: "start", width: "100%" }}>
      <h2>Subscriber Chart</h2>
      <FormControl
        variant="outlined"
        style={{ marginBottom: "1rem", minWidth: 120 }}
      >
        <InputLabel id="interval-select-label">Interval</InputLabel>
        <Select
          labelId="interval-select-label"
          id="interval-select"
          value={selectedInterval}
          onChange={handleIntervalChange}
          label="Interval"
        >
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
        </Select>
      </FormControl>

      {!loading && selectedInterval === "monthly" && (
        <div style={{ width: "100%", height: "300px", maxWidth: "100%" }}>
          <BarChart
            series={[{ data: monthlyData.map((item) => item.count) }]}
            height={290}
            xAxis={[
              {
                data: monthlyData.map((item) => item.label),
                scaleType: "band",
              },
            ]}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </div>
      )}

      {!loading && selectedInterval === "yearly" && (
        <div style={{ width: "100%", height: "300px", maxWidth: "100%" }}>
          <BarChart
            series={[{ data: yearlyData.map((item) => item.count) }]}
            height={290}
            xAxis={[
              { data: yearlyData.map((item) => item.label), scaleType: "band" },
            ]}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </div>
      )}
    </div>
  );
};

export default TotalSubscriber;
