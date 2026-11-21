import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Disc3, FileAudio2, LoaderCircle, Mic2, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { AlbumCard, TrackRow } from "../components/MusicViews";
import { EmptyState, ErrorState, LoadingState, PageHeading } from "../components/ContentStates";

export default function ArtistDashboard() {
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const uploadFormRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  const loadStudio = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const [musicResult, albumResult] = await Promise.all([api.listMyMusic(), api.listMyAlbums()]);
      setTracks(musicResult.musics || []);
      setAlbums(albumResult.albums || []);
    } catch (requestError) {
      setPageError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudio(); }, [loadStudio]);

  async function handleUpload(event) {
    event.preventDefault();
    setActionError("");
    if (!file) {
      setActionError("Choose an audio file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("music", file);
    setUploading(true);
    try {
      await api.uploadMusic(formData);
      setTitle("");
      setFile(null);
      uploadFormRef.current?.reset();
      await loadStudio();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setUploading(false);
    }
  }

  async function saveTrack(trackId) {
    setActionError("");
    setSavingEdit(true);
    try {
      const result = await api.updateMusic(trackId, { title: editTitle });
      setTracks((current) => current.map((track) => track._id === trackId ? result.music : track));
      setEditingId("");
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeTrack(track) {
    if (!window.confirm(`Delete “${track.title}” from your music? This cannot be undone.`)) return;
    setActionError("");
    try {
      await api.deleteMusic(track._id);
      setTracks((current) => current.filter((item) => item._id !== track._id));
      setSelectedTracks((current) => current.filter((id) => id !== track._id));
      setAlbums((current) => current.map((album) => ({
        ...album,
        musics: (album.musics || []).filter((item) => item && item._id !== track._id)
      })));
    } catch (requestError) {
      setActionError(requestError.message);
    }
  }

  function toggleSelected(trackId) {
    setSelectedTracks((current) => current.includes(trackId)
      ? current.filter((id) => id !== trackId)
      : [...current, trackId]);
  }

  async function createCollection(event) {
    event.preventDefault();
    setActionError("");
    setCreatingAlbum(true);
    try {
      await api.createAlbum({ title: albumTitle, musics: selectedTracks });
      setAlbumTitle("");
      setSelectedTracks([]);
      await loadStudio();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setCreatingAlbum(false);
    }
  }

  return (
    <div className="page-content artist-page">
      <div className="topline"><span className="topline-status"><span /> CREATOR SPACE</span><span className="topline-time">PAVI / STUDIO</span></div>
      <PageHeading eyebrow="YOUR MUSIC, YOUR WAY" title="The studio" description="Share new work, shape your catalog, and bring tracks together." action={<span className="studio-badge"><Mic2 size={14} /> ARTIST</span>} />

      <section className="studio-upload">
        <div className="studio-upload-heading"><div className="studio-icon"><Upload size={19} /></div><div><span className="eyebrow">PUT IT OUT THERE</span><h2>Upload a track</h2></div></div>
        <p>Share an audio file with your listeners. Supported audio files up to 100 MB.</p>
        <form ref={uploadFormRef} className="upload-form" onSubmit={handleUpload}>
          <label className="field-label upload-title-field">Track title
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this one a name" required maxLength={120} />
          </label>
          <label className="file-picker">
            <FileAudio2 size={19} />
            <span>{file?.name || "Choose an audio file"}</span>
            <input type="file" accept="audio/*" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
            <strong>Browse</strong>
          </label>
          <button className="primary-button" type="submit" disabled={uploading}>{uploading ? <LoaderCircle className="spin" size={17} /> : <Upload size={16} />} Upload track</button>
        </form>
      </section>

      {actionError && <div className="form-error studio-error" role="alert">{actionError}</div>}
      {pageError ? <ErrorState message={pageError} onRetry={loadStudio} /> : loading ? <LoadingState label="Opening your studio…" /> : (
        <>
          <section className="discovery-section studio-library">
            <div className="section-heading">
              <div><span className="eyebrow">YOUR CATALOG</span><h2>Your music</h2></div>
              <span className="section-count">{tracks.length} {tracks.length === 1 ? "TRACK" : "TRACKS"}</span>
            </div>
            {tracks.length ? (
              <div className="studio-track-list">
                {tracks.map((track, index) => (
                  <div className="studio-track" key={track._id}>
                    {editingId === track._id ? (
                      <form className="inline-edit" onSubmit={(event) => { event.preventDefault(); saveTrack(track._id); }}>
                        <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} aria-label="Track title" required maxLength={120} autoFocus />
                        <button className="icon-button" type="submit" disabled={savingEdit} aria-label="Save track title"><Save size={17} /></button>
                        <button className="icon-button" type="button" onClick={() => setEditingId("")} aria-label="Cancel edit"><X size={17} /></button>
                      </form>
                    ) : (
                      <>
                        <div className="studio-track-main"><TrackRow track={track} tracks={tracks} index={index} /></div>
                        <div className="studio-track-actions">
                          <button className="icon-button" type="button" onClick={() => { setEditingId(track._id); setEditTitle(track.title); }} aria-label={`Edit ${track.title}`}><Pencil size={16} /></button>
                          <button className="icon-button danger-icon" type="button" onClick={() => removeTrack(track)} aria-label={`Delete ${track.title}`}><Trash2 size={16} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : <EmptyState title="Your catalog starts here" description="Upload your first track and it will appear here." icon={FileAudio2} />}
          </section>

          <section className="discovery-section collection-builder">
            <div className="section-heading"><div><span className="eyebrow">BRING TRACKS TOGETHER</span><h2>Make a collection</h2></div><span className="section-count">{selectedTracks.length} SELECTED</span></div>
            {tracks.length ? (
              <form className="collection-form" onSubmit={createCollection}>
                <label className="field-label">Collection title<input value={albumTitle} onChange={(event) => setAlbumTitle(event.target.value)} placeholder="A collection for a certain mood" required maxLength={120} /></label>
                <div className="collection-track-picker">
                  {tracks.map((track) => (
                    <label className="collection-track-option" key={track._id}>
                      <input type="checkbox" checked={selectedTracks.includes(track._id)} onChange={() => toggleSelected(track._id)} />
                      <span>{track.title}</span><small>{track.uri ? "Audio ready" : "Audio unavailable"}</small>
                    </label>
                  ))}
                </div>
                <button className="secondary-button" type="submit" disabled={creatingAlbum || !selectedTracks.length}>{creatingAlbum ? <LoaderCircle className="spin" size={16} /> : <Plus size={16} />} Create collection</button>
              </form>
            ) : <p className="helper-text">Upload a track before creating a collection.</p>}
          </section>

          <section className="discovery-section">
            <div className="section-heading"><div><span className="eyebrow">YOUR CURATION</span><h2>Your collections</h2></div><span className="section-count">{albums.length} TOTAL</span></div>
            {albums.length ? <div className="album-grid">{albums.map((album) => <AlbumCard key={album._id} album={album} />)}</div> : <EmptyState title="No collections yet" description="Choose tracks above to create your first collection." icon={Disc3} />}
          </section>
        </>
      )}
      <div className="page-endnote"><span>THANKS FOR MAKING A SOUND</span><Link to="/profile">Manage your artist profile <ArrowUpRight size={14} /></Link></div>
    </div>
  );
}
