import { useEffect, useState } from "react";
import { Disc3 } from "lucide-react";
import { api } from "../api/client";
import { AlbumCard } from "../components/MusicViews";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "../components/ContentStates";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlbums() {
    setLoading(true);
    setError("");
    try {
      const result = await api.listAlbums();
      setAlbums(result.albums || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAlbums(); }, []);

  return (
    <div className="page-content">
      <div className="topline"><span className="topline-status"><span /> LISTENING ROOM</span><span className="topline-time">PAVI / 02</span></div>
      <PageHeading eyebrow="MADE TO BE PLAYED TOGETHER" title="Collections" description="A whole mood, gathered by the artists who made it." />
      {loading ? <LoadingState label="Loading collections…" /> : error ? <ErrorState message={error} onRetry={loadAlbums} /> : albums.length ? (
        <div className="album-grid album-grid-large">{albums.map((album) => <AlbumCard key={album._id} album={album} />)}</div>
      ) : <EmptyState title="Nothing gathered here yet" description="When artists make a collection, you’ll find it here." icon={Disc3} />}
    </div>
  );
}
