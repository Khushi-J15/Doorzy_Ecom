import React from "react";
import '../../style/Navbar.css';
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useState } from "react";

const Navbar = () => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const isAdmin = ApiService.isAdmin();
  const isAuthenticated = ApiService.isAuthenticated();

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    navigate(`/?search=${searchValue}`);
  };

  const handleLogout = () => {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
      ApiService.logout();
      setTimeout(() => {
        navigate('/login');
      }, 500);
    }
  };

  return (
    <nav className="navbar">
      <h2>Doorzy</h2>
      <div className="navbar-brand">
        <NavLink to="/">
          <img src="./vite.svg" alt="KJ Mart" />
        </NavLink>
        
      </div>
      
      <form className="navbar-search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search products"
          value={searchValue}
          onChange={handleSearchChange}
        />
        <button type="submit">Search</button>
      </form>
      <div className="navbar-link">
        <NavLink to="/" activeclassname="active">
          Home
        </NavLink>
        <NavLink to="/categories">Categories</NavLink>
        {isAuthenticated && <NavLink to="/recommend">Recommendations</NavLink>}
        {isAuthenticated && <NavLink to="/profile">My Account</NavLink>}
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        {!isAuthenticated && <NavLink to="/login">Login</NavLink>}
        {isAuthenticated && <NavLink onClick={handleLogout}>Logout</NavLink>}
        <NavLink to="/cart">Cart</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;