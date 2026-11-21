import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Compass, Disc3, Headphones, LogOut, Mic2, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { usePlayer } from "../player/PlayerContext";

function Brand({ compact = false }) {
  return (
    <span className={`brand-lockup${compact ? " brand-lockup-compact" : ""}`}>
      <span className="brand-mark"><span /></span>
      {!compact && <span className="brand-name">pavi<span>.</span></span>}
    </span>
  );
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function TrackArtwork({ track, small = false }) {
  const title = track?.title || "Pavi";
  return (
    <div className={`track-art${small ? " track-art-small" : ""}`} aria-label={`${title} artwork`}>
      <span className="art-orbit art-orbit-one" />
      <span className="art-orbit art-orbit-two" />
      <span className="art-note">♪</span>
    </div>
  );
}

function NowPlaying() {
  const {
    track, playing, currentTime, duration, volume, error, togglePlayback,
    nextTrack, previousTrack, seek, setVolume
  } = usePlayer();
  const artistName = typeof track?.artist === "object" ? track.artist?.username : "Pavi artist";

  return (
    <footer className="player-bar">
      <div className="player-track">
        {track ? <TrackArtwork track={track} small /> : <div className="player-art-empty"><Headphones size={19} /></div>}
        <div className="player-track-copy">
          <strong>{track?.title || "Choose a track"}</strong>
          <span>{track ? artistName : "Your next favorite is waiting"}</span>
        </div>
      </div>
      <div className="player-controls">
        <div className="player-buttons">
          <button className="icon-button player-skip" type="button" aria-label="Previous track" onClick={previousTrack}><SkipBackIcon /></button>
          <button className="play-button" type="button" aria-label={playing ? "Pause" : "Play"} onClick={togglePlayback} disabled={!track}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="icon-button player-skip" type="button" aria-label="Next track" onClick={nextTrack}><SkipForwardIcon /></button>
        </div>
        <div className="timeline">
          <span>{formatTime(currentTime)}</span>
          <input
            aria-label="Seek through track"
            type="range"
            min="0"
            max={duration || 0}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            style={{ "--range-progress": `${duration ? (currentTime / duration) * 100 : 0}%` }}
            disabled={!track}
          />
          <span>{formatTime(duration)}</span>
        </div>
        {error && <span className="player-error">{error}</span>}
      </div>
      <div className="player-volume">
        <span className="volume-icon" aria-hidden="true">⌁</span>
        <input
          aria-label="Volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          style={{ "--range-progress": `${volume * 100}%` }}
        />
      </div>
    </footer>
  );
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.8v12.4c0 .7.8 1.1 1.4.7l9-6.2a.9.9 0 0 0 0-1.4l-9-6.2c-.6-.4-1.4 0-1.4.7Z" fill="currentColor" /></svg>;
}

function PauseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5.5h2.8v13H7.5zm6.2 0h2.8v13h-2.8z" fill="currentColor" /></svg>;
}

function SkipBackIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zm12.5 1.1v11.8c0 .7-.8 1.1-1.4.7l-8-5.9a.9.9 0 0 1 0-1.4l8-5.9c.6-.4 1.4 0 1.4.7Z" fill="currentColor" /></svg>;
}

function SkipForwardIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM5.5 6.1v11.8c0 .7.8 1.1 1.4.7l8-5.9a.9.9 0 0 0 0-1.4l-8-5.9c-.6-.4-1.4 0-1.4.7Z" fill="currentColor" /></svg>;
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");
  const isArtist = user.role === "artist";
  const navItems = isArtist
    ? [{ to: "/artist", label: "Studio", icon: Mic2 }]
    : [{ to: "/home", label: "Discover", icon: Compass }, { to: "/albums", label: "Collections", icon: Disc3 }];

  async function handleLogout() {
    setLogoutError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(error.message);
    }
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <NavLink to={isArtist ? "/artist" : "/home"} className="sidebar-brand" aria-label="Pavi home"><Brand /></NavLink>
        <div className="sidebar-label">{isArtist ? "CREATOR SPACE" : "YOUR SPACE"}</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`}>
            <UserRound size={18} strokeWidth={1.8} /><span>Profile</span>
          </NavLink>
        </nav>
        <button className="icon-button mobile-signout" onClick={handleLogout} type="button" aria-label="Sign out"><LogOut size={17} /></button>
        <div className="sidebar-spacer" />
        <div className="sidebar-user">
          <div className="avatar">{(user.username || "P").slice(0, 1).toUpperCase()}</div>
          <div className="sidebar-user-copy">
            <strong>{user.username}</strong>
            <span>{isArtist ? "Artist" : "Listener"}</span>
          </div>
          <button className="icon-button signout-button" onClick={handleLogout} type="button" aria-label="Sign out"><LogOut size={17} /></button>
        </div>
        <div className="sidebar-footnote"><Brand compact /> <span>Sound that stays with you.</span></div>
      </aside>
      <main className="main-panel">
        {logoutError && <div className="logout-error" role="alert">{logoutError}</div>}
        <Outlet />
      </main>
      <NowPlaying />
    </div>
  );
}

export { TrackArtwork };
