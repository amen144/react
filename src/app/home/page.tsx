"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import AudioControls from "../component/audioCtrl";

export default function Home() {
  const router = useRouter();

  // Music playlist
const API_URL = process.env.NEXT_PUBLIC_API_URL;


  const [name, setName] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [userID, setUserID] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedID = localStorage.getItem("userID");
    if (storedName) setName(storedName);
    if (storedID) setUserID(storedID);

    if (storedID) {
      axios
        .get(`${API_URL}/notes/${storedID}`)
        .then((res) => setNotes(res.data))
        .catch((err) => console.error(err));
    }
  }, []);

  const handleEdit = (note: any) => {
    router.push(`/../editnote/${note.id}`);
  };

  const handleDelete = async (noteId: number) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      await axios.delete(`${API_URL}/notes/${noteId}`);
      setNotes(notes.filter((note) => note.id !== noteId));
    }
  };

  const handleadd = () => {
    router.push("../addnote");
  };

  return (
    <div style={{ width: "90%" }}>
      {/* Music Controls */}
      {/* Right Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-white/30 backdrop-blur-xs rounded px-3 py-2 shadow">
      <button
        onClick={() => {
        localStorage.removeItem("userName");
        localStorage.removeItem("userID");
        router.push("/..");
        }}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
      </div>
      
      {/* Notes Section */}
      <div
      className="mt-20 p-4 bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30"
      style={{ width: "90%" }}
      >
      
        <div className="flex justify-center mb-4">
        <h2 className="text-2xl font-bold mb-4 text-green-700 note mr-5" >
        Your Notes
      </h2><br />
            <button
              className="text-green-700 font-bold px-4 py-2 rounded hover:bg-green-100 bg-green-200"
              onClick={handleadd}
            >
              create new
            </button>
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length === 0 && (
            <div className="text-gray-400">No notes found.</div>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white/20 backdrop-blur-lg rounded-xl shadow p-4 border border-white/30"
            >
              <div className="font-bold text-lg mb-2">{note.title}</div>
              <div className="mb-2 text-sm">{note.content}</div>
              <div className="flex gap-2 pl-0">
                <button
                  className="bg-green-800 hover:bg-green-700 text-white px-1 py-1 rounded"
                  onClick={() => handleEdit(note)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(note.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div> 
      </div>
    </div>
  );
}
