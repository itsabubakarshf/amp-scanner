import React from "react";
import { Navigate, Outlet } from "react-router";

function Protect({ element }) {
  const userProfileSession = localStorage.getItem("accessToken");
  if (userProfileSession=== null ) {
    return <Navigate to={"/login"} />;
  } else {
    return element;
  }
}

export default Protect;