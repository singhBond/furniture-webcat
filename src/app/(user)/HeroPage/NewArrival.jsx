"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function NewArrivalsCarousel() {
  const [products, setProducts] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hovered, setHovered] = useState(null);
  const [current, setCurrent] = useState(0);
  const visible = 5; // default number of visible cards
  const intervalRef = useRef(null);

  // Validate image URL or return placeholder
  const validImageUrl = (url) => {
    if (!url || typeof url !== "string") return "/placeholder.png";
    const trimmed = url.trim();
    if (!trimmed) return "/placeholder.png";
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("/")) return "/placeholder.png";
    return trimmed;
  };

  // Fetch products from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "newArrivals"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(data);
    });
    return () => unsub();
  }, []);

  // Fetch dynamic phone number
  useEffect(() => {
    const unsubPhone = onSnapshot(doc(db, "settings", "contact"), (docSnap) => {
      setPhoneNumber(docSnap.exists() ? docSnap.data().phoneNumber || "" : "");
    });
    return () => unsubPhone();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (products.length <= visible) return;
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c < products.length - visible ? c + 1 : 0));
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [products.length]);

  const next = () => {
    setCurrent((c) => (c < products.length - visible ? c + 1 : 0));
  };

  const prev = () => {
    setCurrent((c) => (c > 0 ? c - 1 : Math.max(products.length - visible, 0)));
  };

  const handleContact = (product) => {
    if (!phoneNumber) return;
    const message = encodeURIComponent(`Hi, I am interested in ${product.title}`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  // Responsive: calculate visible cards based on screen width
  const [cardsVisible, setCardsVisible] = useState(visible);
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setCardsVisible(1);
      else if (w < 1024) setCardsVisible(2);
      else setCardsVisible(visible);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="mb-12 text-3xl font-bold">New Arrivals</h2>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500"
              style={{ transform: `translateX(-${(current * 100) / cardsVisible}%)` }}
            >
              {products.map((product, idx) => {
                const src = validImageUrl(product.image);
                return (
                  <div
                    key={product.id}
                    className={`flex-shrink-0 w-[calc(100%/${cardsVisible})] flex justify-center`}
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <Card className="group relative h-80 w-full max-w-[288px] overflow-hidden rounded-xl shadow-lg transform transition-transform duration-300 hover:-translate-y-1 hover:scale-105">
                      <img
                        src={src}
                        alt={product.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div
                        className={`absolute inset-0 flex flex-col justify-center items-center bg-black/60 text-white text-center p-4 transition-opacity duration-300 ${
                          hovered === idx ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <h3 className="text-lg font-bold">{product.title}</h3>
                        <p className="mb-1">
                          Price: {product.price ? `₹${product.price}` : "N/A"}
                        </p>
                        <p className="text-sm mb-3">
                          Dimensions: {product.dimensions || "N/A"}
                        </p>
                        <Button
                          variant="default"
                          onClick={() => handleContact(product)}
                          className="w-full max-w-xs"
                        >
                          Contact
                        </Button>
                      </div>
                    </Card>
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
            disabled={current >= products.length - cardsVisible}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white disabled:opacity-40"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
