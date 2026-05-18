"use client";

import { useEffect } from "react";

export function DemoViewerShell() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/demo-viewer/assets/index-BzWfuE-X.js";
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
      <link rel="stylesheet" href="/demo-viewer/assets/index-DdUdHWOz.css" />
      <link rel="stylesheet" href="/demo-viewer/ldufk-theme.css" />
      <div id="root" className="fixed inset-0 z-[9999] bg-black" />
    </>
  );
}
