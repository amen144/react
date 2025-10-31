"use client";
import React, { useState, useRef, useEffect } from "react";

type AudioControlsProps = {
  tracks: string[];
};

export default function AudioControls({ tracks }: AudioControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    if (currentTrack < tracks.length - 1) {
      setCurrentTrack(currentTrack + 1);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play();
        }
      }, 100);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.load();
      audioRef.current.play();
    }
  }, [currentTrack]);

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-1 bg-white/30 backdrop-blur-xs rounded px-3 py-2 shadow">
      <button
        onClick={handlePlayPause}
        className="text-green-700 font-bold px-1 py-1 rounded hover:bg-green-100"
      >
        {isPlaying ? "Pause Music" : "Play Music"}
      </button>

      <select
        value={currentTrack}
        onChange={(e) => setCurrentTrack(Number(e.target.value))}
        className="px-1 py-1 rounded border border-gray-300 text-sm text-gray-900"
      >
        {tracks.map((track, index) => (
          <option key={index} value={index}>
            Song {index + 1}
          </option>
        ))}
      </select>

      <audio
        ref={audioRef}
        src={tracks[currentTrack]}
        loop={false}
        onEnded={handleEnded}
      />
    </div>
  );
}
