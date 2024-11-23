import React from "react";
import logo from "../assets/logo.svg"; // Adjust the path as needed

function Logo({ width = "150px" }) {
  return (
    <div className="flex justify-center items-center">
      <img src={logo} alt="Logo" width={width} height="auto " />
    </div>
  );
}

export default Logo;