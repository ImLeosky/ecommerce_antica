"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  console.log("ThemeProvider component rendered");
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("ThemeProvider useEffect running...");
    setMounted(true);
    // Initial theme detection
    const savedTheme = localStorage.getItem("theme") as Theme;
    const initialTheme = savedTheme || "dark";

    console.log(
      "ThemeProvider: savedTheme =",
      savedTheme,
      "initialTheme =",
      initialTheme,
    );
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    console.log(
      "ThemeProvider: attribute set to",
      document.documentElement.getAttribute("data-theme"),
    );
  }, []);

  const toggleTheme = () => {
    console.log("toggleTheme called");
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      console.log("toggleTheme: changing from", prevTheme, "to", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      console.log(
        "toggleTheme: attribute set to",
        document.documentElement.getAttribute("data-theme"),
      );
      return newTheme;
    });
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: "dark", toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
