import { useEffect, useState } from "react";
import { ArrowLeft, Disc3, Play } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { usePlayer } from "../player/PlayerContext";
import { TrackRow } from "../components/MusicViews";
import { EmptyState, ErrorState, LoadingState } from "../components/ContentStates";

export default function AlbumPage() {
  const { albumId } = useParams();
  const { playTrack } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlbum() {
    setLoading(true);
    setError("");
    try {
      const result = await api.getAlbum(albumId);
      setAlbum(result.album);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAlbum(); }, [albumId]);

  if (loading) return <div className="page-content"><LoadingState label="Opening collection…" /></div>;
  if (error) return <div className="page-content"><ErrorState message={error} onRetry={loadAlbum} /></div>;
  if (!album) return <div className="page-content"><EmptyState title="Collection not found" description="It may have been removed or the link is no longer available." icon={Disc3} /></div>;

  const tracks = Array.isArray(album.musics) ? album.musics.filter(Boolean) : [];
  const artistName = typeof album.artist === "object" ? album.artist?.username : "Pavi artist";

  return (
    <div className="page-content">
      <div className="topline"><Link to="/albums" className="back-link"><ArrowLeft size={15} /> Collections</Link><span className="topline-time">COLLECTION</span></div>
      <section className="album-hero">
        <div className="album-hero-art"><div className="album-art-disc"><span /></div><span className="album-art-note">P</span></div>
        <div className="album-hero-copy">
          <span className="eyebrow">ARTIST COLLECTION</span>
          <h1>{album.title}</h1>
          <p>Collected by <strong>{artistName}</strong> <i /> {tracks.length} {tracks.length === 1 ? "track" : "tracks"}</p>
          <button className="primary-button play-collection" type="button" onClick={() => tracks[0] && playTrack(tracks[0], tracks)} disabled={!tracks.length}><Play size={16} fill="currentColor" /> Play collection</button>
        </div>
      </section>
      <section className="discovery-section">
        <div className="section-heading"><div><span className="eyebrow">IN THIS COLLECTION</span><h2>Tracklist</h2></div><span className="section-count">{tracks.length} TRACKS</span></div>
        {tracks.length ? <div className="track-list">{tracks.map((track, index) => <TrackRow key={track._id} track={track} tracks={tracks} index={index} />)}</div> : <EmptyState title="No tracks in this collection" description="This artist hasn’t added tracks yet." icon={Disc3} />}
      </section>
    </div>
  );
}
