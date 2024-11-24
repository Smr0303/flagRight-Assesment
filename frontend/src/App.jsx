import React from "react";
import { Footer, Header } from "./components";
import { Outlet } from "react-router-dom";
import "./App.css";

function App() {

  return (
    <div className="min-h-screen flex flex-wrap content-between bg-gray-200">
      <div className="w-full block">
        <Header />
        <main>
          <Outlet/>
        </main>
        <Footer />
      </div>
    </div>
  ) ;
}

export default App;
