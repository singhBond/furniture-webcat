"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminProfilePage() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reauthPassword, setReauthPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [requiresReauth, setRequiresReauth] = useState(false);

  // Load current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setDisplayName(u.displayName || "");
        setEmail(u.email || "");
      }
    });
    return () => unsub();
  }, []);

  // Re-authentication handler
  const handleReauth = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");
    try {
      const credential = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, credential);
      setRequiresReauth(false);
      setReauthPassword("");
      setMessage("Re-authentication successful. You can now update your profile.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");

    try {
      // Update display name
      if (displayName !== (user.displayName || "")) {
        await updateProfile(user, { displayName });
      }

      // Update email
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Update password if filled
      if (password) {
        await updatePassword(user, password);
      }

      setMessage("Profile updated successfully.");
      setPassword("");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        setRequiresReauth(true);
        setMessage(
          "For security reasons, please re-enter your password to continue."
        );
      } else {
        setMessage(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view profile.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
        </CardHeader>

        <CardContent>
          {message && (
            <p className="mb-4 text-center text-sm text-green-600">{message}</p>
          )}

          {requiresReauth ? (
            <form onSubmit={handleReauth} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reauthPassword">Current Password</Label>
                <Input
                  id="reauthPassword"
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Re-authenticating..." : "Re-authenticate"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="grid gap-2">
                <Label>Role</Label>
                <Input value="Admin" disabled />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-xs text-gray-500">
            Changes to email or password may require re-authentication.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
