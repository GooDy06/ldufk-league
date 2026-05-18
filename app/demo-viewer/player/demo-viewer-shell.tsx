"use client";

import { useEffect, useState } from "react";

export function DemoViewerShell() {
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  useEffect(() => {
    function updateMobileClass() {
      const mobile =
        window.innerWidth <= 900 ||
        window.matchMedia("(pointer: coarse)").matches ||
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      document.documentElement.classList.toggle("demo-mobile", mobile);
      document.body.classList.toggle("demo-mobile", mobile);
    }

    updateMobileClass();
    window.addEventListener("resize", updateMobileClass);
    window.visualViewport?.addEventListener("resize", updateMobileClass);

    return () => {
      window.removeEventListener("resize", updateMobileClass);
      window.visualViewport?.removeEventListener("resize", updateMobileClass);
      document.documentElement.classList.remove("demo-mobile");
      document.body.classList.remove("demo-mobile");
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    async function cleanupLegacyDemoCache() {
      if (!("serviceWorker" in navigator)) return false;

      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations
            .filter((registration) => registration.scope.includes("/demo-viewer/"))
            .map((registration) => registration.unregister()),
        );
        if ("caches" in window) {
          await caches.delete("ldufk-demo-cache-v1");
        }
      } catch {
        return false;
      }

      if (navigator.serviceWorker.controller && !sessionStorage.getItem("ldufk-demo-sw-cleaned")) {
        sessionStorage.setItem("ldufk-demo-sw-cleaned", "1");
        window.location.reload();
        return true;
      }

      return false;
    }

    async function bootViewer() {
      const reloading = await cleanupLegacyDemoCache();
      if (reloading) return;

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
