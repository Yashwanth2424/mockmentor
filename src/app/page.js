"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

import ThemeToggle from "@/components/ThemeToggle";

import {
  FiCalendar,
  FiMessageCircle,
  FiTrendingUp,
  FiHeart,
  FiMenu,
  FiX
} from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when resizing to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 600) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //  Safe navigation
  const handleNavigate = (path) => {
    setMenuOpen(false);
    setTimeout(() => router.push(path), 100);
  };

  //  Prevent opening menu on desktop
  const handleMenuOpen = () => {
    if (window.innerWidth <= 600) {
      setMenuOpen(true);
    }
  };

  return (
    <main className={styles.homeContainer}>

      {/*  NAVBAR  */}
      <nav className={styles.navbar}>
        <h2 className={styles.logo}>MockMentor</h2>

        {/* DESKTOP */}
        <div className={styles.navButtons}>
          <button onClick={() => router.push("/login")}>Login</button>

          <button
            className={styles.signup}
            onClick={() => router.push("/signup")}
          >
            Signup
          </button>

          <ThemeToggle />
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className={styles.menuBtn}
          onClick={handleMenuOpen}
        >
          <FiMenu />
        </button>
      </nav>

      {/*  OVERLAY  */}
      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/*  MOBILE SIDE MENU  */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>

        <div className={styles.mobileHeader}>
          <span>Menu</span>

          <button
            className={styles.closeBtn}
            onClick={() => setMenuOpen(false)}
          >
            <FiX />
          </button>
        </div>

        <button onClick={() => handleNavigate("/login")}>
          Login
        </button>

        <button onClick={() => handleNavigate("/signup")}>
          Signup
        </button>

        {/*  FIXED THEME BUTTON */}
        <button className={styles.themeBtn}>
          <span>Theme</span>
          <ThemeToggle />
        </button>

      </div>

      {/*  HERO  */}
      <section className={styles.hero}>
        <h1>
          Crack Your Next Interview <br />
          <span>with Confidence</span>
        </h1>

        <p>
          Practice real interview scenarios, get expert feedback, and improve faster.
        </p>

        <div className={styles.ctaButtons}>
          <button onClick={() => router.push("/signup")}>
            Get Started
          </button>

          <button
            className={styles.secondary}
            onClick={() => router.push("/login")}
          >
            Already have account?
          </button>
        </div>
      </section>

      {/*  FEATURES  */}
      <section className={styles.features}>

        <div className={styles.featureCard}>
          <FiCalendar className={styles.icon} />
          <h3>Smart Scheduling</h3>
          <p>Book interviews anytime with flexible scheduling.</p>
        </div>

        <div className={styles.featureCard}>
          <FiMessageCircle className={styles.icon} />
          <h3>Real Feedback</h3>
          <p>Get detailed feedback to improve your performance.</p>
        </div>

        <div className={styles.featureCard}>
          <FiTrendingUp className={styles.icon} />
          <h3>Track Growth</h3>
          <p>Monitor your progress and become interview-ready.</p>
        </div>

      </section>

      {/*  FOOTER  */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} MockMentor • Built with{" "}
        <FiHeart className={styles.heartIcon} />
      </footer>

    </main>
  );
}