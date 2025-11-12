"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";

export default function Features() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [marquee, setMarquee] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [current, setCurrent] = useState(0);
  const visible = 4;
  const intervalRef = useRef(null);

  // Helper: Return valid image src (supports base64, http, https, /assets)
  const getImageSrc = (image) => {
    if (!image) return "/placeholder.png";

    // If it's base64 (data:image/...)
    if (typeof image === "string" && image.startsWith("data:image/")) {
      return image;
    }

    // If it's a relative or absolute URL
    if (typeof image === "string" && (image.startsWith("http") || image.startsWith("/"))) {
      return image;
    }

    // Fallback
    return "/placeholder.png";
  };

  // Real-time: Fetch featured products + marquee
  useEffect(() => {
    const unsubscribers = [];

    // Marquee
    const unsubMarquee = onSnapshot(doc(db, "marquee", "main"), (d) => {
      if (d.exists()) setMarquee(d.data().messages || []);
    });
    unsubscribers.push(unsubMarquee);

    // All categories → collect featured products
    const unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
      const featured = [];

      snap.forEach((catDoc) => {
        const products = catDoc.data().products || [];
        const featuredInCat = products.filter((p) => p.featured);
        featured.push(...featuredInCat);
      });

      // Sort by ID (newest first)
      featured.sort((a, b) => (b.id || 0) - (a.id || 0));

      setFeaturedProducts(featured);
    });
    unsubscribers.push(unsubCategories);

    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);

  // Navigation
  const next = () => {
    setCurrent((c) =>
      c < featuredProducts.length - visible ? c + 1 : 0
    );
  };

  const prev = () => {
    setCurrent((c) =>
      c > 0 ? c - 1 : Math.max(0, featuredProducts.length - visible)
    );
  };

  // Auto-slide
  useEffect(() => {
    if (featuredProducts.length <= visible) return;

    intervalRef.current = setInterval(() => {
      setCurrent((c) =>
        c < featuredProducts.length - visible ? c + 1 : 0
      );
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [featuredProducts.length]);

  // Pause on hover
  useEffect(() => {
    if (hovered !== null) {
      clearInterval(intervalRef.current);
    } else if (featuredProducts.length > visible) {
      intervalRef.current = setInterval(() => {
        setCurrent((c) =>
          c < featuredProducts.length - visible ? c + 1 : 0
        );
      }, 3000);
    }
    return () => clearInterval(intervalRef.current);
  }, [hovered, featuredProducts.length]);

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-white py-16" id="Features">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="mb-2 text-xs uppercase tracking-wide text-amber-600">
          Furniture picks every room style
        </p>
        <h2 className="mb-12 text-3xl font-bold md:text-4xl">
          Featured Collections
        </h2>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex gap-8 transition-transform duration-500"
              style={{
                transform: `translateX(-${(current * 100) / visible}%)`,
              }}
            >
              {featuredProducts.map((p, idx) => {
                const src = getImageSrc(p.images?.[0]);

                return (
                  <div
                    key={p.id}
                    className="flex-shrink-0 w-1/2 md:w-1/4 flex justify-center"
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="group relative h-56 w-56 cursor-pointer rounded-full border border-gray-200 overflow-hidden transition-transform hover:scale-105">
                      {/* Image */}
                      <img
                        src={src}
                        alt={p.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />

                      {/* Featured Badge */}
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star size={12} className="fill-current" />
                        Featured
                      </div>

                      {/* Hover Overlay */}
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 text-white transition-opacity duration-500 ${
                          hovered === idx ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <h3 className="text-lg font-semibold">{p.name}</h3>
                        <p className="text-sm">1 product</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          {featuredProducts.length > visible && (
            <>
              <button
                onClick={prev}
                disabled={current === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={next}
                disabled={current >= featuredProducts.length - visible}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white disabled:opacity-40 transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Marquee */}
      {marquee.length > 0 && (
        <div className="mt-16 bg-gradient-to-r from-amber-700 to-amber-500 py-4">
          <div className="relative overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-white font-medium">
              {marquee.concat(marquee).map((m, i) => (
                <span key={i} className="mx-8 inline-block">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-marquee {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </section>
  );
}