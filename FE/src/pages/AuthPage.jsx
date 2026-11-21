import { useState } from "react";
import { ArrowRight, Headphones, LoaderCircle, Music2 } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, loading, login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="screen-loader"><span className="brand-mark" />Loading Pavi…</div>;
  if (user) return <Navigate to={user.role === "artist" ? "/artist" : "/home"} replace />;

  function update(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const currentUser = isRegister
        ? await register(values)
        : await login({ username: values.username, password: values.password });
      const destination = location.state?.from?.pathname;
      navigate(destination || (currentUser.role === "artist" ? "/artist" : "/home"), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-showcase">
        <Link to="/" className="auth-brand" aria-label="Pavi"><span className="brand-mark"><span /></span><span className="brand-name">pavi<span>.</span></span></Link>
        <div className="auth-showcase-copy">
          <span className="eyebrow">A HOME FOR EVERY FREQUENCY</span>
          <h1>Find the sound<br />that feels like <em>you.</em></h1>
          <p>Discover independent music, build your collection, or put your own work out into the world.</p>
          <div className="auth-showcase-foot"><Music2 size={17} /><span>Made for listeners. Built for artists.</span></div>
        </div>
        <div className="auth-artwork">
          <div className="auth-art-disc"><span /><i /><b /></div>
          <div className="auth-art-line auth-art-line-one" />
          <div className="auth-art-line auth-art-line-two" />
          <div className="auth-art-stamp"><Headphones size={17} /><span>STAY<br />IN TUNE</span></div>
        </div>
      </div>
      <main className="auth-panel">
        <div className="auth-form-wrap">
          <span className="auth-mobile-brand"><span className="brand-mark"><span /></span><span className="brand-name">pavi<span>.</span></span></span>
          <span className="eyebrow">{isRegister ? "YOUR NEXT CHAPTER" : "WELCOME BACK"}</span>
          <h2>{isRegister ? "Join the rhythm." : "Good to have you back."}</h2>
          <p className="auth-intro">{isRegister ? "Create your account and make room for more music." : "Sign in and pick up right where the music left off."}</p>

          <form onSubmit={submit} className="form-stack">
            {isRegister && (
              <>
                <label className="field-label">Username
                  <input name="username" value={values.username} onChange={update} placeholder="How should we call you?" autoComplete="username" required minLength={2} maxLength={40} />
                </label>
                <label className="field-label">Email
                  <input name="email" type="email" value={values.email} onChange={update} placeholder="you@example.com" autoComplete="email" required />
                </label>
              </>
            )}
            {!isRegister && (
              <label className="field-label">Username or email
                <input name="username" value={values.username} onChange={update} placeholder="Your username or email" autoComplete="username" required />
              </label>
            )}
            <label className="field-label">Password
              <input name="password" type="password" value={values.password} onChange={update} placeholder="Enter your password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : undefined} />
            </label>
            {isRegister && (
              <fieldset className="role-picker">
                <legend>I’m here to</legend>
                <label className={`role-option${values.role === "user" ? " role-option-active" : ""}`}>
                  <input type="radio" name="role" value="user" checked={values.role === "user"} onChange={update} />
                  <Headphones size={17} /><span><strong>Listen</strong><small>Explore music</small></span>
                </label>
                <label className={`role-option${values.role === "artist" ? " role-option-active" : ""}`}>
                  <input type="radio" name="role" value="artist" checked={values.role === "artist"} onChange={update} />
                  <Music2 size={17} /><span><strong>Create</strong><small>Share your music</small></span>
                </label>
              </fieldset>
            )}
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary-button auth-submit" type="submit" disabled={submitting}>
              {submitting ? <LoaderCircle className="spin" size={18} /> : <>{isRegister ? "Create account" : "Sign in"} <ArrowRight size={17} /></>}
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? "Already part of Pavi?" : "New to Pavi?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
          </p>
          <p className="auth-privacy">By continuing, you agree to keep the music and the community kind.</p>
        </div>
      </main>
    </div>
  );
}
