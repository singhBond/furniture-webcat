"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";

export default function Features() {
  const [collections, setCollections] = useState([]);
  const [marquee, setMarquee] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [current, setCurrent] = useState(0);
  const visible = 4; // number of visible cards
  const intervalRef = useRef(null);

  // ✅ Helper to validate or fallback image URL
  const validImageUrl = (url) => {
    if (!url || typeof url !== "string") return "/placeholder.png";
    const t = url.trim();
    if (!t) return "/placeholder.png";
    if (!/^https?:\/\//i.test(t) && !t.startsWith("/")) return "/placeholder.png";
    return t;
  };

  // Live Firestore data
  useEffect(() => {
    const unsubCards = onSnapshot(collection(db, "collections"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCollections(data);
    });

    const unsubMarquee = onSnapshot(doc(db, "marquee", "main"), (d) => {
      if (d.exists()) setMarquee(d.data().messages || []);
    });

    return () => {
      unsubCards();
      unsubMarquee();
    };
  }, []);

  // Manual navigation
  const next = () => {
    setCurrent((c) => (c < collections.length - visible ? c + 1 : 0));
  };
  const prev = () => {
    setCurrent((c) => (c > 0 ? c - 1 : collections.length - visible));
  };

  // 🔄 Auto-slide every 4 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c < collections.length - visible ? c + 1 : 0));
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [collections.length]);

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
              style={{ transform: `translateX(-${(current * 100) / visible}%)` }}
            >
              {collections.map((c, idx) => {
                const src = validImageUrl(c.image);
                return (
                  <div
                    key={c.id}
                    className="flex-shrink-0 w-1/2 md:w-1/4 flex justify-center"
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="group relative h-56 w-56 cursor-pointer rounded-full border border-gray-200 overflow-hidden transition-transform hover:scale-105">
                      <img
                        src={src}
                        alt={c.name || "feature image"}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 text-white transition-opacity duration-500 ${
                          hovered === idx ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <h3 className="text-lg font-semibold">{c.name}</h3>
                        <p className="text-sm">{c.products} products</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={prev}
            disabled={current === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white disabled:opacity-40"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            disabled={current >= collections.length - visible}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white disabled:opacity-40"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Marquee */}
      <div className="mt-16 bg-gradient-to-r from-amber-700 to-amber-500 py-4">
        <div className="relative overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-white font-medium">
            {marquee.map((m, i) => (
              <span key={i} className="mx-8">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-marquee {
          display: inline-block;
          min-width: 100%;
          animation: marquee 20s linear infinite;
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
