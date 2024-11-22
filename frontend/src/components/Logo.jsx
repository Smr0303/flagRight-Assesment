import React from "react";

function Logo({ width = "100px" }) {
  return (
    <div className=" text-blue-900 font-bold text-lg">
      Flag<span className=" text-orange-600">Right</span>
    </div>
  );
}

export default Logo;
