import React from "react";
import '../../style/footer.css';
import { NavLink } from "react-router-dom";

const Footer = () => {

    return (
        <footer className="footer">
            <div className="footer-links">
                <ul>
                    <NavLink to={"/"}>About Us</NavLink>
                    <NavLink to={"/"}>Contact Us</NavLink>
                    <NavLink to={"/"}>Terms & Conditions</NavLink>
                    <NavLink to={"/"}>Privacy Policy</NavLink>
                    <NavLink to={"/"}>FAQs</NavLink>
                </ul>
            </div>
            <div className="footer-info">
                <p>&copy; 2025 Saptarshi Banerjee. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer;