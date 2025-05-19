import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shreekar Hostel - User Registration",
  description: "Register for Shreekar Hostel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <Navbar />
            <main className="bg-gray-50 dark:bg-gray-800 min-h-[calc(100vh-5rem)] transition-colors duration-300">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
