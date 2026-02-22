import { useState, useEffect, useRef } from "react";
import "./navbar.css";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";

function Navbar({ onAddClick, onToggleTheme, isDark, onSupportClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const initials = user?.email
    ? user.email
      .split("@")[0]
      .split(".")
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 2)
    : "U";

  const isDashboard = location.pathname === "/dashboard";

  const closeMenus = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div
  onClick={() => navigate("/dashboard")}
  style={{
    padding: '10px 26px',
    borderRadius: '999px',
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #abadedff, #a1bbe6ff)',
    color: '#ffffff',
    letterSpacing: '1px',
    boxShadow: '0 8px 20px rgba(91,95,239,0.35)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 12px 28px rgba(91,95,239,0.5)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 8px 20px rgba(91,95,239,0.35)';
  }}
>
  FinTrack
</div>
        <ul className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <li
            className={isDashboard ? "active" : ""}
            onClick={() => {
              navigate("/dashboard");
              closeMenus();
            }}
          >
            Dashboard
          </li>
          <li
            onClick={() => {
              onAddClick();
              closeMenus();
            }}
          >
            + Add Transaction
          </li>
          <li
            onClick={() => {
              onSupportClick?.();
              closeMenus();
            }}
          >
            Support
          </li>
        </ul>
      </div>

      <button
        type="button"
        className={`menu-toggle ${mobileMenuOpen ? "open" : ""}`}
        aria-label="Toggle navigation"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
      >
        ☰
      </button>

      <div className="navbar-right">
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle dark/light mode"
        >
          {isDark ? "🌙" : "☀️"}
        </button>
        <div className="profile" ref={dropdownRef}>
          <button
            type="button"
            className="profile-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="User menu"
          >
            <div className="avatar">{initials}</div>
            <svg
              className={`profile-chevron ${dropdownOpen ? "open" : ""}`}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown__header">
                <div className="avatar avatar--large">{initials}</div>
                <div className="profile-dropdown__info">
                  <p className="profile-dropdown__email">{user?.email}</p>
                  <p className="profile-dropdown__role">User Account</p>
                </div>
              </div>
              <div className="profile-dropdown__divider" />
              <button
                type="button"
                className="profile-dropdown__item"
                onClick={() => {
                  setDropdownOpen(false);
                  onToggleTheme();
                }}
              >
                <span>{isDark ? "☀️" : "🌙"}</span>
                <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
              </button>
              <button
                type="button"
                className="profile-dropdown__item"
                onClick={() => {
                  setDropdownOpen(false);
                  onSupportClick?.();
                }}
              >
                <span>🔄</span>
                <span>Reset Data</span>
              </button>
              <button
                type="button"
                className="profile-dropdown__item profile-dropdown__item--danger"
                onClick={handleLogout}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
