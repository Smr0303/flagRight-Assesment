import React from "react";
import { Container, Logo, LogoutBtn } from "../index";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { startCron, stopCron } from "../../store/authSlice"; 
import axiosClient from "../utils/axios";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const cronStatus = useSelector((state) => state.auth.cron); // Get the cron state
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navItems = [
    {
      name: "Home",
      slug: "/",
      active: true,
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Register",
      slug: "/signup",
      active: true,
    },
  ];

  const handleToggleCron = async () => {
    if (cronStatus) {
      try {
        const response = await axiosClient.post("/cron/stopCron", {
          withCredentials: true,
        });
        console.log(response);

        dispatch(stopCron());
      } catch (err) {
        console.error("Error stopping cron job:", err);
      }
    } else {

      try {
        const response = await axiosClient.post("/cron/startCron", {
          withCredentials: true,
        });
        console.log(response);
        dispatch(startCron());
      } 
      catch (err) {
        console.error("Error starting cron job:", err);
      }
    }
  };


  return (
    <header className="py-3 shadow bg-gray-300">
      <Container>
        <nav className="flex">
          <div className="mr-4 flex justify-center items-center">
            <Link to="/">
              <Logo width="70px" />
            </Link>
          </div>
          <ul className="flex ml-auto">
               <button
                    onClick={handleToggleCron}
                    className={`inline-block px-4 py-2 duration-200 hover:bg-gray-200 rounded-full ${!cronStatus ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}
                  >
                     {cronStatus ? "Stop Cron" : "Start Cron"}
                  </button>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className="inline-bock px-6 py-2 duration-200 hover:bg-gray-200 rounded-full"
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
            
            {/* <button onClick={(handleToggleCron)}>
              {cronStatus ? "Stop Cron" : "Start Cron"}
            </button> */}

            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export default Header;
