"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check PHP session; redirect to PHP-managed login
    fetch("/admin/api/check.php")
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated) {
          router.replace("/admin/settings");
        } else {
          window.location.href = "/admin/login.php";
        }
      })
      .catch(() => {
        window.location.href = "/admin/login.php";
      });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm text-[var(--muted)] animate-pulse">Redirecting...</p>
    </div>
  );
}
