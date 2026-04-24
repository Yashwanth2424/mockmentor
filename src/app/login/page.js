"use client";

import "./index.css";
import { useState, useEffect } from "react";
import { FaBackspace, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
      const router = useRouter();

      const [showPass, setShowPass] = useState(false);
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");

      useEffect(() => {
            async function checkUser() {
                  try {
                        const res = await fetch("/api/me");
                        const data = await res.json();

                        if (!data.error) {
                              // ✅ User already logged in

                              if (data.role === "ADMIN" || data.role === "SUPER_ADMIN") {
                                    window.location.href = "/admin";
                              } else {
                                    window.location.href = "/dashboard";
                              }
                        }
                  } catch (err) {
                        console.error("Auth check failed");
                  }
            }

            checkUser();
      }, []);

      const handleSubmit = async (event) => {
            event.preventDefault();

            if (!email || !password) {
                  toast.error("Please enter email and password");
                  return;
            }

            try {
                  const res = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: {
                              "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ email, password }),
                  });

                  if (res.ok) {
                        const data = await res.json();

                        toast.success("Login successful!");

                        setTimeout(() => {
                              // 🔥 Allow BOTH admin levels
                              if (["ADMIN", "SUPER_ADMIN"].includes(data.role)) {
                                    window.location.href = "/admin";
                              } else {
                                    window.location.href = "/dashboard";
                              }
                        }, 800);
                  } else {
                        const data = await res.json();
                        toast.error(data.error || "Invalid email or password");
                  }

            } catch (err) {
                  toast.error("Server error");
            }
      };

      return (
            <div className="login-page-main-container">
                  <img
                        alt="login-img-icon"
                        src="/sigin_up_page_img.jpeg"
                        className="login-image-icon"
                  />

                  <div className="login-container">
                        <Link href="/" className="back-to-home">
                              <FaBackspace />
                              <p>Home</p>
                        </Link>

                        <h1 className="login-heading">Login</h1>

                        <form className="form" onSubmit={handleSubmit}>
                              <div className="password-input-container">
                                    <div><FaUser /></div>
                                    <input
                                          type="email"
                                          className="input-email-bar"
                                          value={email}
                                          placeholder="Email"
                                          autoComplete="email"
                                          onChange={(e) => setEmail(e.target.value)}
                                    />
                              </div>

                              <div className="password-input-container">
                                    <div><FaLock /></div>
                                    <input
                                          type={showPass ? "text" : "password"}
                                          value={password}
                                          placeholder="Password"
                                          autoComplete="current-password"
                                          className="input-password-bar"
                                          onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div onClick={() => setShowPass((prev) => !prev)}>
                                          {showPass
                                                ? <FaEye className="show-password-icon" />
                                                : <FaEyeSlash className="show-password-icon" />}
                                    </div>
                              </div>

                              <button type="submit" className="signup-btn">
                                    Log in
                              </button>
                        </form>

                        <p className="have-an-account-text">
                              Don't have an account?{" "}
                              <span>
                                    <Link href="/signup">Register Here</Link>
                              </span>
                        </p>
                  </div>

                  <ToastContainer position="top-center" autoClose={3000} />
            </div>
      );
}