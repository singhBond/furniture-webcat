"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  // { name: "Featured Collections", href: "/featuredCollection", icon: Menu },
  { name: "New Arrivals", href: "/newArrivals", icon: Menu },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);      // Clear Firebase auth session
      router.replace("/admin"); // Redirect to login
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <>
      {/* Hamburger button for small screens */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-56 border-r bg-white p-4 flex flex-col shadow-md
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 z-50`}
      >
        {/* Close button on mobile */}
        <div className="sm:hidden flex justify-end mb-4">
          <button
            className="p-2 rounded-md hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-xl font-bold mb-6">Admin</h2>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => setIsOpen(false)} // close sidebar on mobile
              >
                {Icon && <Icon className="h-4 w-4" />}
                {name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {/* Overlay for small screens */}
      <div
        className={`sm:hidden fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
}
