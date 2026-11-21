import { ArrowUpRight, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlayer } from "../player/PlayerContext";
import { TrackArtwork } from "./AppShell";

export function TrackRow({ track, tracks = [], index }) {
  const { track: currentTrack, playing, playTrack, togglePlayback } = usePlayer();
  const selected = currentTrack?._id === track._id;
  const artistName = typeof track.artist === "object" ? track.artist?.username : "Independent artist";

  function handlePlayback() {
    if (selected) togglePlayback();
    else playTrack(track, tracks);
  }

  return (
    <div className={`track-row${selected ? " track-row-selected" : ""}`}>
      <button className="track-play-button" type="button" aria-label={`${selected && playing ? "Pause" : "Play"} ${track.title}`} onClick={handlePlayback}>
        {selected && playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
      </button>
      <span className="track-index">{String(index + 1).padStart(2, "0")}</span>
      <TrackArtwork track={track} small />
      <div className="track-row-info">
        <Link to={`/tracks/${track._id}`} className="track-title-link">{track.title}</Link>
        <span>{artistName}</span>
      </div>
      <Link to={`/tracks/${track._id}`} className="track-open-button" aria-label={`Open ${track.title}`}><ArrowUpRight size={16} /></Link>
    </div>
  );
}

export function AlbumCard({ album }) {
  const count = Array.isArray(album.musics) ? album.musics.filter(Boolean).length : 0;
  const artistName = typeof album.artist === "object" ? album.artist?.username : "Pavi artist";

  return (
    <Link className="album-card" to={`/albums/${album._id}`}>
      <div className="album-art">
        <div className="album-art-disc"><span /></div>
        <span className="album-art-note">P</span>
      </div>
      <div className="album-card-copy">
        <strong>{album.title}</strong>
        <span>{artistName} <i /> {count} {count === 1 ? "track" : "tracks"}</span>
      </div>
    </Link>
  );
}
