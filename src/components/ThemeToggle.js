"use client";

import { useEffect, useSyncExternalStore } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import "./ThemeToggle.css";

function subscribe(callback) {
      window.addEventListener("themechange", callback);
      return () => window.removeEventListener("themechange", callback);
}

function getTheme() {
      return localStorage.getItem("theme") || "light";
}

export default function ThemeToggle() {
      const theme = useSyncExternalStore(subscribe, getTheme, () => "light");

      useEffect(() => {
            document.documentElement.classList.toggle("dark", theme === "dark");
      }, [theme]);

      const toggleTheme = () => {
            localStorage.setItem("theme", theme === "dark" ? "light" : "dark");
            window.dispatchEvent(new Event("themechange"));
      };

      return (
            <div onClick={toggleTheme} className="themeToggleBtn">
                  {theme === "dark" ? <FiSun /> : <FiMoon />}
            </div>
      );
}
