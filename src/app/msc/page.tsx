"use client"; // omit this line if not using Next.js App Router

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Music2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface Song {
  id: number;
  filename: string;
  mimeType: string;
  createdAt: string;
  coverMime: string | null;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Strips extension + underscores for a cleaner display title
function prettifyName(filename: string): string {
  return filename.replace(/\.mp3$/i, "").replace(/[_-]+/g, " ");
}

function CoverThumb({ song, size }: { song: Song | null; size: number }) {
  const hasCover = song && song.coverMime;

  return (
    <div
      className="rounded bg-neutral-700 flex items-center justify-center shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      {hasCover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${API_BASE}/api/audio/${song!.id}/cover`}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <Music2 size={size * 0.4} className="text-neutral-400" />
      )}
    </div>
  );
}

export default function MusicLibrary() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/audio`)
      .then((res) => res.json())
      .then((data: Song[]) => {
        setSongs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => handleNext();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

  function playSong(song: Song) {
    if (currentSong?.id === song.id) {
      togglePlayPause();
      return;
    }
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
    // Wait a tick for the <audio> src to update before playing
    setTimeout(() => audioRef.current?.play(), 0);
  }

  function togglePlayPause() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }

  function handleNext() {
    if (!currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    const next = songs[idx + 1];
    if (next) playSong(next);
    else setIsPlaying(false);
  }

  function handlePrev() {
    if (!currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    const prev = songs[idx - 1];
    if (prev) playSong(prev);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const value = parseFloat(e.target.value);
    audio.currentTime = value;
    setProgress(value);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) audioRef.current.volume = value;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
        <p className="text-neutral-400 text-sm mt-1">
          {songs.length} {songs.length === 1 ? "song" : "songs"}
        </p>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto px-8 pb-32">
        {loading ? (
          <p className="text-neutral-400">Loading...</p>
        ) : songs.length === 0 ? (
          <p className="text-neutral-400">No songs found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-neutral-400 text-xs uppercase border-b border-neutral-800">
                <th className="py-2 w-10 font-normal">#</th>
                <th className="py-2 font-normal">Title</th>
                <th className="py-2 font-normal text-right pr-4">Added</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => {
                const isActive = currentSong?.id === song.id;
                return (
                  <tr
                    key={song.id}
                    onClick={() => playSong(song)}
                    className={`group cursor-pointer transition-colors ${
                      isActive ? "bg-neutral-800/60" : "hover:bg-neutral-800/40"
                    }`}
                  >
                    <td className="py-3 pl-2 w-10 text-neutral-400">
                      <div className="relative w-4 h-4">
                        <span
                          className={`absolute inset-0 flex items-center ${
                            isActive ? "hidden" : "group-hover:hidden"
                          }`}
                        >
                          {isActive && isPlaying ? (
                            <Music2 size={14} className="text-green-500" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <span
                          className={`absolute inset-0 items-center ${
                            isActive ? "flex" : "hidden group-hover:flex"
                          }`}
                        >
                          {isActive && isPlaying ? (
                            <Pause size={14} />
                          ) : (
                            <Play size={14} />
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {/* CHANGED: was a generic icon box, now shows the real cover */}
                        <CoverThumb song={song} size={40} />
                        <span
                          className={`text-sm truncate ${
                            isActive ? "text-green-500" : "text-white"
                          }`}
                        >
                          {prettifyName(song.filename)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right text-neutral-400 text-sm">
                      {new Date(song.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Hidden native audio element - we drive it via custom controls */}
      <audio ref={audioRef} src={currentSong ? `${API_BASE}/api/audio/${currentSong.id}` : undefined} />

      {/* Bottom player bar */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-neutral-900 border-t border-neutral-800 px-4 flex items-center justify-between">
          {/* Now playing info */}
          <div className="flex items-center gap-3 w-1/4 min-w-0">
            {/* CHANGED: was a generic icon box, now shows the real cover */}
            <CoverThumb song={currentSong} size={48} />
            <div className="min-w-0">
              <p className="text-sm truncate">{prettifyName(currentSong.filename)}</p>
              <p className="text-xs text-neutral-400 truncate">MP3</p>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex flex-col items-center gap-1 w-1/2 max-w-xl">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                className="text-neutral-400 hover:text-white text-sm"
                aria-label="Previous"
              >
                ⏮
              </button>
              <button
                onClick={togglePlayPause}
                className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition-transform"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>
              <button
                onClick={handleNext}
                className="text-neutral-400 hover:text-white text-sm"
                aria-label="Next"
              >
                ⏭
              </button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-neutral-400 w-9 text-right">
                {formatTime(progress)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onChange={handleSeek}
                className="flex-1 h-1 accent-white cursor-pointer"
              />
              <span className="text-xs text-neutral-400 w-9">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-1/4 justify-end">
            <Volume2 size={16} className="text-neutral-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 accent-white cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
