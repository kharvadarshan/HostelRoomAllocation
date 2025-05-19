"use client";

import React, { useState, useEffect } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeProvider';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show theme toggle after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-center flex-grow">Shreekar Hostel</h1>
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-green-800 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <FiSun className="w-5 h-5" />
            ) : (
              <FiMoon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 