import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, Disc3, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { AlbumCard, TrackRow } from "../components/MusicViews";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "../components/ContentStates";

export default function ExplorePage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [music, setMusic] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([api.listMusic({ q: search }), api.listAlbums()])
      .then(([musicResult, albumResult]) => {
        if (!active) return;
        setMusic(musicResult.musics || []);
        setAlbums(albumResult.albums || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [search, revision]);

  return (
    <div className="page-content">
      <div className="topline">
        <span className="topline-status"><span /> YOUR LISTENING SPACE</span>
        <span className="topline-time">PAVI / 01</span>
      </div>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow"><Sparkles size={14} /> A LITTLE MORE YOU</span>
          <h1>Good music.<br /><em>Good company, {user.username}.</em></h1>
          <p>Follow a feeling. Find a new favorite.</p>
          <a className="welcome-link" href="#the-sound">Explore the collection <ArrowDownRight size={16} /></a>
        </div>
        <div className="welcome-visual" aria-hidden="true">
          <div className="welcome-record"><span /><i /></div>
          <div className="visual-orbit visual-orbit-one" />
          <div className="visual-orbit visual-orbit-two" />
          <span className="visual-caption">VOL. 01<br />PLAY WHAT MOVES YOU</span>
        </div>
        <div className="welcome-index">01 / DISCOVER</div>
      </section>

      <section className="discovery-section" id="the-sound">
        <PageHeading eyebrow="THE PAVI COLLECTION" title="Find your frequency" description="Music from artists making a sound of their own." />
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search music or artists" aria-label="Search music or artists" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">Clear</button>}
        </label>
        {error ? <ErrorState message={error} onRetry={() => setRevision((current) => current + 1)} /> : loading ? <LoadingState label="Finding the good stuff…" /> : (
          <>
            <div className="section-heading">
              <div><span className="eyebrow">{search ? "SEARCH RESULTS" : "READY WHEN YOU ARE"}</span><h2>{search ? `Results for “${search}”` : "Tracks to press play on"}</h2></div>
              <span className="section-count">{music.length} {music.length === 1 ? "TRACK" : "TRACKS"}</span>
            </div>
            {music.length ? <div className="track-list">{music.map((track, index) => <TrackRow key={track._id} track={track} tracks={music} index={index} />)}</div> : (
              <EmptyState title={search ? "No matches just yet" : "Your first track is waiting"} description={search ? "Try another title or artist name." : "New music will appear here as artists share it with Pavi."} icon={Disc3} />
            )}
          </>
        )}
      </section>

      {!search && (
        <section className="discovery-section album-section">
          <div className="section-heading">
            <div><span className="eyebrow">CURATED BY CREATORS</span><h2>Collections</h2></div>
            <Link className="subtle-link" to="/albums">All collections <ArrowRight size={15} /></Link>
          </div>
          {loading ? <LoadingState label="Loading collections…" /> : albums.length ? (
            <div className="album-grid">{albums.slice(0, 4).map((album) => <AlbumCard key={album._id} album={album} />)}</div>
          ) : <EmptyState title="No collections yet" description="Artist-curated collections will show up here." icon={Disc3} />}
        </section>
      )}
      <div className="page-endnote"><span>LISTEN CLOSELY</span><span>THE GOOD STUFF IS OUT THERE</span></div>
    </div>
  );
}
