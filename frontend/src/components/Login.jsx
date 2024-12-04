import React, { useState ,useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Button, Input, Logo } from "./index";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import axiosClient from "./utils/axios";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");

  useEffect(() => {
    alert("Only Admin can Register new users. Please Login using these Admi Credentials first to test the deployment:\n\nEmail: sam@gmail.com\nPassword: 12345678");
  }, []);

  const login = async (data) => {
    setError('');

    try {

      const response = await axiosClient.post('/user/login', data, {
        withCredentials: true,
      });

      console.log(response);

      if (response.status === 200) {

        alert('Logged in successfully');

        if (response.data) dispatch(authLogin(response.data.user));

        navigate('/');
      }

      else {
        setError('Login failed. Please try again.');
      }

    }
    catch (err) {
      console.error(err);

      switch (err.response?.status) {

        case 400:
          setError('Please enter email and password.');
          break;
        case 401:
          setError('Invalid email or password.');
          break;
        default:
          setError('An unexpected error occurred. Please try again later.');
      }
    }
  };


  return (
    <div className="flex items-center justify-center w-full">
      <div
        className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}
      >
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight">
          Sign in to your account
        </h2>
        {/* <p className="mt-2 text-center text-base text-black/60">
          Don&apos;t have any account?&nbsp;
          <Link
            to="/signup"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Register
          </Link>
        </p> */}
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
        <form onSubmit={handleSubmit(login)} className="mt-8">
          <div className="space-y-5 text-left">
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
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
