import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.admin_access_token;
  console.log("Token:", token);

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/banner/${req.query.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    if (response.status === 202) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Banner not found" });
    }
  } catch (error) {
    console.error("Error fetching banner data:", error);
    res.status(500).json({ message: "Error fetching banner data" });
  }
}
