// components/PayPalButton.tsx
import React, { FC } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: string;
  currency: string;
  onSuccess: (details: any) => void;
}

const PayPalButton: FC<PayPalButtonProps> = ({
  amount,
  currency,
  onSuccess,
}) => {
  const [{ isPending }] = usePayPalScriptReducer();

  return (
    <div>
      {isPending ? <div>Loading...</div> : null}
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          if (!actions || !actions.order) {
            console.error(
              "PayPal Buttons actions or actions.order is undefined"
            );
            return Promise.reject(
              "PayPal Buttons actions or actions.order is undefined"
            );
          }
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: currency,
                  value: amount,
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          if (!actions || !actions.order) {
            console.error(
              "PayPal Buttons actions or actions.order is undefined"
            );
            return Promise.reject(
              "PayPal Buttons actions or actions.order is undefined"
            );
          }
          const details = await actions.order.capture();
          onSuccess(details);
        }}
        onError={(err) => {
          console.error("PayPal Checkout onError", err);
          alert("An error occurred during the transaction.");
        }}
      />
    </div>
  );
};

export default PayPalButton;
