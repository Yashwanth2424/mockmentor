import Link from "next/link";
import "./not-found.css";

export default function NotFound() {
      return (
            <div className="notfound-container">
                  <div className="notfound-card">
                        <h1 className="notfound-code">404</h1>
                        <h2 className="notfound-title">Page Not Found</h2>
                        <p className="notfound-message">
                              The page you are looking for does not exist or has been moved.
                        </p>
                        <Link href="/" className="notfound-btn">
                              Go Home
                        </Link>
                  </div>
            </div>
      );
}