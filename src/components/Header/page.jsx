"use client";

import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import "./header.css";

export default function Header({ user }) {
      const router = useRouter();

      async function handleLogout() {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
      }

      return (
            <header className="app-header">
                  <div className="header-left">
                        <h2 className="logo">MockMentor</h2>
                  </div>

                  <div className="header-right">
                        <div className="theme-toggle-button">
                              <ThemeToggle />
                        </div>
                        <span className="user-name">{user?.name}</span>

                        <button className="logout-btn" onClick={handleLogout}>
                              Logout
                        </button>
                  </div>
            </header>
      );
}