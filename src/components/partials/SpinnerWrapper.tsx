// SpinnerClientComponent.tsx
"use client";
import React, { useState, useEffect, ReactNode } from "react";
import Spinner from "./Spinner"; // Your spinner component

interface SpinnerWrapperProps {
  children: ReactNode;
}

const SpinnerWrapper: React.FC<SpinnerWrapperProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Set loading to false after 2 seconds

    // Cleanup function to clear the timer
    return () => {
      clearTimeout(timer);
    };
  }, []); // Run effect only once when component mounts

  // Show spinner if loading is true, otherwise show children components
  return loading ? <Spinner /> : <>{children}</>;
};

export default SpinnerWrapper;
