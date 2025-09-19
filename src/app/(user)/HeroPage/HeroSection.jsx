"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function HeroSection() {
  const [heroData, setHeroData] = useState({
    slides: [],
    tagline: "",
    heading: "",
    description: "",
    buttonText: "",
  });
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false); // fade-in trigger

  // Firestore listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "adminData", "heroSection"), (snap) => {
      if (snap.exists()) setHeroData(snap.data());
    });
    return () => unsub();
  }, []);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (!heroData.slides || heroData.slides.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroData.slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroData.slides]);

  // Trigger fade-in on mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const {
    slides = ["/hero1.png", "/hero2.png", "/hero3.png"],
    tagline = "Timeless Elegance",
    heading = "Modern Furniture For Every Space",
    description = "Discover handcrafted pieces that blend comfort and style. Perfectly designed to elevate your home's personality.",
    buttonText = "CONTACT US NOW...",
  } = heroData;

  return (
    <section className="relative inset-0 flex min-h-[80vh] items-center justify-center overflow-hidden">
      {/* Background slides */}
      {slides.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt="Modern Furniture"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Text content */}
      <div
        className={`relative z-10 mx-auto max-w-3xl px-6 text-center md:text-left transition-all duration-1000 ease-out transform ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <p className="mb-3 text-sm uppercase tracking-wide text-amber-400">
          {tagline}
        </p>
        <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
          {heading}
        </h1>
        <p className="mb-6 text-lg text-gray-200">{description}</p>
        <Link href="/ContactUs">
          <Button size="lg" className="bg-black text-white hover:bg-gray-800">
            Contact Us →
          </Button>
        </Link>
      </div>
    </section>
  );
}
