import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("dockchat_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("dockchat_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dockchat_user");
  };

  const sendOTP = async (phoneNumber) => {
    // For demo: We just return success and let the component handle the local generation
    return { message: "successfully" };
  };

  const verifyOTP = async (phoneNumber, otp) => {
    try {
      // Sync with backend to get JWT
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, isMock: true }),
      });
      
      const data = await res.json();
      if (data.token) {
        login(data);
      }
      return data;
    } catch (err) {
      console.error("verifyOTP error:", err);
      return { message: "Login failed" };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.token) {
        login(data);
      }
      return data;
    } catch (err) {
      console.error("register error:", err);
      return { message: "Registration failed" };
    }
  };

  const loginWithPassword = async (identity, password) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
      });
      const data = await res.json();
      if (data.token) {
        login(data);
      }
      return data;
    } catch (err) {
      console.error("login error:", err);
      return { message: "Login failed" };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data._id) {
        const updatedUser = { ...user, ...data };
        login(updatedUser);
      }
      return data;
    } catch (err) {
      console.error("updateProfile error:", err);
      return { message: "Failed to update profile" };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      return await res.json();
    } catch (err) {
      console.error("verifyEmail error:", err);
      return { message: "Verification failed" };
    }
  };

  const resendEmailOTP = async (email) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/resend-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (err) {
      console.error("resendEmailOTP error:", err);
      return { message: "Failed to resend code" };
    }
  };

  const toggleFollow = async (targetUserId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/follow`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      // Update local user state if needed
      return data;
    } catch (err) {
      console.error("toggleFollow error:", err);
      return { message: "Failed to follow" };
    }
  };

  const getSuggestedUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/suggested`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      return await res.json();
    } catch (err) {
      console.error("getSuggestedUsers error:", err);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading, 
      register, 
      loginWithPassword,
      verifyEmail,
      resendEmailOTP,
      toggleFollow,
      getSuggestedUsers,
      sendOTP, 
      verifyOTP, 
      updateProfile, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
