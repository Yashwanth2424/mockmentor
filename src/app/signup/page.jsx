"use client";

import "./signup.css";
import ThemeToggle from "@/components/ThemeToggle";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
      Home,
      Mail,
      Lock,
      User,
      Eye,
      EyeOff,
} from "lucide-react";

import { toast } from "react-toastify";

export default function SignupPage() {

      const router = useRouter();

      const [form, setForm] = useState({
            name: "",
            email: "",
            password: "",
      });

      const [showPassword, setShowPassword] = useState(false);
      const [loading, setLoading] = useState(false);

      function handleChange(e) {

            setForm({
                  ...form,
                  [e.target.name]: e.target.value,
            });
      }

      async function handleSubmit(e) {

            e.preventDefault();

            if (loading) return;

            if (
                  !form.name.trim() ||
                  !form.email.trim() ||
                  !form.password.trim()
            ) {
                  toast.error("All fields are required");
                  return;
            }

            setLoading(true);

            try {

                  const res = await fetch("/api/auth/signup", {
                        method: "POST",
                        headers: {
                              "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                              name: form.name.trim(),
                              email: form.email.trim(),
                              password: form.password,
                        }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                        toast.error(data.error || "Signup failed");
                        return;
                  }

                  toast.success("Account created successfully");

                  setTimeout(() => {
                        router.push("/login");
                  }, 500);

            } catch (error) {

                  toast.error("Something went wrong");

            } finally {

                  setLoading(false);
            }
      }

      return (
            <div className="signup-page">
                  {/* RIGHT */}
                  <div className="signup-right">
                        <form
                              className="signup-card"
                              onSubmit={handleSubmit}
                        >
                              <Link href="/" className="home-link">
                                    <Home size={16} />
                                    Home
                              </Link>
                              <h1>Create Account</h1>

                              {/* NAME */}
                              <div className="input-group">

                                    <User size={18} className="input-icon" />

                                    <input
                                          type="text"
                                          name="name"
                                          placeholder="Full Name"
                                          value={form.name}
                                          onChange={handleChange}
                                    />

                              </div>
                              {/* EMAIL */}
                              <div className="input-group">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                          type="email"
                                          name="email"
                                          placeholder="Email"
                                          value={form.email}
                                          onChange={handleChange}
                                    />

                              </div>

                              {/* PASSWORD */}
                              <div className="input-group">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                          type={
                                                showPassword
                                                      ? "text"
                                                      : "password"
                                          }
                                          name="password"
                                          placeholder="Password"
                                          value={form.password}
                                          onChange={handleChange}
                                    />
                                    <button
                                          type="button"
                                          className="eye-btn"
                                          onClick={() =>
                                                setShowPassword(!showPassword)
                                          }
                                    >
                                          {showPassword
                                                ? <EyeOff size={18} />
                                                : <Eye size={18} />
                                          }
                                    </button>
                              </div>
                              <button
                                    type="submit"
                                    className="signup-btn"
                                    disabled={loading}
                              >
                                    {loading
                                          ? "Creating Account..."
                                          : "Sign Up"}
                              </button>

                              <p className="bottom-text">
                                    Already have an account?{" "}
                                    <Link href="/login">
                                          Login Here
                                    </Link>
                              </p>
                        </form>
                  </div>


                  {/* LEFT */}
                  <div className="signup-left">
                        <Image
                              src="/sign_page_image.webp"
                              alt="Signup Illustration"
                              width={420}
                              height={420}
                              className="signup-image"
                        />
                  </div>
            </div>
      );
}