"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// ★ Star rating input
const StarRatingInput = ({ rating, setRating }) => (
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

export default function AdminDashboard() {
  // Shop info
  const [shopInfo, setShopInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    mapEmbed: "",
  });

  // Hero section
  const [heroData, setHeroData] = useState({
    slides: [],
    tagline: "",
    heading: "",
    description: "",
    buttonText: "",
  });

  // Footer section with dedicated social fields
  const [footerData, setFooterData] = useState({
    contact: { phone: "", email: "", storesLink: "" },
    sections: [],
    social: { facebook: "", instagram: "" }, // fixed keys
  });

  // Messages & reviews
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: "",
    reviewText: "",
    rating: 5,
  });

  // ---- Firestore loads ----
  useEffect(() => {
    const fetchShopInfo = async () => {
      const snap = await getDoc(doc(db, "adminData", "shopInfo"));
      if (snap.exists()) setShopInfo(snap.data());
    };
    fetchShopInfo();
  }, []);

  useEffect(() => {
    const fetchHero = async () => {
      const snap = await getDoc(doc(db, "adminData", "heroSection"));
      if (snap.exists()) setHeroData(snap.data());
    };
    fetchHero();
  }, []);

  useEffect(() => {
    const fetchFooter = async () => {
      const snap = await getDoc(doc(db, "adminData", "footer"));
      if (snap.exists()) {
        const data = snap.data();
        setFooterData({
          contact: data.contact || { phone: "", email: "", storesLink: "" },
          sections: data.sections || [],
          social: {
            facebook:
              data.social?.find((s) => s.icon === "facebook")?.href || "",
            instagram:
              data.social?.find((s) => s.icon === "instagram")?.href || "",
          },
        });
      }
    };
    fetchFooter();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "messages"), (s) =>
      setMessages(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reviews"), (s) =>
      setReviews(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  // ---- Actions ----
  const handleShopUpdate = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "adminData", "shopInfo"), shopInfo);
    alert("Shop info updated!");
  };

  const submitHero = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "adminData", "heroSection"), heroData);
    alert("Hero section updated!");
  };

  const submitFooter = async (e) => {
    e.preventDefault();
    // convert to array format for Firestore
    await setDoc(doc(db, "adminData", "footer"), {
      contact: footerData.contact,
      sections: footerData.sections,
      social: [
        { icon: "facebook", href: footerData.social.facebook },
        { icon: "instagram", href: footerData.social.instagram },
      ],
    });
    alert("Footer updated!");
  };

  const deleteMessage = async (id) => await deleteDoc(doc(db, "messages", id));
  const deleteReview = async (id) => await deleteDoc(doc(db, "reviews", id));

  const submitReview = async (e) => {
    e.preventDefault();
    await setDoc(doc(collection(db, "reviews")), {
      ...newReview,
      rating: Number(newReview.rating),
      createdAt: serverTimestamp(),
    });
    setNewReview({ name: "", reviewText: "", rating: 5 });
    alert("Review added!");
  };

  const updateSection = (idx, field, value) => {
    const updated = [...footerData.sections];
    updated[idx][field] =
      field === "links" ? value.split(",").map((l) => l.trim()) : value;
    setFooterData({ ...footerData, sections: updated });
  };

  const addSection = () =>
    setFooterData({
      ...footerData,
      sections: [...footerData.sections, { title: "", links: [""] }],
    });

  // ---- JSX ----
  return (
    <div className="p-6 mt-10 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Shop Info */}
      <Card className="p-6">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Shop Contact Info</h2>
          <form className="space-y-3" onSubmit={handleShopUpdate}>
            <label className="block font-semibold">Shop Name</label>
            <Input
              value={shopInfo.name}
              onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
            />
            <label className="block font-semibold">Phone</label>
            <Input
              value={shopInfo.phone}
              onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
            />
            <label className="block font-semibold">Email</label>
            <Input
              value={shopInfo.email}
              onChange={(e) => setShopInfo({ ...shopInfo, email: e.target.value })}
            />
            <label className="block font-semibold">Address</label>
            <Textarea
              value={shopInfo.address}
              onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
              className="h-24"
            />
            <label className="block font-semibold">Map Embed URL</label>
            <Textarea
              value={shopInfo.mapEmbed}
              onChange={(e) => setShopInfo({ ...shopInfo, mapEmbed: e.target.value })}
              className="h-24"
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
              Update Shop Info
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hero Section */}
      <Card className="p-6">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Hero Section</h2>
          <form className="space-y-3" onSubmit={submitHero}>
            <label className="block font-semibold">Tagline</label>
            <Input
              value={heroData.tagline || ""}
              onChange={(e) => setHeroData({ ...heroData, tagline: e.target.value })}
            />
            <label className="block font-semibold">Heading</label>
            <Input
              value={heroData.heading || ""}
              onChange={(e) => setHeroData({ ...heroData, heading: e.target.value })}
            />
            <label className="block font-semibold">Description</label>
            <Textarea
              value={heroData.description || ""}
              onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
              className="h-24"
            />
            <label className="block font-semibold">Button Text</label>
            <Input
              value={heroData.buttonText || ""}
              onChange={(e) => setHeroData({ ...heroData, buttonText: e.target.value })}
            />
            <label className="block font-semibold">Slides (comma separated URLs)</label>
            <Textarea
              value={heroData.slides?.join(", ") || ""}
              onChange={(e) =>
                setHeroData({ ...heroData, slides: e.target.value.split(",").map((s) => s.trim()) })
              }
              className="h-24"
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
              Update Hero Section
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Card className="p-6">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Footer Section</h2>
          <form className="space-y-3 overflow-y-auto max-h-[400px]" onSubmit={submitFooter}>
            <label className="block font-semibold">Phone</label>
            <Input
              value={footerData.contact.phone || ""}
              onChange={(e) =>
                setFooterData({ ...footerData, contact: { ...footerData.contact, phone: e.target.value } })
              }
            />
            <label className="block font-semibold">Email</label>
            <Input
              value={footerData.contact.email || ""}
              onChange={(e) =>
                setFooterData({ ...footerData, contact: { ...footerData.contact, email: e.target.value } })
              }
            />
            <label className="block font-semibold">Stores Link</label>
            <Input
              value={footerData.contact.storesLink || ""}
              onChange={(e) =>
                setFooterData({ ...footerData, contact: { ...footerData.contact, storesLink: e.target.value } })
              }
            />

            {footerData.sections.map((sec, i) => (
              <div key={i} className="border p-3 rounded space-y-2 bg-gray-50">
                <label className="block font-semibold">Section Title</label>
                <Input value={sec.title} onChange={(e) => updateSection(i, "title", e.target.value)} />
                <label className="block font-semibold">Links (comma separated)</label>
                <Input value={sec.links.join(", ")} onChange={(e) => updateSection(i, "links", e.target.value)} />
              </div>
            ))}

            <h3 className="text-lg font-semibold mt-4">Social Links</h3>
            <label className="block font-semibold">Facebook URL</label>
            <Input
              value={footerData.social.facebook}
              onChange={(e) =>
                setFooterData({ ...footerData, social: { ...footerData.social, facebook: e.target.value } })
              }
            />
            <label className="block font-semibold">Instagram URL</label>
            <Input
              value={footerData.social.instagram}
              onChange={(e) =>
                setFooterData({ ...footerData, social: { ...footerData.social, instagram: e.target.value } })
              }
            />

            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
              Update Footer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact Messages */}
      <Card className="p-6">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Contact Messages</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="p-3 bg-gray-100 rounded flex justify-between items-start">
                  <div>
                    <p>
                      <strong>{msg.name}</strong> ({msg.email}, {msg.phone})
                    </p>
                    <p>{msg.message}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteMessage(msg.id)}>
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card className="p-6">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          <form onSubmit={submitReview} className="mb-4 space-y-2">
            <label className="block font-semibold">Name</label>
            <Input value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} />
            <label className="block font-semibold">Review</label>
            <Textarea value={newReview.reviewText} onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })} />
            <StarRatingInput rating={newReview.rating} setRating={(r) => setNewReview({ ...newReview, rating: r })} />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Add Review</Button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-gray-100 rounded flex justify-between items-start">
                  <div>
                    <p>
                      <strong>{rev.name}</strong> - {rev.rating} ⭐
                    </p>
                    <p>{rev.reviewText}</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteReview(rev.id)}>
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
