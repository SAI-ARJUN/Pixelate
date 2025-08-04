import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [credit, setCredit] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const loadCreditsData = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/users/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setUser(data.user);
        setCredit(data.credits);
      } else {
        toast.error(data.message || "Unauthorized");
        logout();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
      logout();
    }
  };

  const generateImage = async (prompt) => {
    if (!token) {
      toast.error("Please login to generate images.");
      setShowLogin(true);
      return null;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/image/generate-image`,
        { prompt, userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCredit(response.data.creditBalance);
        return response.data.resultImage;
      } else {
        toast.error(response.data.message);
        return null;
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setCredit(0);
    setShowLogin(true);
  };

  useEffect(() => {
    loadCreditsData();
  }, [token]);

  const contextValue = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    backendUrl,
    token,
    setToken,
    credit,
    setCredit,
    generateImage,
    loadCreditsData,
    logout
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
