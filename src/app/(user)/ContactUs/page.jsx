"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

// Star rating component for input
const StarRatingInput = ({ rating, setRating }) => {
  return (
    <div className="flex justify-center mb-2">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <span
            key={i}
            className={`text-3xl cursor-pointer ${
              i < rating ? "text-yellow-500" : "text-gray-400"
            }`}
            onClick={() => setRating(i + 1)}
          >
            &#9733;
          </span>
        ))}
    </div>
  );
};

export default function ContactPage() {
  const [shopInfo, setShopInfo] = useState({
    phone: "",
    email: "",
    address: "",
    mapEmbed: "",
  });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const [review, setReview] = useState({ name: "", reviewText: "", rating: 5 });

  // Fetch shop info from Firestore
  useEffect(() => {
    const fetchShopInfo = async () => {
      const docRef = doc(db, "adminData", "shopInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setShopInfo(docSnap.data());
    };
    fetchShopInfo();
  }, []);

  // Contact form
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "messages"), {
      ...form,
      createdAt: serverTimestamp(),
    });
    setForm({ name: "", phone: "", email: "", message: "" });
    setSubmitted(true);
  };

  // Review form
  const handleReviewChange = (e) =>
    setReview({ ...review, [e.target.name]: e.target.value });
  const submitReview = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "reviews"), {
      ...review,
      rating: Number(review.rating),
      createdAt: serverTimestamp(),
    });
    setReview({ name: "", reviewText: "", rating: 5 });
    alert("Thank you for your review!");
  };

  return (
    <div
      className="relative min-h-screen p-6 mt-28 flex flex-col items-center bg-gray-700 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.hermanmiller.group/asset/71152b06-815b-4262-bb22-e9e73ab5a7f6/W/HM_2596142_100676200_isa_foxtrot_walnut_v1_007.png?auto=format&w=1600&q=60')",
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 w-full max-w-6xl">
        <h1 className="text-center text-4xl md:text-5xl font-bold text-white mb-10">
          Contact Us
        </h1>

        <div className="grid lg:grid-cols-3 gap-10 mb-12">
          {/* Contact Details Card */}
          <Card className="relative rounded-xl p-8 border-none bg-white/10 backdrop-blur-sm text-white shadow-xl">
            <CardContent className="space-y-6 text-white">
              <h2 className="text-2xl font-bold uppercase text-center">
                Get in Touch
              </h2>
              <div className="flex items-center gap-4">
                <Phone className="text-primary" />
                <a href={`tel:${shopInfo.phone}`} className="text-lg">
                  {shopInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="text-primary" />
                <a href={`mailto:${shopInfo.email}`} className="text-lg">
                  {shopInfo.email}
                </a>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="text-primary shrink-0" />
                <p className="text-lg">{shopInfo.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form Card */}
          <Card className="relative rounded-xl p-8 border-none bg-white/10 backdrop-blur-sm text-white shadow-xl">
            <CardContent>
              {submitted ? (
                <p className="text-green-300 text-lg text-center">
                  Thank you! We’ll get back to you soon.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="bg-white/80 border-none text-black placeholder-gray-600"
                  />
                  <Input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                    className="bg-white/80 border-none text-black placeholder-gray-600"
                  />
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                    className="bg-white/80 border-none text-black placeholder-gray-600"
                  />
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    rows={5}
                    required
                    className="bg-white/80 border-none text-black placeholder-gray-600"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Add Review Form Card */}
          <Card className="relative rounded-xl p-8 border-none bg-white/10 backdrop-blur-sm text-white shadow-xl">
            <CardContent>
              <form onSubmit={submitReview} className="space-y-3 text-white">
                <h3 className="text-lg font-bold text-center">
                  Add Your Review
                </h3>
                <Input
                  type="text"
                  name="name"
                  value={review.name}
                  onChange={handleReviewChange}
                  placeholder="Your Name"
                  required
                  className="w-full p-2 rounded bg-white/80 text-black"
                />
                <Textarea
                  name="reviewText"
                  value={review.reviewText}
                  onChange={handleReviewChange}
                  placeholder="Your Review"
                  rows={4}
                  required
                  className="w-full p-2 rounded bg-white/80 text-black"
                />

                {/* Star Rating Selector */}
                <StarRatingInput
                  rating={review.rating}
                  setRating={(r) => setReview({ ...review, rating: r })}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded"
                >
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        {shopInfo.mapEmbed && (
          <div id="Map" className="rounded-xl overflow-hidden shadow-xl">
            <iframe
              src={shopInfo.mapEmbed}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shop Location"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}
