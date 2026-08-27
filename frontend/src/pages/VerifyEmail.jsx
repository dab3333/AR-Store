import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../api/endpoints";
import { Loading } from "../components/StatusMessage";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("loading"); // loading | success | failure
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!email || !token) {
        setStatus("failure");
        setMessage("Missing verification details in the link.");
        return;
      }
      try {
        await verifyEmail(email, token);
        if (!cancelled) {
          setStatus("success");
          setMessage("Your email has been verified. You can now log in.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("failure");
          setMessage(
            err.response?.data?.message || "Verification failed. The link may have expired."
          );
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [email, token]);

  return (
    <div className="container section auth-page">
      <div className="auth-form">
        <h1>Email verification</h1>
        {status === "loading" && <Loading label="Verifying your email..." />}
        {status === "success" && (
          <>
            <p className="form-success">{message}</p>
            <Link className="btn btn-primary" to="/login">
              Go to login
            </Link>
          </>
        )}
        {status === "failure" && (
          <>
            <p className="form-error">{message}</p>
            <Link className="btn btn-secondary" to="/">
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
