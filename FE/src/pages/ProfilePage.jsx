import { useState } from "react";
import { Check, LoaderCircle, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import { PageHeading } from "../components/ContentStates";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const result = await api.updateProfile({ username, email });
      updateUser(result.user);
      setUsername(result.user.username);
      setEmail(result.user.email);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content">
      <div className="topline"><span className="topline-status"><span /> YOUR PAVI ACCOUNT</span><span className="topline-time">ACCOUNT / 01</span></div>
      <PageHeading eyebrow="THE PERSON BEHIND THE PLAYLIST" title="Your profile" description="Keep your details current. Your music follows you." />
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar"><UserRound size={30} /></div>
          <span className="eyebrow">{user.role === "artist" ? "PAVI ARTIST" : "PAVI LISTENER"}</span>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
          <div className="profile-member"><span className="profile-dot" /> Account active</div>
        </div>
        <form className="profile-form" onSubmit={submit}>
          <span className="eyebrow">ACCOUNT DETAILS</span>
          <h2>Edit your details</h2>
          <label className="field-label">Username<input value={username} onChange={(event) => setUsername(event.target.value)} required minLength={2} maxLength={40} /></label>
          <label className="field-label">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          {saved && <div className="form-success" role="status"><Check size={16} /> Your profile is up to date.</div>}
          <button className="primary-button" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Check size={16} />} Save changes</button>
        </form>
      </div>
    </div>
  );
}
