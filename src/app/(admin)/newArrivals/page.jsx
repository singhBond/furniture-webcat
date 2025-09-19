"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewArrivalAdmin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    price: "",
    dimensions: "",
    imageUrl: null,
    imageFile: null,
  });
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Real-time Firestore subscription for products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "newArrivals"), (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Fetch WhatsApp phone number from Firestore
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const docRef = doc(db, "settings", "contact");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setPhoneNumber(docSnap.data().phoneNumber || "");
    };
    fetchPhoneNumber();
  }, []);

  const resetForm = () => {
    setForm({ title: "", price: "", dimensions: "", imageUrl: null, imageFile: null });
    setEditing(null);
  };

  const saveProduct = async () => {
    const { title, price, dimensions, imageUrl, imageFile } = form;
    if (!title.trim() || (!imageUrl && !imageFile)) {
      alert("Title and image (URL or file) are required");
      return;
    }

    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const imageRef = ref(storage, `newArrivals/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      if (editing) {
        await updateDoc(doc(db, "newArrivals", editing), {
          title: title.trim(),
          price: price.trim(),
          dimensions: dimensions.trim(),
          image: finalImageUrl,
          createdAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "newArrivals"), {
          title: title.trim(),
          price: price.trim(),
          dimensions: dimensions.trim(),
          image: finalImageUrl,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const savePhoneNumber = async () => {
    const trimmed = phoneNumber.trim();
    const phoneRegex = /^\+\d{10,15}$/; // + followed by 10-15 digits
    if (!trimmed) {
      setPhoneError("Phone number cannot be empty");
      return;
    }
    if (!phoneRegex.test(trimmed)) {
      setPhoneError("Enter valid number, e.g., +911234567890");
      return;
    }

    try {
      await setDoc(doc(db, "settings", "contact"), { phoneNumber: trimmed });
      setPhoneError("");
      alert("Phone number updated successfully");
    } catch (err) {
      console.error("Failed to update phone number:", err);
      alert("Failed to update phone number. Check console for details.");
    }
  };

  const startEdit = (product) => {
    setEditing(product.id);
    setForm({
      title: product.title,
      price: product.price || "",
      dimensions: product.dimensions || "",
      imageUrl: product.image,
      imageFile: null,
    });
  };

  const removeProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "newArrivals", id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin – New Arrivals</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT: Input Panel */}
        <div className="border rounded-lg p-6 space-y-4 bg-gray-50">
          <h2 className="font-semibold text-lg mb-2">
            {editing ? "Edit Product" : "Add New Product"}
          </h2>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                value={form.price}
                placeholder="e.g., 1999"
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label>Dimensions</Label>
              <Input
                value={form.dimensions}
                placeholder="e.g., 120x60x75 cm"
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.png"
                value={form.imageUrl || ""}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
            <div>
              <Label>Or Upload Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={saveProduct}>{editing ? "Update" : "Add Product"}</Button>
            {editing && (
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>

          {/* WhatsApp Phone Number Input */}
          <div className="pt-6">
            <Label>WhatsApp Phone Number</Label>
            <div className="flex gap-3">
              <Input
                placeholder="+911234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={phoneError ? "border-red-500" : ""}
              />
              <Button onClick={savePhoneNumber}>Update</Button>
            </div>
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>
        </div>

        {/* RIGHT: Product List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Products</h2>
            <Input
              placeholder="Filter by title..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="max-h-[70vh] overflow-y-auto space-y-4 border rounded p-3 bg-white">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center border rounded p-3 bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-gray-500">
                      Price: {product.price || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Dimensions: {product.dimensions || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => startEdit(product)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProduct(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-gray-500 text-center">No products found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
