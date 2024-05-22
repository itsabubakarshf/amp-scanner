import Chart from 'chart.js/auto';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { TailSpin } from "react-loader-spinner";
import 'react-toastify/dist/ReactToastify.css';
import { getFromServer } from "./helpers/request";
import Home from './pages/Home';
import Protect from "./helpers/Protect";
import { setLoginUser } from "./store/userSlice";
import Login from "./auth/Login";


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoginOrSignUpPage =
    location.pathname.includes("/login") ||
    location.pathname.includes("/singup");

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    console.log("Page loaded or route changed:", location.pathname);
    const storage = localStorage.getItem("accessToken");
    console.log("Token",storage);
    if (storage) {
      setIsLoading(true);
      const fetchResult = async () => {
        console.log("Calling fetchResult");
        const result = await getFromServer("user");
        if (result.status) {
          let item = {};
          item["data"] = result.data;
          localStorage.setItem("authUser", JSON.stringify(item));
          dispatch(setLoginUser(result.data));
          navigate("/");
        } else {
          toast.error(result.message || result.error);
        }
        console.log("fetchResult completed");
        setIsLoading(false);
      };
      fetchResult();
    } else {
      setIsLoading(false);
    }
  }, [location.pathname]);

  if (isLoading) {
    return <TailSpin color="#00BFFF" height={80} width={80} />;
  } else {
    return  (
      <>
        <Routes>
          <Route index element={<Protect element={<Home />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </>
    );
  }
}

export default App;
