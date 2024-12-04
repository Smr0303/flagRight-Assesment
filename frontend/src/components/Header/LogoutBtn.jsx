import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../../store/authSlice";
import axiosClient from "../utils/axios";

function LogoutBtn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    // Clear the token cookie by setting its expiration date to a past date
    const response = await axiosClient.post('/user/logout', {
      withCredentials: true,
    });

    if(response.status === 200){

    dispatch(logout());

    navigate('/');

    }

    else alert("Logout failed");

  };
  
  return (
    <button
      className="inline-bock px-6 py-2 duration-200 hover:bg-gray-200 rounded-full"
      onClick={logoutHandler}
    >
      Logout
    </button>
  );
}

export default LogoutBtn;
