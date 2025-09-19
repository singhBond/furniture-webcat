"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs,doc, query, where, getDoc } from "firebase/firestore";

export default function Header() {
  const [language, setLanguage] = useState("English");
  const [shopName, setShopName] = useState("MEBLE RANCHI");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch shop name
  useEffect(() => {
    const fetchShopName = async () => {
      const docRef = doc(db, "adminData", "shopInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setShopName(docSnap.data().name || "MEBLE RANCHI");
    };
    fetchShopName();
  }, []);

  // Handle search input change
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }

      // Example: search in "products" collection by name
      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);
      const results = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      setSearchResults(results);
    };

    fetchSearchResults();
  }, [searchTerm]);

  const handleSelectResult = () => {
    setSearchTerm("");
    setShowDropdown(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[999] w-full border-b bg-white/95 backdrop-blur">
      <div className="flex justify-between bg-amber-800 px-6 py-2 text-sm text-white">
        <div className="flex space-x-6">
          <Link href="/ContactUs#Map" className="flex items-center gap-1 hover:underline">
            <MapPin size={16} /> Find a Store
          </Link>
        </div>
        {/* <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded bg-amber-700 px-2 text-white"
        >
          <option>English</option>
          <option>Hindi</option>
        </select> */}
      </div>

      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <Link href="/" className="text-3xl font-serif text-amber-800">{shopName}</Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/" className="px-3 py-2 text-gray-800 hover:text-amber-700">Home</Link>
          <Link href="#Features" className="px-3 py-2 text-gray-800 hover:text-amber-700">Products</Link>
          {/* <Link href="/" className="px-3 py-2 text-gray-800 hover:text-amber-700">Blog</Link> */}
          <Link href="/ContactUs" className="px-3 py-2 text-gray-800 hover:text-amber-700">Contact Us</Link>
        </nav>

        {/* Dynamic search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            className="border rounded px-3 py-1 w-60 focus:outline-none"
          />
          <Search size={20} className="absolute right-2 top-2 text-gray-500" />

          {showDropdown && searchResults.length > 0 && (
            <ul className="absolute bg-white shadow-lg rounded w-60 mt-1 max-h-60 overflow-auto z-50">
              {searchResults.map((item) => (
                <li
                  key={item.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Link href={`/products/${item.id}`} onClick={handleSelectResult}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {showDropdown && searchTerm && searchResults.length === 0 && (
            <div className="absolute bg-white shadow-lg rounded w-60 mt-1 px-3 py-2 text-gray-500">
              No results found
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
