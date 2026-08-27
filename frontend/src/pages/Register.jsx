import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "../context/AuthContext";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const initialForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  contact: "",
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setError("Please complete the reCAPTCHA challenge.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ ...form, recaptchaToken });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please check your details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container section auth-page">
        <div className="auth-form">
          <h1>Check your inbox</h1>
          <p>
            We&rsquo;ve sent a verification link to <strong>{form.email}</strong>. Please
            verify your email before logging in.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container section auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create an account</h1>

        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" required value={form.username} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" required value={form.address} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="contact">Contact number</label>
          <input id="contact" name="contact" required value={form.contact} onChange={handleChange} />
        </div>

        {RECAPTCHA_SITE_KEY ? (
          <div className="form-field">
            <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={setRecaptchaToken} />
          </div>
        ) : (
          <p className="form-hint">
            reCAPTCHA is disabled (VITE_RECAPTCHA_SITE_KEY is not set).
          </p>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>

        <div className="auth-links">
          <Link to="/login">Already have an account? Log in</Link>
        </div>
      </form>
    </div>
  );
}
