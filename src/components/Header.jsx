"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Menu, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function Header() {
  const [shopName, setShopName] = useState("MEBLE RANCHI");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Fetch shop name
  useEffect(() => {
    const fetchShopName = async () => {
      const docRef = doc(db, "adminData", "shopInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setShopName(docSnap.data().name || "MEBLE RANCHI");
      }
    };
    fetchShopName();
  }, []);

  // Debounced Search
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const categoriesRef = collection(db, "categories");
        const snapshot = await getDocs(categoriesRef);

        let allProducts = [];

        snapshot.forEach((catDoc) => {
          const productsArray = catDoc.data().products || [];
          allProducts = allProducts.concat(
            productsArray.map((p) => ({
              ...p,
              category: catDoc.id,   // Important for redirect
            }))
          );
        });

        const results = allProducts
          .filter((item) =>
            item.name?.toLowerCase().includes(term.toLowerCase())
          )
          .slice(0, 8);

        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 350),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && !searchRef.current.contains(event.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (category) => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  const getFirstImage = (item) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    return "/placeholder.jpg";
  };

  function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[999] w-full border-b bg-white/95 backdrop-blur">
      {/* Top Bar */}
      <div className="flex justify-between bg-yellow-600 px-6 py-2 text-sm text-white">
        <Link href="/ContactUs#Map" className="flex items-center gap-1 hover:underline">
          <MapPin size={16} /> Find a Store
        </Link>
      </div>

      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <Link href="/" className="text-3xl font-serif text-yellow-600">
          {shopName}
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-amber-800 focus:outline-none"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-yellow-700">Home</Link>
          <Link href="/ProductsCatalogue" className="hover:text-yellow-700">Products</Link>
          <Link href="/ContactUs" className="hover:text-yellow-700">Contact Us</Link>
        </nav>

        {/* Desktop Search */}
        <div className="relative hidden md:block w-80" ref={searchRef}>
          <div className="relative ">
            <input
              type="text"
              placeholder="Search furniture..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="border border-gray-300 rounded-3xl px-4 py-2.5 w-full  focus:outline-none focus:border-yellow-600"
            />
            <Search size={20} className="absolute right-3 top-3  text-gray-500" />
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && searchTerm && (
            <div className="absolute bg-white shadow-xl rounded-lg w-full mt-2 max-h-[420px] overflow-auto z-50 border border-gray-100">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((item) => (
                    <li key={item.id} className="border-b last:border-none hover:bg-gray-50">
                      <Link
                        href={`/ProductsCatalogue?category=${encodeURIComponent(item.category)}`}
                        onClick={() => handleSelectResult(item.category)}
                        className="flex items-center gap-4 px-4 py-3 block"
                      >
                        <div className="w-14 h-14 rounded-md overflow-hidden border bg-gray-100 flex-shrink-0">
                          <img
                            src={getFirstImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.src = "/placeholder.jpg")}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.dimension} {item.units}
                          </p>
                          <p className="text-amber-600 font-bold">₹{item.mrp}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">in {item.category}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">No products found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col px-6 py-4 space-y-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/ProductsCatalogue" onClick={() => setMobileMenuOpen(false)}>Products</Link>
            <Link href="/ContactUs" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>

            {/* Mobile Search */}
            <div className="relative mt-4" ref={mobileSearchRef}>
              <input
                type="text"
                placeholder="Search furniture..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full"
              />
              <Search size={20} className="absolute right-4 top-4 text-gray-500" /> 

              {showDropdown && searchTerm && (
                <div className="absolute mt-2 w-full bg-white shadow-xl rounded-lg border max-h-80 overflow-auto z-50">
                  {loading ? (
                    <div className="p-8 text-center">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/ProductsCatalogue?category=${encodeURIComponent(item.category)}`}
                        onClick={() => handleSelectResult(item.category)}
                        className="flex items-center gap-4 px-4 py-3 border-b hover:bg-gray-50"
                      >
                        <div className="w-12 h-12 rounded overflow-hidden border flex-shrink-0">
                          <img
                            src={getFirstImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.src = "/placeholder.jpg")}
                          />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{item.name}</p>
                          <p className="text-amber-600 text-sm">₹{item.mrp}</p>
                          <p className="text-xs text-gray-400">in {item.category}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">No products found</div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}