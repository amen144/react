// ...existing code...
"use client";
import React, { useState, useRef, useEffect } from "react";

type AudioControlsProps = {
  tracks?: string[]; // made optional
};

export default function AudioControls({ tracks }: AudioControlsProps) {
  // default playlist if none provided
  const defaultTracks = [
    "/1.mp3",
    "/2.mp3",
    "/3.mp3",
    "/4.mp3",
    "/5.mp3",
    "/6.mp3",
    "/7.mp3",
    "/8.mp3",
    "/9.mp3",
    "/10.mp3",
    "/11.mp3",
  ];

  const actualTracks = Array.isArray(tracks) && tracks.length ? tracks : defaultTracks;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  // ensure currentTrack is valid if track list changes
  useEffect(() => {
    if (currentTrack >= actualTracks.length) {
      setCurrentTrack(0);
    }
  }, [actualTracks.length, currentTrack]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // if no src available, don't attempt play
      if (!actualTracks.length) return;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    if (currentTrack < actualTracks.length - 1) {
      setCurrentTrack((c) => c + 1);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().catch(() => {});
        }
      }, 100);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      // only attempt to load/play if a valid src exists
      if (actualTracks.length) {
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, isPlaying]);

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-1 bg-white/30 backdrop-blur-xs rounded px-3 py-2 shadow">
      <button
        onClick={handlePlayPause}
        className="text-green-700 font-bold px-1 py-1 rounded hover:bg-green-100"
      >
        {isPlaying ? "Pause Music" : "Play Music"}
      </button>

      {actualTracks.length > 0 ? (
        <select
          value={currentTrack}
          onChange={(e) => setCurrentTrack(Number(e.target.value))}
          className="px-1 py-1 rounded border border-gray-300 text-sm text-gray-900"
        >
          {actualTracks.map((track, index) => (
            <option key={index} value={index}>
              Song {index + 1}
            </option>
          ))}
        </select>
      ) : (
        <div className="text-sm px-2">No tracks</div>
      )}

      {actualTracks.length > 0 && (
        <audio
          ref={audioRef}
          src={actualTracks[currentTrack]}
          loop={false}
          onEnded={handleEnded}
        />
      )}
    </div>
  );
}
// ...existing code...