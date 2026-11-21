import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.78);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (playing) {
      audio.play().then(() => setError("")).catch(() => {
        setPlaying(false);
        setError("This track could not be played. Try another one.");
      });
    } else {
      audio.pause();
    }
  }, [track, playing]);

  const playTrack = useCallback((nextTrack, tracks = []) => {
    const nextQueue = tracks.length ? tracks : [nextTrack];
    let index = nextQueue.findIndex((item) => item._id === nextTrack._id);
    if (index < 0) {
      nextQueue.unshift(nextTrack);
      index = 0;
    }
    setQueue(nextQueue);
    setQueueIndex(index);
    setTrack(nextTrack);
    setCurrentTime(0);
    setError("");
    setPlaying(true);
  }, []);

  const togglePlayback = useCallback(() => {
    if (track) setPlaying((value) => !value);
  }, [track]);

  const stepTrack = useCallback((direction) => {
    if (queue.length < 2) {
      if (direction < 0 && audioRef.current) audioRef.current.currentTime = 0;
      if (direction > 0) setPlaying(false);
      return;
    }
    const nextIndex = (queueIndex + direction + queue.length) % queue.length;
    setQueueIndex(nextIndex);
    setTrack(queue[nextIndex]);
    setCurrentTime(0);
    setPlaying(true);
    setError("");
  }, [queue, queueIndex]);

  const seek = useCallback((time) => {
    if (audioRef.current && Number.isFinite(time)) audioRef.current.currentTime = time;
  }, []);

  const value = useMemo(() => ({
    track,
    playing,
    currentTime,
    duration,
    volume,
    error,
    playTrack,
    togglePlayback,
    nextTrack: () => stepTrack(1),
    previousTrack: () => stepTrack(-1),
    seek,
    setVolume
  }), [track, playing, currentTime, duration, volume, error, playTrack, togglePlayback, stepTrack, seek]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={track?.uri || undefined}
        preload="metadata"
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={() => stepTrack(1)}
        onError={() => track && setError("This track could not be loaded.")}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used inside PlayerProvider");
  return context;
}
