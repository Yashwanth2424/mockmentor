"use client";

import "./login.css";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Home, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export default function LoginPage() {

      const router = useRouter();

      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [showPassword, setShowPassword] = useState(false);
      const [loading, setLoading] = useState(false);

      // FIX: auth check uses new response shape
      useEffect(() => {
            async function checkUser() {
                  try {
                        const res = await fetch("/api/me");
                        const json = await res.json();

                        if (!res.ok || !json.success) return;

                        const role = json.data.role;

                        if (role === "ADMIN" || role === "SUPER_ADMIN") {
                              router.replace("/admin");
                        } else if (role === "MENTOR") {
                              router.replace("/mentor");
                        } else {
                              router.replace("/dashboard");
                        }

                  } catch {
                        // not logged in, stay on login page
                  }
            }

            checkUser();
      }, [router]);

      // FIX: login response uses new response shape
      async function handleSubmit(e) {
            e.preventDefault();

            if (loading) return;

            if (!email.trim() || !password.trim()) {
                  toast.error("Please enter email and password");
                  return;
            }

            setLoading(true);

            try {
                  const res = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                              email: email.trim(),
                              password,
                        }),
                  });

                  const json = await res.json();

                  if (!res.ok || !json.success) {
                        toast.error(json.error || "Invalid credentials");
                        return;
                  }

                  const role = json.data.role;

                  toast.success("Login successful");

                  setTimeout(() => {
                        if (role === "ADMIN" || role === "SUPER_ADMIN") {
                              router.push("/admin");
                        } else if (role === "MENTOR") {
                              router.push("/mentor");
                        } else {
                              router.push("/dashboard");
                        }
                  }, 500);

            } catch {
                  toast.error("Something went wrong");
            } finally {
                  setLoading(false);
            }
      }

      return (
            <div className="login-page">

                  {/* LEFT */}
                  <div className="login-left">
                        <Image
                              src="/login_page_img_mock_mentor.webp"
                              alt="Login Illustration"
                              width={420}
                              height={420}
                              className="login-image"
                        />
                  </div>

                  {/* RIGHT */}
                  <div className="login-right">
                        <form className="login-card" onSubmit={handleSubmit}>

                              <Link href="/" className="home-link">
                                    <Home size={16} />
                                    Home
                              </Link>

                              <h1>Login</h1>

                              {/* EMAIL */}
                              <div className="input-group">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                          type="email"
                                          placeholder="Email"
                                          autoComplete="email"
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                    />
                              </div>

                              {/* PASSWORD */}
                              <div className="input-group">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                          type={showPassword ? "text" : "password"}
                                          placeholder="Password"
                                          autoComplete="current-password"
                                          value={password}
                                          onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                          type="button"
                                          className="eye-btn"
                                          onClick={() => setShowPassword(!showPassword)}
                                    >
                                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                              </div>

                              <button
                                    type="submit"
                                    className="login-btn"
                                    disabled={loading}
                              >
                                    {loading ? "Logging in..." : "Log In"}
                              </button>

                              <p className="bottom-text">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/signup">Register Here</Link>
                              </p>

                        </form>
                  </div>
            </div>
      );
}