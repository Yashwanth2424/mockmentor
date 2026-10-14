"use client";

import SkeletonInterviewCard from "@/components/skeletons/SkeletonInterviewCard";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import UsersPanel from "./UsersPanel";
import { FiGrid, FiUsers, FiMenu, FiX } from "react-icons/fi";
import { formatDateTime } from "@/lib/time";
import { fetcher } from "@/lib/fetcher";
import StatusBadge from "@/components/StatusBadge";
import { STATUS_LABELS } from "@/lib/interviewStatus";
import "./admin.css";

function subscribeToTab(callback) {
  window.addEventListener("admintab", callback);
  return () => window.removeEventListener("admintab", callback);
}

function getSavedTab() {
  return localStorage.getItem("adminTab") || "dashboard";
}

function setActiveTab(tab) {
  localStorage.setItem("adminTab", tab);
  window.dispatchEvent(new Event("admintab"));
}

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const activeTab = useSyncExternalStore(subscribeToTab, getSavedTab, () => "dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

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

  const { data: interviews, isLoading: loadingInterviews } = useSWR(
    user ? "/api/admin/interviews" : null,
    fetcher,
  );

  async function handleLogout() {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    await fetch("/api/auth/logout", { method: "POST" });

    await mutate(() => true, undefined, { revalidate: false });

    window.location.href = "/login";
  }

  const safeInterviews = Array.isArray(interviews) ? interviews : [];

  const filteredInterviews = safeInterviews
    .filter((i) => {
      const text =
        `${i.topic} ${i.user?.name} ${i.user?.email} ${i.mentor?.name} ${i.mentor?.email}`.toLowerCase();
      return (
        text.includes(search.toLowerCase()) && (statusFilter === "ALL" || i.status === statusFilter)
      );
    })
    .sort((a, b) =>
      sortOrder === "NEWEST"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date),
    );

  return (
    <div className="admin-layout">
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">MockMentor</h2>
          <button className="close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <nav>
          <button
            type="button"
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => {
              setActiveTab("dashboard");
              setMenuOpen(false);
            }}
          >
            <FiGrid className="nav-icon" />
            Dashboard
          </button>

          <button
            type="button"
            className={activeTab === "users" ? "active" : ""}
            onClick={() => {
              setActiveTab("users");
              setMenuOpen(false);
            }}
          >
            <FiUsers className="nav-icon" />
            Users
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <FiMenu />
          </button>

          <h1>{activeTab === "dashboard" ? "Admin Dashboard" : "Users Management"}</h1>

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
                <h2>{safeInterviews.filter((i) => i.status === "PENDING").length}</h2>
              </div>

              <div className="stat-card completed">
                <p>Completed</p>
                <h2>{safeInterviews.filter((i) => i.status === "COMPLETED").length}</h2>
              </div>
            </div>

            <section>
              <h2>All Interviews</h2>

              <div className="controls">
                <input
                  type="text"
                  placeholder="Search by topic, student or mentor..."
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
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
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
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <SkeletonInterviewCard key={i} />
                    ))}
                </div>
              ) : filteredInterviews.length === 0 ? (
                <div className="empty-state">
                  <h3>No interviews yet</h3>
                  <p>No data available</p>
                </div>
              ) : (
                <div className="interview-grid">
                  {filteredInterviews.map((i) => (
                    <div
                      key={i.id}
                      className="interview-card"
                      onClick={() => router.push(`/admin/interviews/${i.id}`)}
                    >
                      <div className="interview-header">
                        <h3>{i.topic}</h3>
                        <StatusBadge status={i.status} />
                      </div>

                      <p>
                        <strong>Student:</strong> {i.user?.name}
                      </p>
                      <p>
                        <strong>Mentor:</strong> {i.mentor?.name || "Not assigned"}
                      </p>
                      <p>
                        <strong>Date:</strong> {formatDateTime(i.date)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "users" && (
          <UsersPanel currentUserId={user?.id} currentUserRole={user?.role} />
        )}
      </main>
    </div>
  );
}
