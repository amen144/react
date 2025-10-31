"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditNote() {
  const router = useRouter();
  const params = useParams();
  const noteId = params?.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true); // loading fetch
  const [saving, setSaving] = useState(false);  // saving state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) {
      setLoading(false);
      return;
    }

    const fetchNote = async () => {
      setLoading(true);
      setError(null);
      try {
        // expects backend GET /notes/:id to return single note object
        const res = await axios.get(`${API_URL}/notes/note/${noteId}`);
        const note = res.data;
        // if backend returns array, pick first
        const payload = Array.isArray(note) ? note[0] || {} : note || {};
        setTitle(payload.title ?? note.title);
        setContent(payload.content ?? note.content);
      } catch (err) {
        console.error(err);
        setError("Failed to load note.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteId) return alert("Missing note id");
    if (!title.trim() || !content.trim()) return alert("Please fill in all fields");
    setSaving(true);
    setError(null);
    try {
      await axios.put(`${API_URL}/notes/${noteId}`, { title, content });
      router.push("/home");
    } catch (err) {
      console.error(err);
      setError("Failed to update note.");
    } finally {
      setSaving(false);
    }
  };

  if (!noteId) {
    return <div className="p-4">Note id missing in route.</div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading note...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Edit Note</h2>

        {error && <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="w-full bg-white/10 backdrop-blur-xs rounded-xl p-6 flex flex-col gap-4">
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            required
            disabled={saving}
          />

          <label className="text-sm font-medium">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full border border-gray-300 rounded-md p-2"
            required
            disabled={saving}
          />

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 bg-green-700 text-white py-2 rounded-md">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => router.push("/home")} className="bg-gray-500 text-white py-2 px-4 rounded-md">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}