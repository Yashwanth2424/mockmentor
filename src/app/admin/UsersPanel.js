"use client";

import SkeletonUserCard from "@/components/skeletons/SkeletonUserCard";
import { FiUserCheck, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import "./UsersPanel.css";

const fetcher = async (url) => {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed");
      return json.data;
};

export default function UsersPanel() {

      const { data: users, isLoading: loading, mutate } = useSWR("/api/admin/users", fetcher);

      const [search, setSearch] = useState("");
      const [actionLoading, setActionLoading] = useState(false);

      const filtered = (users || []).filter(u =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
      );

      const toggleRole = async (user) => {
            const newRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN";

            if (!confirm(`Change role to ${newRole}?`)) return;
            if (actionLoading) return;

            setActionLoading(true);

            try {
                  const res = await fetch(`/api/admin/users/${user.id}/role`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ role: newRole }),
                  });

                  const json = await res.json();

                  if (!res.ok || !json.success) {
                        toast.error(json.error || "Failed to update role");
                        return;
                  }

                  toast.success("Role updated");
                  mutate();

            } catch {
                  toast.error("Server error");
            } finally {
                  setActionLoading(false);
            }
      };

      const deleteUser = async (id) => {
            if (!confirm("Delete this user permanently?")) return;
            if (actionLoading) return;

            setActionLoading(true);

            try {
                  const res = await fetch(`/api/admin/users/${id}`, {
                        method: "DELETE",
                  });

                  const json = await res.json();

                  if (!res.ok || !json.success) {
                        toast.error(json.error || "Delete failed");
                        return;
                  }

                  toast.success("User deleted");
                  mutate();

            } catch {
                  toast.error("Server error");
            } finally {
                  setActionLoading(false);
            }
      };

      if (loading) {
            return (
                  <div className="users-grid">
                        {Array(6).fill(0).map((_, i) => (
                              <SkeletonUserCard key={i} />
                        ))}
                  </div>
            );
      }

      return (
            <div className="users-panel">

                  <div className="users-header">
                        <h2>Users Management</h2>
                        <input
                              placeholder="Search users..."
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                        />
                  </div>

                  <div className="users-grid">
                        {filtered.length === 0 ? (
                              <div className="empty-state">
                                    <h3>No users found</h3>
                                    <p>Try adjusting your search</p>
                              </div>
                        ) : (
                              filtered.map(u => (
                                    <div key={u.id} className="user-card">

                                          <div className="user-info">
                                                <h3>{u.name}</h3>
                                                <p>{u.email}</p>
                                          </div>

                                          <span className={`role ${u.role.toLowerCase()}`}>
                                                {u.role}
                                          </span>

                                          <div className="user-actions">
                                                {/* FIX: onClick handlers added */}
                                                <button
                                                      className="role-btn"
                                                      disabled={actionLoading}
                                                      onClick={() => toggleRole(u)}
                                                >
                                                      <FiUserCheck style={{ marginRight: 6 }} />
                                                      Toggle Role
                                                </button>

                                                <button
                                                      className="delete-btn"
                                                      disabled={actionLoading}
                                                      onClick={() => deleteUser(u.id)}
                                                >
                                                      <FiTrash2 style={{ marginRight: 6 }} />
                                                      Delete
                                                </button>
                                          </div>

                                          <p className="joined">
                                                Joined: {new Date(u.createdAt).toLocaleDateString()}
                                          </p>

                                    </div>
                              ))
                        )}
                  </div>
            </div>
      );
}