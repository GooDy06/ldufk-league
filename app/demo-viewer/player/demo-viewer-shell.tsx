"use client";

import { useEffect, useState } from "react";

export function DemoViewerShell() {
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    async function bootViewer() {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/demo-viewer/demo-cache-sw.js", { scope: "/demo-viewer/" });
          await navigator.serviceWorker.ready;
        } catch {
          // The viewer still works without offline cache; it will just download normally.
        }
      }

      if (cancelled) return;
      script = document.createElement("script");
      script.src = "/demo-viewer/assets/index-BzWfuE-X.js";
      script.type = "module";
      document.body.appendChild(script);
    }

    bootViewer();

    return () => {
      cancelled = true;
      script?.remove();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("demo-panel-collapsed", panelCollapsed);
    return () => document.body.classList.remove("demo-panel-collapsed");
  }, [panelCollapsed]);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
      <link rel="stylesheet" href="/demo-viewer/assets/index-DdUdHWOz.css" />
      <link rel="stylesheet" href="/demo-viewer/ldufk-theme.css" />
      <div id="root" className="fixed inset-0 z-[9999] bg-black" />
      <button
        type="button"
        className="demo-panel-toggle"
        aria-label={panelCollapsed ? "Показати панель керування" : "Сховати панель керування"}
        onClick={() => setPanelCollapsed((value) => !value)}
      >
        {panelCollapsed ? "⌃" : "⌄"}
      </button>
    </>
  );
}
