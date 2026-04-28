import React from 'react'
import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth.jsx"
import Home from "./pages/Home.jsx"
import {useEffect } from 'react';
import axios from 'axios';
import { useDispatch} from "react-redux"
import { setUser } from './redux/userSlice.js';
import InterviewPage from './pages/InterviewPage.jsx';
import Pricing from "./pages/Pricing.jsx"
import InterviewHistory from './pages/InterviewHistory.jsx';
import InterviewReport from "./pages/InterviewReport.jsx"
 import Payment from "./pages/Payment.jsx";
export const ServerUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000"


const App = () => {
// find currentuser
const dispatch=useDispatch();
// const [user, setUser] = useState(null);

//   // 🔐 get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(
          `${ServerUrl}/api/user/current-user`,
          {
            withCredentials: true, // VERY IMPORTANT for cookies
          }
        );
dispatch(setUser(res.data.user));
        // console.log("Current User:", res.data.user);
        // setUser(res.data.user);
      } catch (error) {
        console.log("Not logged in");
        dispatch(setUser(null));
        
      }
    };

    getUser();
  }, [dispatch]);
  return (
    
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/auth" element={<Auth/>}/>
      <Route path="/interview" element={<InterviewPage/>}/>
        <Route path="/history" element={<InterviewHistory/>}/>
          <Route path="/pricing" element={<Pricing/>}/>
          <Route path="/report/:id" element={<InterviewReport/>}/>
          <Route path="/payment" element={<Payment />} /> 
    </Routes>
  )
}

export default App
