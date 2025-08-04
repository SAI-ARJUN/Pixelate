import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [state, setState] = useState("Login");
  const {
    setShowLogin,
    backendUrl,
    setToken,
    setUser,
    setCredit,
    loadCreditsData,
  } = useContext(AppContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      let response;

      // ✅ Fixed URLs here
      if (state === 'Login') {
        response = await axios.post(`${backendUrl}/api/users/login`, {
          email,
          password,
        });
      } else {
        response = await axios.post(`${backendUrl}/api/users/register`, {
          name,
          email,
          password,
        });
      }

      const data = response.data;

      if (data.success) {
        toast.success("Login Successful");

        // Save token and user data
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);

        // Delay to ensure token sync, then fetch credits
        setTimeout(async () => {
          await loadCreditsData(); // Now with valid token
          setShowLogin(false);
        }, 200);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
      <motion.form
        onSubmit={onSubmitHandler}
        initial={{ opacity: 0.2, y: 50 }}
        transition={{ duration: 0.3 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-white p-10 rounded-xl text-slate-500"
      >
        <h1 className="text-center text-2xl text-neutral-700 font-medium">
          {state}
        </h1>
        <p className="text-sm text-center mb-2">
          Welcome back! Please sign in to continue
        </p>

        {state !== "Login" && (
          <div className="flex items-center gap-2 border rounded-full px-4 py-2 mt-5">
            <img src={assets.profile_icon} alt="user" className="w-5 h-5" />
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              className="outline-none text-sm flex-1 bg-transparent"
              placeholder="Full Name"
              required
              autoFocus
            />
          </div>
        )}

        <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
          <img src={assets.email_icon} alt="email" className="w-5 h-5" />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className="outline-none text-sm bg-transparent flex-1"
            placeholder="Email Id"
            required
          />
        </div>

        <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
          <img src={assets.lock_icon} alt="password" className="w-5 h-5" />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            className="outline-none text-sm bg-transparent flex-1"
            placeholder="Password"
            required
          />
        </div>

        <p className="text-sm text-blue-600 my-4 cursor-pointer text-right">
          Forgot password?
        </p>

        <button
          type="submit"
          className="bg-blue-600 w-full text-white py-2 rounded-full"
        >
          {state === "Login" ? "Login" : "Create account"}
        </button>

        {state === "Login" ? (
          <p className="mt-5 text-center">
            Don't have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => setState("Sign Up")}
            >
              Sign up
            </span>
          </p>
        ) : (
          <p className="mt-5 text-center">
            Already have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => setState("Login")}
            >
              Login
            </span>
          </p>
        )}

        <img
          onClick={() => setShowLogin(false)}
          src={assets.cross_icon}
          alt="close"
          className="absolute top-5 right-5 cursor-pointer w-4 h-4"
        />
      </motion.form>
    </div>
  );
};

export default Login;
