"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AudioControls from "../component/audioCtrl";
export default function AddNote() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Your backend URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userID = localStorage.getItem("userID");
    if (!userID) return alert("User not logged in");

    if (!title || !content || !userID) return alert("Please fill in all fields");

    setLoading(true);

    try {
      await axios.post(`${API_URL}/notes`, { title, content, userID });
      alert("Note added successfully!");
      router.push("/../home"); // Redirect to homepage or notes list
    } catch (error) {
      console.error(error);
      alert("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
<div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white/30  rounded px-3 py-2 shadow">
      <button
        onClick={() => {
        router.push("/../home");
        }}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
      >
        Cancel
      </button>
      </div>
      <div className="rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Add New Note</h2>
        <form onSubmit={handleSubmit}           className="w-full max-w-sm bg-white/10  rounded-xl shadow-2xl p-8 flex flex-col items-center border border-white/30"
          style={{ backdropFilter: `blur(2px)` }}>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition"
          >
            {loading ? "Adding..." : "Add Note"}
          </button>
        </form>
      </div>
    </div>
  );
}
