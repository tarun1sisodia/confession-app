"use client";

import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFeed, getMyPostsFeed } from "@/lib/api";

export function MobileAppShell() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [backHint, setBackHint] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function warmUp() {
      try {
        await Promise.allSettled([
          getFeed({ category: "", page: 1, limit: 10 }),
          getFeed({ category: "trending", page: 1, limit: 10 }),
          getMyPostsFeed({ page: 1, limit: 10 })
        ]);
      } finally {
        if (!cancelled) {
          window.setTimeout(() => setLoading(false), 700);
        }
      }
    }

    warmUp();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return undefined;
    }

    let lastBack = 0;
    const listener = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (pathname !== "/") {
        router.back();
        return;
      }

      const now = Date.now();
      if (canGoBack) {
        router.back();
        return;
      }

      if (now - lastBack < 1600) {
        CapacitorApp.exitApp();
        return;
      }

      lastBack = now;
      setBackHint("Press back again to exit");
      window.setTimeout(() => setBackHint(""), 1500);
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, [pathname, router]);

  return (
    <>
      {loading ? (
        <div className="app-loader">
          <div className="app-loader-mark">
            <img src="/logo.png" alt="Confessly" className="brand-logo" />
          </div>
          <p>Loading your confession world...</p>
        </div>
      ) : null}
      {backHint ? <div className="back-hint">{backHint}</div> : null}
    </>
  );
}
