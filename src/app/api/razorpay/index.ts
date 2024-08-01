// file to integrate razorpay

// importing the required modules

import { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { amount } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: parseInt(amount, 10) * 100,
      currency: "INR", // Adjust currency as per your requirements
      receipt: "order_rcptid_11", // Example receipt ID
    };

    try {
      const order = await razorpay.orders.create(options);
      res.status(200).json(order);
    } catch (error: AxiosError | any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
