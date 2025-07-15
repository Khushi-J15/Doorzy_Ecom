import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "../../service/ApiService";
import '../../style/profile.css';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      toast.error("Please log in to view your profile", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }
    fetchUserInfo();
  }, [navigate]);

  const fetchUserInfo = async () => {
    try {
      const response = await ApiService.getLoggedInUserInfo();
      setUserInfo(response.user);
      toast.success("User info loaded successfully!", {
        position: "top-right",
        autoClose: 1000,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unable to fetch user info";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (!ApiService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (!userInfo && !error) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <h2>Welcome {userInfo?.name || "User"}</h2>

      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="profile-content">
          <div className="user-info">
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Phone Number:</strong> {userInfo.phoneNumber}</p>
            <p><strong>Role:</strong> {userInfo.role}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;