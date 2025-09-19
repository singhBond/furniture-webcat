"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminFeaturesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", products: "", image: "" });
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("");
  const [marquee, setMarquee] = useState([]);
  const [newMarquee, setNewMarquee] = useState("");

  // Firestore subscriptions
  useEffect(() => {
    const unsubItems = onSnapshot(collection(db, "collections"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubMarquee = onSnapshot(doc(db, "marquee", "main"), (d) => {
      if (d.exists()) setMarquee(d.data().messages || []);
    });

    return () => {
      unsubItems();
      unsubMarquee();
    };
  }, []);

  const resetForm = () => {
    setForm({ name: "", products: "", image: "" });
    setEditing(null);
  };

  const saveItem = async () => {
    const { name, products, image } = form;
    if (!name.trim() || !image.trim()) {
      alert("Name and Image URL are required");
      return;
    }
    try {
      if (editing) {
        await updateDoc(doc(db, "collections", editing), {
          name: name.trim(),
          products: parseInt(products || 0, 10),
          image: image.trim(),
        });
      } else {
        await addDoc(collection(db, "collections"), {
          name: name.trim(),
          products: parseInt(products || 0, 10),
          image: image.trim(),
        });
      }
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteDoc(doc(db, "collections", id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({
      name: item.name,
      products: item.products,
      image: item.image,
    });
  };

  const addMarquee = async () => {
    if (!newMarquee.trim()) return;
    const updated = [...marquee, newMarquee.trim()];
    await setDoc(doc(db, "marquee", "main"), { messages: updated });
    setNewMarquee("");
  };

  const deleteMarquee = async (i) => {
    const updated = marquee.filter((_, idx) => idx !== i);
    await setDoc(doc(db, "marquee", "main"), { messages: updated });
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin – Featured Collections</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT: Input Panel */}
        <div className="border rounded-lg p-6 space-y-4 bg-gray-50">
          <h2 className="font-semibold text-lg mb-2">
            {editing ? "Edit Collection" : "Add New Collection"}
          </h2>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Products Count</Label>
              <Input
                type="number"
                value={form.products}
                onChange={(e) =>
                  setForm({ ...form, products: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={saveItem}>
              {editing ? "Update" : "Add Collection"}
            </Button>
            {editing && (
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>

          {/* Marquee Management */}
          <h2 className="font-semibold text-lg mt-8 mb-2">Marquee Messages</h2>
          {marquee.map((m, i) => (
            <div key={i} className="flex justify-between items-center mb-2">
              <span>{m}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMarquee(i)}
              >
                Delete
              </Button>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="New marquee message"
              value={newMarquee}
              onChange={(e) => setNewMarquee(e.target.value)}
            />
            <Button onClick={addMarquee}>Add</Button>
          </div>
        </div>

        {/* RIGHT: Data list with scroll */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Collections</h2>
            <Input
              placeholder="Filter by name..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="max-h-[70vh] overflow-y-auto space-y-4 border rounded p-3 bg-white">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border rounded p-3 bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.products} products
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => startEdit(item)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <p className="text-gray-500 text-center">No collections found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
