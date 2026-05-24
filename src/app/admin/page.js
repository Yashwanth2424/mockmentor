"use client";

import SkeletonInterviewCard from "@/components/skeletons/SkeletonInterviewCard";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import UsersPanel from "./UsersPanel";
import { toast } from "react-toastify";
import { FiGrid, FiUsers, FiMenu, FiX } from "react-icons/fi";
import "./admin.css";

const fetcher = async (url) => {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed");
      return json.data;
};

export default function AdminPage() {

      const router = useRouter();

      const [user, setUser] = useState(null);
      const [loadingUser, setLoadingUser] = useState(true);
      const [search, setSearch] = useState("");
      const [statusFilter, setStatusFilter] = useState("ALL");
      const [sortOrder, setSortOrder] = useState("NEWEST");
      const [activeTab, setActiveTab] = useState("dashboard");
      const [isReady, setIsReady] = useState(false);
      const [menuOpen, setMenuOpen] = useState(false);

      useEffect(() => {
            const savedTab = localStorage.getItem("adminTab");
            if (savedTab) setActiveTab(savedTab);
            setIsReady(true);
      }, []);

      useEffect(() => {
            if (isReady) {
                  localStorage.setItem("adminTab", activeTab);
            }
      }, [activeTab, isReady]);

      useEffect(() => {
            async function fetchUser() {
                  try {
                        const res = await fetch("/api/me");
                        const json = await res.json();

                        if (!res.ok || !json.success) {
                              router.push("/login");
                              return;
                        }

                        const userData = json.data;

                        if (!["ADMIN", "SUPER_ADMIN"].includes(userData.role)) {
                              router.push("/dashboard");
                              return;
                        }

                        setUser(userData);
                        setLoadingUser(false);

                  } catch {
                        router.push("/login");
                  }
            }

            fetchUser();
      }, [router]);

      const {
            data: interviews,
            isLoading: loadingInterviews,
            mutate: mutateInterviews,
      } = useSWR(user ? "/api/admin/interviews" : null, fetcher);

      async function handleLogout() {
            const confirmLogout = confirm("Are you sure you want to logout?");
            if (!confirmLogout) return;
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
      }

      const markCompleted = async (id, e) => {
            e.stopPropagation();
            try {
                  const res = await fetch(`/api/admin/interviews/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "COMPLETED" }),
                  });

                  const json = await res.json();

                  if (!res.ok || !json.success) {
                        toast.error(json.error || "Failed to update");
                        return;
                  }

                  toast.success("Interview marked as completed");
                  mutateInterviews();

            } catch {
                  toast.error("Server error");
            }
      };

      const safeInterviews = Array.isArray(interviews) ? interviews : [];

      const filteredInterviews = safeInterviews
            .filter(i => {
                  const text = `${i.topic} ${i.user?.name} ${i.user?.email}`.toLowerCase();
                  return (
                        text.includes(search.toLowerCase()) &&
                        (statusFilter === "ALL" || i.status === statusFilter)
                  );
            })
            .sort((a, b) =>
                  sortOrder === "NEWEST"
                        ? new Date(b.date) - new Date(a.date)
                        : new Date(a.date) - new Date(b.date)
            );

      if (!isReady) {
            return (
                  <div className="interview-grid" style={{ padding: 40 }}>
                        {Array(3).fill(0).map((_, i) => (
                              <SkeletonInterviewCard key={i} />
                        ))}
                  </div>
            );
      }

      return (
            <div className="admin-layout">

                  {menuOpen && (
                        <div
                              className="sidebar-overlay"
                              onClick={() => setMenuOpen(false)}
                        />
                  )}

                  <aside className={`sidebar ${menuOpen ? "open" : ""}`}>

                        <div className="sidebar-header">
                              <h2 className="logo">MockMentor</h2>
                              <button
                                    className="close-btn"
                                    onClick={() => setMenuOpen(false)}
                              >
                                    <FiX />
                              </button>
                        </div>

                        <nav>
                              <a
                                    className={activeTab === "dashboard" ? "active" : ""}
                                    onClick={() => {
                                          setActiveTab("dashboard");
                                          setMenuOpen(false);
                                    }}
                              >
                                    <FiGrid className="nav-icon" />
                                    Dashboard
                              </a>

                              <a
                                    className={activeTab === "users" ? "active" : ""}
                                    onClick={() => {
                                          setActiveTab("users");
                                          setMenuOpen(false);
                                    }}
                              >
                                    <FiUsers className="nav-icon" />
                                    Users
                              </a>
                        </nav>

                  </aside>

                  <main className="admin-main">

                        <header className="admin-header">
                              <button
                                    className="menu-btn"
                                    onClick={() => setMenuOpen(true)}
                              >
                                    <FiMenu />
                              </button>

                              <h1>
                                    {activeTab === "dashboard"
                                          ? "Admin Dashboard"
                                          : "Users Management"}
                              </h1>

                              <div className="admin-actions">
                                    <ThemeToggle />
                                    <span className="admin-badge">Admin</span>
                                    <button onClick={handleLogout} className="logout-btn">
                                          Logout
                                    </button>
                              </div>
                        </header>

                        {activeTab === "dashboard" && (
                              <>
                                    <div className="stats">
                                          <div className="stat-card">
                                                <p>Total</p>
                                                <h2>{safeInterviews.length}</h2>
                                          </div>

                                          <div className="stat-card pending">
                                                <p>Pending</p>
                                                <h2>
                                                      {safeInterviews.filter(i => i.status === "PENDING").length}
                                                </h2>
                                          </div>

                                          <div className="stat-card completed">
                                                <p>Completed</p>
                                                <h2>
                                                      {safeInterviews.filter(i => i.status === "COMPLETED").length}
                                                </h2>
                                          </div>
                                    </div>

                                    <section>
                                          <h2>All Interviews</h2>

                                          <div className="controls">
                                                <input
                                                      type="text"
                                                      placeholder="Search interviews..."
                                                      value={search}
                                                      onChange={(e) => setSearch(e.target.value)}
                                                      className="search-input"
                                                />

                                                <select
                                                      value={statusFilter}
                                                      onChange={(e) => setStatusFilter(e.target.value)}
                                                      className="filter-select"
                                                >
                                                      <option value="ALL">All</option>
                                                      <option value="PENDING">Pending</option>
                                                      <option value="COMPLETED">Completed</option>
                                                </select>

                                                <select
                                                      value={sortOrder}
                                                      onChange={(e) => setSortOrder(e.target.value)}
                                                      className="filter-select"
                                                >
                                                      <option value="NEWEST">Newest</option>
                                                      <option value="OLDEST">Oldest</option>
                                                </select>
                                          </div>

                                          {loadingUser || loadingInterviews ? (
                                                <div className="interview-grid">
                                                      {Array(6).fill(0).map((_, i) => (
                                                            <SkeletonInterviewCard key={i} />
                                                      ))}
                                                </div>
                                          ) : filteredInterviews.length === 0 ? (
                                                <div className="empty-state">
                                                      <h3>No interviews yet</h3>
                                                      <p>No data available</p>
                                                </div>
                                          ) : (
                                                filteredInterviews.map(i => (
                                                      <div
                                                            key={i.id}
                                                            className="interview-card"
                                                            onClick={() => router.push(`/admin/interviews/${i.id}`)}
                                                      >
                                                            <div className="interview-header">
                                                                  <h3>{i.topic}</h3>
                                                                  <span className={`status ${i.status.toLowerCase()}`}>
                                                                        {i.status}
                                                                  </span>
                                                            </div>

                                                            <p><strong>User:</strong> {i.user?.name}</p>
                                                            <p><strong>Email:</strong> {i.user?.email}</p>
                                                            <p>
                                                                  <strong>Date:</strong>{" "}
                                                                  {new Date(i.date).toLocaleString()}
                                                            </p>

                                                            {i.status === "PENDING" && (
                                                                  <button
                                                                        className="complete-btn"
                                                                        onClick={(e) => markCompleted(i.id, e)}
                                                                  >
                                                                        Mark as Completed
                                                                  </button>
                                                            )}
                                                      </div>
                                                ))
                                          )}
                                    </section>
                              </>
                        )}

                        {activeTab === "users" && <UsersPanel />}

                  </main>
            </div>
      );
}