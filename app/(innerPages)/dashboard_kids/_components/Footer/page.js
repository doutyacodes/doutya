"use client";
import React, { useEffect } from "react";

export default function Footer() {
  useEffect(() => {
    const navButtons = document.querySelectorAll("button");

    // Add hover effects
    navButtons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        button.style.transform = "scale(1.1)";
        button.style.backgroundColor = styles.navButtonHover.backgroundColor;
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "scale(1)";
        button.style.backgroundColor = button.getAttribute("data-bg"); 
      });
    });

    // Responsive adjustments
    const setButtonWidth = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 480) {
        navButtons.forEach((button) => {
          button.style.width = "80px";
          button.style.fontSize = "12px";
          button.style.padding = "8px 10px";
        });
      } else {
        navButtons.forEach((button) => {
          button.style.width = "auto";
          button.style.fontSize = "16px";
          button.style.padding = "10px 20px";
        });
      }
    };

    setButtonWidth(); 
    window.addEventListener("resize", setButtonWidth);

    return () => {
      navButtons.forEach((button) => {
        button.removeEventListener("mouseenter", () => {});
        button.removeEventListener("mouseleave", () => {});
      });
      window.removeEventListener("resize", setButtonWidth);
    };
  }, []);

  return (
    <div style={styles.navigationBar}>
        <a href="/dashboard_kids" >
      <button style={{ ...styles.navButton, ...styles.navButtonHome }} data-bg="#FF6F61">
      Dashboard
      </button>
      </a>
       <a href="#" >
      <button style={{ ...styles.navButton, ...styles.navButtonProfile }} data-bg="#FFD700">
        MY PROFILE
      </button>
      </a>
       <a href="/dashboard/careers/career-guide">
      <button style={{ ...styles.navButton, ...styles.navButtonCareer }} data-bg="#4CAF50">
        CAREER
      </button>
      </a>
    </div>
  );
}

const styles = {
  navigationBar: {
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
    // position: "fixed",
    // bottom: "20px",
    // left: "0",
    // right: "0",
    padding: "10px 0",
    // backgroundColor: "rgba(255, 255, 255, 0.8)", 
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
  },
  navButton: {
    border: "none",
    borderRadius: "30px", 
    color: "white",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  navButtonHome: {
    backgroundColor: "#FF6F61", 
  },
  navButtonProfile: {
    backgroundColor: "#FFD700", 
  },
  navButtonCareer: {
    backgroundColor: "#4CAF50", 
  },
  navButtonHover: {
    backgroundColor: "#FFC0CB", 
  },
};