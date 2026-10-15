"use client";

import { mutate } from "swr";
import ThemeToggle from "@/components/ThemeToggle";
import "./header.css";

export default function Header({ user }) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate(() => true, undefined, { revalidate: false });
    window.location.replace("/login");
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <h2 className="logo">MockMentor</h2>
      </div>

      <div className="header-right">
        <ThemeToggle />
        <span className="user-name">{user?.name}</span>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
