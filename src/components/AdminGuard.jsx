"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import LoginPage from "@/components/LoginPage";

export default function AdminGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auto logout if user leaves admin routes
    if (user && !pathname.startsWith("/admin") && !pathname.startsWith("/featuredCollection") && !pathname.startsWith("/newArrivals") && !pathname.startsWith("/profile")) {
      signOut(auth).then(() => {
        setUser(null);
        router.replace("/admin");
      });
    }
  }, [pathname, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
