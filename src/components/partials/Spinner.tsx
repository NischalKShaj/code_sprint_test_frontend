// components/Spinner.js

// file to show the spinner for the entire application

// importing the required module
import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

export default function Spinner() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <ClipLoader color={"#123abc"} loading={true} size={150} />
    </div>
  );
}
