import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, RefreshCw, ArrowLeft } from "lucide-react";

export function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { verifyEmail, resendEmailOTP, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || user?.email;

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return setError("Please enter the 6-digit code.");

    setLoading(true);
    setError("");
    try {
      const res = await verifyEmail(email, otp);
      if (res.message && res.message.includes("successfully")) {
        setSuccess("Email verified! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setError(res.message || "Invalid verification code.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      await resendEmailOTP(email);
      setSuccess("A new code has been sent to your email.");
    } catch (err) {
      setError("Failed to resend code.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-6 selection:bg-[#25D366]/30 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          to="/signup"
          className="mb-8 inline-flex items-center gap-2 text-[#075E54] hover:text-[#128C7E] transition-all group font-bold text-sm"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Change Email</span>
        </Link>

        <div className="p-10 rounded-[2rem] bg-white shadow-xl border border-black/[0.03] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#075E54]" />
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 mb-6 p-4 bg-[#f0f2f5] rounded-full shadow-sm flex items-center justify-center">
              <ShieldCheck className="text-[#075E54] w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#111b21] tracking-tight mb-2">Verify Email</h2>
            <p className="text-[#54656f] text-center text-sm font-medium leading-relaxed">
              Enter the 6-digit code sent to <br/>
              <span className="text-[#075E54] font-bold">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                required
                className="w-full bg-[#f0f2f5] border-none rounded-xl py-6 text-[#111b21] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#075E54]/20 transition-all tracking-[0.5em] text-center text-3xl font-bold shadow-inner"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-6 text-center text-rose-500 text-xs font-bold bg-rose-50 border border-rose-100 p-3 rounded-lg animate-shake">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-6 text-center text-[#075E54] text-xs font-bold bg-[#D1F4CC]/30 border border-[#D1F4CC] p-3 rounded-lg">
              {success}
            </p>
          )}

          <div className="mt-10 text-center">
            <button 
              onClick={handleResend}
              className="text-xs font-bold text-[#075E54] hover:underline flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} /> Resend Verification Code
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
