"use client";

import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import "./ThemeToggle.css";

export default function ThemeToggle() {
      const [theme, setTheme] = useState("light");

      useEffect(() => {
            const saved = localStorage.getItem("theme") || "light";
            setTheme(saved);

            if (saved === "dark") {
                  document.documentElement.classList.add("dark");
            }
      }, []);

      const toggleTheme = () => {
            const newTheme = theme === "dark" ? "light" : "dark";

            setTheme(newTheme);
            document.documentElement.classList.toggle("dark");

            localStorage.setItem("theme", newTheme);
      };

      return (
            <div onClick={toggleTheme} className="themeToggleBtn">
                  {theme === "dark" ? <FiSun /> : <FiMoon />}
            </div>
      );
}