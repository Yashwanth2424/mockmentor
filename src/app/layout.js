import "./globals.css";

import { Inter } from "next/font/google";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";

<Toaster />

//  Load font OUTSIDE component
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MockMentor",
  description: "Mock interview practice platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>

      {/*  Prevent dark mode flicker */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem("theme");
                if (theme === "dark") {
                  document.documentElement.classList.add("dark");
                }
              })();
            `,
          }}
        />
      </head>

      <body className={inter.className}>
        {children}

        <ToastContainer
          position="top-center"
          autoClose={3000}
          theme="colored"
        />
      </body>
    </html>
  );
}