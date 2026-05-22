"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--surface)] max-w-sm w-full space-y-5">
        <div className="text-center">
          <div className="text-lg font-bold text-[var(--accent)]">Redirecting to PHP login...</div>
          <p className="text-xs text-[var(--muted)] mt-1">Secure authentication</p>
        </div>
        <div className="text-center mt-4">
          <a href="/admin/login.php"
             className="text-xs text-[var(--accent)] underline underline-offset-2">
            click here if redirect does not work
          </a>
        </div>
        <Link href="/" className="block text-center text-xs text-[var(--muted)] hover:text-[var(--accent)]">&lt; back</Link>
      </div>
    </div>
  );
}
