"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

import ThemeToggle from "@/components/ThemeToggle";

import { FiCalendar, FiMessageCircle, FiList, FiHeart, FiMenu, FiX } from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when resizing to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 640) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigate = (path) => {
    setMenuOpen(false);
    setTimeout(() => router.push(path), 100);
  };

  const handleMenuOpen = () => {
    if (window.innerWidth <= 640) {
      setMenuOpen(true);
    }
  };

  return (
    <main className={styles.homeContainer}>
      <nav className={styles.navbar}>
        <h2 className={styles.logo}>MockMentor</h2>

        <div className={styles.navButtons}>
          <button className={styles.navBtn} onClick={() => router.push("/login")}>
            Login
          </button>

          <button
            className={`${styles.navBtn} ${styles.signup}`}
            onClick={() => router.push("/signup")}
          >
            Signup
          </button>

          <ThemeToggle />
        </div>

        <button className={styles.menuBtn} onClick={handleMenuOpen} aria-label="Open menu">
          <FiMenu />
        </button>
      </nav>

      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>
        <div className={styles.mobileHeader}>
          <span>Menu</span>

          <button
            className={styles.closeBtn}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <button onClick={() => handleNavigate("/login")}>Login</button>

        <button onClick={() => handleNavigate("/signup")}>Signup</button>

        <div className={styles.themeBtn}>
          <span>Theme</span>
          <ThemeToggle />
        </div>
      </div>

      <section className={styles.hero}>
        <h1>
          Crack Your Next Interview <br />
          <span>with Confidence</span>
        </h1>

        <p>
          Book mock interviews with mentors, get honest feedback, and improve before the real one.
        </p>

        <div className={styles.ctaButtons}>
          <button onClick={() => router.push("/signup")}>Get Started</button>

          <button className={styles.secondary} onClick={() => router.push("/login")}>
            Already have an account?
          </button>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <FiCalendar className={styles.icon} />
          <h3>Smart Scheduling</h3>
          <p>Pick a mentor and a free 30-minute slot within their weekly hours.</p>
        </div>

        <div className={styles.featureCard}>
          <FiMessageCircle className={styles.icon} />
          <h3>Real Feedback</h3>
          <p>
            After the interview, your mentor gives a rating, your strengths and what to improve.
          </p>
        </div>

        <div className={styles.featureCard}>
          <FiList className={styles.icon} />
          <h3>Track Your Interviews</h3>
          <p>See every interview, its status and the feedback you got in one place.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} MockMentor • Built with{" "}
        <FiHeart className={styles.heartIcon} role="img" aria-label="love" />
      </footer>
    </main>
  );
}
