"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Refresh at the Chilean date change, and after returning to a sleeping tab.
export function DailyRefresh({ date }: { date: string }) {
  const router = useRouter();
  useEffect(() => {
    let lastDate = date;
    const check = () => {
      if (document.visibilityState !== "visible") return;
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
      }).format(new Date());
      if (today !== lastDate) {
        lastDate = today;
        router.refresh();
      }
    };
    const timer = window.setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    check();
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [date, router]);
  return null;
}
