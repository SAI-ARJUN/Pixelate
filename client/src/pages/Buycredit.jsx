import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";

const Buycredit = () => {
  const { user, backendUrl, token, loadCreditsData } = useContext(AppContext);
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/payment/plans`);
        if (data.success) {
          setPlans(data.plans);
        } else {
          toast.error(data.message || "Failed to load plans.");
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Could not fetch plans.");
      }
    };

    fetchPlans();
  }, [backendUrl]);

  const loadRazorpay = async (item) => {
    if (!user) {
      toast.error("Please log in to purchase credits.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/payment/create-order`,
        { planId: item.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(data.message || "Order creation failed.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Pixelate Credits",
        description: `Buy ${item.credits} credits`,
        image: assets.logo_icon,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${backendUrl}/api/payment/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (verifyRes.data.success) {
              toast.success("Payment Successful! 🎉");
              await loadCreditsData(); // Refresh credits
              navigate("/result");
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification Error:", err);
            toast.error("Verification process failed.");
          }
        },
        theme: {
          color: "#121212",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order Creation Error:", err);
      toast.error("Could not create order.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-14 mb-10"
    >
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
        Our Plans
      </button>

      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">
        Choose the plan
      </h1>

      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.length === 0 ? (
          <p className="text-gray-500">Loading Plans...</p>
        ) : (
          plans.map((item, index) => (
            <div
              key={index}
              className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
            >
              <img
                width={40}
                src={assets.logo_icon}
                alt="icon"
                className="w-6 mb-3"
              />
              <p className="mt-3 mb-1 font-semibold capitalize">{item.id}</p>
              <p className="text-sm">{item.desc}</p>
              <p className="mt-6">
                <span className="text-3xl font-medium">₹{item.price}</span> /{" "}
                {item.credits} credits
              </p>
              <button
                onClick={() => loadRazorpay(item)}
                className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
              >
                {user ? "Purchase" : "Get Started"}
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Buycredit;
