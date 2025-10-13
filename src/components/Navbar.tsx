import React, { useState } from "react";
import { openWebview } from "zmp-sdk/apis";

interface NavbarProps {
  activeTab?: "quiz-selection" | "profile";
  onTabChange?: (tab: "quiz-selection" | "profile") => void;
  onAddClick?: () => void;
  onZaloClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  activeTab = "quiz-selection",
  onTabChange,
  onAddClick,
  onZaloClick,
}) => {
  const [pressedTab, setPressedTab] = useState<string | null>(null);

  const navbarStyle = {
    position: "fixed" as const,
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "8px 16px",
    zIndex: 1000,
    boxShadow: "0 8px 32px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(0,0,0,0.1)",
    minWidth: "260px",
    maxWidth: "300px",
    width: "88%",
    border: "1px solid rgba(139, 92, 246, 0.1)",
  };

  const tabStyle = (isActive: boolean, isPressed: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    flex: 1,
    borderRadius: "18px",
    transform: isPressed ? "scale(0.9)" : isActive ? "scale(1.05)" : "scale(1)",
    position: "relative" as const,
    backgroundColor: isActive ? "rgba(139, 92, 246, 0.1)" : "transparent",
  });

  const zaloButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#8B5CF6",
    borderRadius: "50%",
    border: "none",
    transform: pressedTab === "zalo" ? "scale(0.9)" : "scale(1)",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
  };

  const iconStyle = (isActive: boolean) => ({
    fontSize: "20px",
    color: isActive ? "#8B5CF6" : "#9CA3AF",
    transition: "all 0.2s ease",
    transform: isActive ? "scale(1.1)" : "scale(1)",
  });

  // Icon dot indicator
  const dotStyle = {
    position: "absolute" as const,
    top: "5px",
    right: "5px",
    width: "8px",
    height: "8px",
    backgroundColor: "#8B5CF6",
    borderRadius: "50%",
    border: "2px solid white",
  };

  const handleTabClick = (tab: "quiz-selection" | "profile") => {
    setPressedTab(tab);
    setTimeout(() => setPressedTab(null), 150);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleZaloClick = () => {
    setPressedTab("zalo");
    setTimeout(() => setPressedTab(null), 150);
    if (onZaloClick) {
      onZaloClick();
    } else {
      // Open Zalo link using ZMP openWebview
      openWebview({
        url: "https://zalo.me/2674761099009385171",
      });
    }
  };

  return (
    <nav style={navbarStyle}>
      {/* Quiz Selection Tab */}
      <div
        style={tabStyle(activeTab === "quiz-selection", pressedTab === "quiz-selection")}
        onClick={() => handleTabClick("quiz-selection")}
      >
        <div style={{ position: "relative" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={activeTab === "quiz-selection" ? "#8B5CF6" : "#CBD5E1"}
            style={{ transition: "all 0.2s ease" }}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {activeTab === "quiz-selection" && <div style={dotStyle} />}
        </div>
      </div>

      {/* Zalo Button */}
      <button style={zaloButtonStyle} onClick={handleZaloClick}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="white"
          style={{ transition: "all 0.2s ease" }}
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </button>

      {/* Profile Tab */}
      <div
        style={tabStyle(activeTab === "profile", pressedTab === "profile")}
        onClick={() => handleTabClick("profile")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={activeTab === "profile" ? "#8B5CF6" : "#CBD5E1"}
          style={{ transition: "all 0.2s ease" }}
        >
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
        </svg>
      </div>
    </nav>
  );
};

export default Navbar;
