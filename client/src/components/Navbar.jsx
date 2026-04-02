import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsCoin, BsRobot } from "react-icons/bs";
import { FaUserAstronaut, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App.jsx";
import { setUser } from "../redux/userSlice.js";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal.jsx";
const Navbar = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
const [showAuth,setshowAuth]=useState(false)
  // 🔥 close on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setShowCreditPopup(false);
      setShowUserPopup(false);
    };

    window.addEventListener("click", handleClickOutside);

    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // 🔥 logout
  const handleLogout = async () => {
    try {
      await axios.get(`${ServerUrl}/api/auth/logout`, {
        withCredentials: true,
      });

     dispatch(setUser(null));

      // close popups
      setShowCreditPopup(false);
      setShowUserPopup(false);

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    
    <nav className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-900 text-white shadow-md relative mt-4">
  
  {/* LEFT */}
  <div className="flex items-center gap-2">
    <BsRobot className="text-xl sm:text-2xl" />
    <h1 className="text-lg sm:text-xl font-bold">InterviewIQ.AI</h1>
  </div>

  {/* RIGHT */}
  <div className="flex items-center gap-2 sm:gap-4 relative">

    {/* 💰 Credits */}
    <div
      onClick={(e) => {
        if (!user) {
          setshowAuth(true);
          return;
        }
        e.stopPropagation();
        setShowCreditPopup((prev) => !prev);
        setShowUserPopup(false);
      }}
      className="flex items-center gap-1 cursor-pointer bg-gray-800 px-2 sm:px-3 py-1 rounded-full hover:bg-gray-700 text-sm sm:text-base"
    >
      <BsCoin />
      <span>{user ? user.credits : 0}</span>
    </div>

    {/* 👤 User */}
    <div
      onClick={(e) => {
        if (!user) {
          setshowAuth(true);
          return;
        }
        e.stopPropagation();
        setShowUserPopup((prev) => !prev);
        setShowCreditPopup(false);
      }}
      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-700 cursor-pointer hover:bg-gray-600"
    >
      {user ? (
        <span className="font-bold text-sm sm:text-lg">
          {user.name?.charAt(0).toUpperCase()}
        </span>
      ) : (
        <FaUserAstronaut />
      )}
    </div>

    {/* 🔥 Credit Popup */}
  {showCreditPopup && (
  <div
    onClick={(e) => e.stopPropagation()}
    className="absolute top-12 sm:top-14 right-10 sm:right-16 bg-white text-black p-4 rounded-lg shadow-lg w-52 sm:w-60 z-50"
  >
    {!user ? (
      <>
        <p className="text-sm mb-3">
          Need credits to continue 🚀
        </p>
        <button
          onClick={() => navigate("/pricing")}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Buy Credits
        </button>
      </>
    ) : (
      <>
        <p className="text-sm mb-2">
          You have {user.credits} credits 💰
        </p>

        {/* 🔥 SHOW BUTTON ONLY IF LOW CREDITS */}
        {user.credits < 50 && (
          <button
            onClick={() => navigate("/pricing")}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mt-2"
          >
            Buy More Credits 🚀
          </button>
        )}
      </>
    )}
  </div>
)}

    {/* 🔥 User Popup */}
    {showUserPopup && (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-12 sm:top-14 right-0 bg-white text-black p-4 rounded-lg shadow-lg w-52 sm:w-60 z-50"
      >
        {!user ? (
          <>
            <p className="text-sm mb-3">Please login</p>
            <button
              onClick={() => navigate("/auth")}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </>
        ) : (
          <>
            <p className="font-semibold mb-2">{user.name}</p>

            <button className="w-full text-left py-1 hover:bg-gray-100 rounded px-2">
              Interview History
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-red-500 mt-2 hover:bg-red-50 px-2 py-1 rounded"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </>
        )}
      </div>
    )}
  </div>

  {showAuth && (
    <AuthModal onClose={() => setshowAuth(false)} />
  )}
</nav>
  );
};

export default Navbar;