import { useEffect, useState } from "react";
import { ArrowLeft, Disc3, Pause, Play } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { usePlayer } from "../player/PlayerContext";
import { TrackArtwork } from "../components/AppShell";
import { EmptyState, ErrorState, LoadingState } from "../components/ContentStates";

export default function TrackPage() {
  const { musicId } = useParams();
  const { user } = useAuth();
  const { track: currentTrack, playing, playTrack, togglePlayback } = usePlayer();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrack() {
    setLoading(true);
    setError("");
    try {
      const result = await api.getMusic(musicId);
      setTrack(result.music);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTrack(); }, [musicId]);

  if (loading) return <div className="page-content"><LoadingState label="Loading track…" /></div>;
  if (error) return <div className="page-content"><ErrorState message={error} onRetry={loadTrack} /></div>;
  if (!track) return <div className="page-content"><EmptyState title="Track not found" description="This track may have been removed." icon={Disc3} /></div>;

  const artistName = typeof track.artist === "object" ? track.artist?.username : "Independent artist";
  const selected = currentTrack?._id === track._id;

  return (
    <div className="page-content">
      <div className="topline"><Link to={user.role === "artist" ? "/artist" : "/home"} className="back-link"><ArrowLeft size={15} /> {user.role === "artist" ? "Back to studio" : "Back to discovery"}</Link><span className="topline-time">NOW / NEXT</span></div>
      <section className="track-detail">
        <div className="track-detail-art"><TrackArtwork track={track} /></div>
        <div className="track-detail-copy">
          <span className="eyebrow">A PAVI TRACK</span>
          <h1>{track.title}</h1>
          <p>By <strong>{artistName}</strong></p>
          <button className="primary-button" type="button" onClick={() => selected ? togglePlayback() : playTrack(track)}>
            {selected && playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            {selected && playing ? "Pause track" : "Play track"}
          </button>
        </div>
      </section>
      <div className="detail-note"><span>GOOD MUSIC IS BETTER SHARED.</span><span>PRESS PLAY, STAY A WHILE.</span></div>
    </div>
  );
}
