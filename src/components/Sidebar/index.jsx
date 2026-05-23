"use client";

import {
      LayoutDashboard,
      CalendarPlus,
      ClipboardList,
      LogOut,
      X,
} from "lucide-react";

import {
      useRouter,
      usePathname,
} from "next/navigation";

import "./sidebar.css";

export default function Sidebar({
      open,
      setOpen,
}) {

      const router =
            useRouter();

      const pathname =
            usePathname();

      function nav(path) {

            if (pathname === path) {
                  setOpen(false);
                  return;
            }

            router.push(path);

            setOpen(false);
      }

      async function handleLogout() {

            await fetch(
                  "/api/auth/logout",
                  {
                        method: "POST",
                  }
            );

            window.location.href =
                  "/login";
      }

      return (
            <aside
                  className={`sidebar ${open
                              ? "open"
                              : ""
                        }`}
            >

                  {/* CLOSE */}

                  <button
                        className="close-btn"
                        onClick={() =>
                              setOpen(false)
                        }
                  >
                        <X size={20} />
                  </button>

                  {/* LOGO */}

                  <h2 className="logo">
                        MockMentor
                  </h2>

                  {/* MENU */}

                  <div className="menu">

                        {/* DASHBOARD */}

                        <button
                              className={
                                    pathname === "/dashboard" &&
                                          !pathname.includes("/dashboard/book") &&
                                          !pathname.includes("/dashboard/interviews")
                                          ? "active"
                                          : ""
                              }
                              onClick={() =>
                                    nav("/dashboard")
                              }
                        >
                              <LayoutDashboard size={18} />

                              Dashboard
                        </button>

                        {/* BOOK INTERVIEW */}

                        <button
                              className={
                                    pathname.includes("/dashboard/book")
                                          ? "active"
                                          : ""
                              }
                              onClick={() =>
                                    nav("/dashboard/book")
                              }
                        >
                              <CalendarPlus size={18} />

                              Book Interview
                        </button>

                        {/* MY INTERVIEWS */}

                        <button
                              className={
                                    pathname.includes("/dashboard/interviews")
                                          ? "active"
                                          : ""
                              }
                              onClick={() =>
                                    nav("/dashboard/interviews")
                              }
                        >
                              <ClipboardList size={18} />

                              My Interviews
                        </button>
                  </div>

                  {/* FOOTER */}

                  <div className="sidebar-footer">

                        <button
                              onClick={
                                    handleLogout
                              }
                        >
                              <LogOut size={18} />

                              Logout
                        </button>
                  </div>
            </aside>
      );
}