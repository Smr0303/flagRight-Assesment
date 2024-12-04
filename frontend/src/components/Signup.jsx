import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Logo } from "./index.js";
import Dropdown from "./Dropdown.jsx";
import { useForm } from "react-hook-form";
import axiosClient from "./utils/axios.js";

function Signup() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const { register, handleSubmit } = useForm();

  const registerUser = async (data) => {
    setError("");

    try {

      const userObj = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: Number(data.role),
      };

      const response = await axiosClient.post("/user/registerUser", userObj, {
        withCredentials: true,
      });

      if (response.status === 200) {

        alert("User registered succesfully");
        navigate("/login");

      }

    }
    catch (err) {
      console.error(err);

      let errorMessage = "An unexpected error occurred. Please try again later.";

      if (err.response) {

        const { status } = err;
        const { data } = err.response;

        switch (status) {
          case 400:
            errorMessage = "Invalid or missing fields.";
            break;
          case 401:
            if (data.message.includes("Please")) {
              errorMessage = "You are not logged in.";
            } else if (data.message.includes("User")) {
              errorMessage = "You don't have admin rights.";
            }
            break;
          case 500:
            errorMessage = "Internal server error. Please try again.";
            break;
          case 403:
            errorMessage = "You are not authorized to perform this action.";
            break;
          default:
            if (data && data.message) {
              errorMessage = data.message;
            } else {
              errorMessage = `Error: ${status} - ${err.response.statusText}`;
            }
            break;
        }
      }

      else if (err.request) {
        errorMessage =
          "No response received from the server. Please check your network connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}
      >
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight">
          Register New Employee
        </h2>
        <p className="mt-2 text-center text-base text-black/60">
          Only Admin can register new employees.
          {/* <Link
            to="/login"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Log In
          </Link> */}
        </p>
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

        <form onSubmit={handleSubmit(registerUser)} className="mt-8">
          <div className="space-y-5 text-left">
            <Input
              label="Full Name: "
              placeholder="Enter your full name"
              {...register("name", {
                required: true,
              })}
            />
            <Input
              label="Email: "
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: true,
                validate: {
                  matchPatern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Email address must be a valid address",
                },
              })}
            />
            <Input
              label="Password: "
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: true,
              })}
            />

            <Dropdown
              label="Role:"
              name="role"
              placeholder="Select designation"
              options={[
                { value: 5, label: "Admin" },
                { value: 4, label: "CEO" },
                { value: 3, label: "Manager" },
                { value: 2, label: "Employee" },
              ]}
              register={register}
            />

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
