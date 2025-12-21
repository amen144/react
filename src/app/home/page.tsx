"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AudioControls from "../component/audioCtrl";

export default function Home() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [userID, setUserID] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [noteToShare, setNoteToShare] = useState<number | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sharingInProgress, setSharingInProgress] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const storedID = localStorage.getItem("userID");
    
    if (!token || !storedID) {
      router.replace("/");
      return;
    }

    const storedName = localStorage.getItem("userName");
    if (storedName) setName(storedName);
    if (storedID) setUserID(storedID);

    if (storedID) {
      fetchNotes(storedID);
      fetchFriends(storedID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const fetchNotes = async (storedID: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notes/${userID}`, { headers: getAuthHeaders() });
      setNotes(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  const fetchFriends = async (storedID: string) => {
    setLoadingFriends(true);
    setFriends([]);
    try {
      const headers = getAuthHeaders();
      let res = null;
      try {
        res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/friends`, { headers });
      } catch {
        res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userID}/friends`, { headers });
      }
      setFriends(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch friends", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleEdit = (note: any) => {
    router.push(`/editnote/${note.id}`);
  };

  const handleDelete = async (noteId: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/notes/${noteId}`, { headers: getAuthHeaders() });
      setNotes((s) => s.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete note.");
    }
  };

  const handleadd = () => {
    router.push("/addnote");
  };

  const openShareModal = (noteId: number) => {
    setNoteToShare(noteId);
    setShareMsg(null);
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setNoteToShare(null);
    setShareMsg(null);
  };

  const handleShareToFriend = async (friendId: number) => {
    if (!noteToShare) return;
    setSharingInProgress(true);
    setShareMsg(null);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/share`, { noteId: noteToShare, userId: friendId }, { headers: getAuthHeaders() });
      setShareMsg("Note shared successfully.");
    } catch (err: any) {
      console.error("Share failed", err);
      setShareMsg(err?.response?.data?.error || "Failed to share note.");
    } finally {
      setSharingInProgress(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-blur-100 border-1-gray-400">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white/30 backdrop-blur-xs rounded px-3 py-2 shadow">
        <button
          onClick={() => {
            localStorage.removeItem("userName");
            localStorage.removeItem("userID");
            localStorage.removeItem("token");
            router.push("/");
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Aside / Friends */}
        <aside className="order-2 lg:order-1">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow p-4 border border-white/30 sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Friends</h3>
              <button
                className="text-sm text-blue-300 hover:underline"
                onClick={() => fetchFriends(userID)}
              >
                Refresh
              </button>
            </div>

            {loadingFriends ? (
              <div className="text-gray-400">Loading friends...</div>
            ) : friends.length === 0 ? (
              <div className="text-gray-400">No friends yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {friends.map((f) => (
                  <div key={f.id ?? f._id} className="bg-white/5 p-3 rounded-md">
                    <div className="font-medium text-sm">{f.name ?? f.username ?? f.email}</div>
                    <div className="text-xs text-gray-300">{f.email ?? ""}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={() => router.push("/friends") }
                className="w-full bg-green-700 text-white py-2 rounded-md"
              >
                Manage Friends
              </button>
            </div>
          </div>
        </aside>

        {/* Main / Notes */}
        <main className="order-1 lg:order-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-bold text-green-700">Your Notes</h2>
              <button className="text-green-700 font-bold px-4 py-2 rounded hover:bg-green-100 bg-green-200" onClick={handleadd}>
                create new
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.length === 0 && <div className="text-gray-400">No notes found.</div>}
              {notes.map((note) => (
                <div key={note.id} className="bg-white/20 rounded-xl shadow p-4 border border-white/30">
                  <div className="font-bold text-lg mb-2">{note.title}</div>
                  <div className="mb-2 text-sm">{note.content}</div>
                  <div className="flex gap-1">
                    <button className="bg-green-800 hover:bg-green-700 text-white px-2 py-1 rounded" onClick={() => handleEdit(note)}>
                      Edit
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(note.id)}>
                      Delete
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded" onClick={() => openShareModal(note.id)}>
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Share modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Share note</h4>
              <button className="text-white" onClick={closeShareModal}>✕</button>
            </div>

            {shareMsg && <div className="mb-3 text-sm text-green-600 bg-green-100 p-2 rounded">{shareMsg}</div>}

            {friends.length === 0 ? (
              <div className="text-gray-400 mb-4">You have no friends to share with.</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto mb-4">
                {friends.map((f) => (
                  <div key={f.id ?? f._id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                    <div>
                      <div className="font-medium text-sm">{f.name ?? f.username ?? f.email}</div>
                      <div className="text-xs text-gray-300">{f.email ?? ""}</div>
                    </div>
                    <div>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        onClick={() => handleShareToFriend(f.id ?? f._id)}
                        disabled={sharingInProgress}
                      >
                        {sharingInProgress ? "Sharing..." : "Share"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button className="bg-gray-500 text-white px-3 py-1 rounded" onClick={closeShareModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}