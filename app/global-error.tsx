"use client";

import CrashScreen from "./crash-screen";
import "./globals.css";

const handleReload = () => {
  window.location.reload();
};

const GlobalError = () => (
  <html lang="en">
    <body>
      <title>Asier Bayon</title>
      <CrashScreen onRestart={handleReload} />
    </body>
  </html>
);

export default GlobalError;
