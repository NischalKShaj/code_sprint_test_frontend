// file to show the top 3 submitted questions

// importing the required modules
import axios from "axios";
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface Problem {
  title: string;
  count: number;
}

const ProblemGraph = () => {
  const [problemData, setProblemData] = useState<Problem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("admin_access_token");
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
          console.log("first", response.data.totalSolvedProblem);
          setProblemData(response.data.totalSolvedProblem);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ textAlign: "start", width: "100%" }}>
      <h2>Most Submitted Problem</h2>
      <div style={{ width: "100%", height: "400px", maxWidth: "100%" }}>
        <BarChart
          width={600}
          height={400}
          data={problemData}
          margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
        >
          <XAxis dataKey="title" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#069686" />
        </BarChart>
      </div>
    </div>
  );
};

export default ProblemGraph;
