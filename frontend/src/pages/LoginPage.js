import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff, ArrowRight, RefreshCw, ArrowLeft, Github, Chrome } from "lucide-react";

export function LoginPage() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identity || !password) return setError("Please enter your credentials.");

    setLoading(true);
    setError("");
    try {
      const res = await loginWithPassword(identity, password);
      if (res.token) {
        navigate("/dashboard");
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 selection:bg-[#25D366]/30 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-[#075E54] hover:text-[#128C7E] transition-all group font-bold text-sm"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </Link>

        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-bold text-[#075E54] tracking-tight mb-2">Welcome Back to DockChat</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={18} />
              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Enter Mobile Number or Email"
                required
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075E54]/10 focus:border-[#075E54] transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075E54]/10 focus:border-[#075E54] transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#075E54] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-xs text-[#075E54] hover:underline font-bold">Forgot Password?</button>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/10 hover:shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : "Login"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-rose-500 text-xs font-bold bg-rose-50 border border-rose-100 p-3 rounded-lg animate-shake">
            {error}
          </p>
        )}

        <div className="mt-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="bg-white px-4 text-slate-400">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 px-6 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-600">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Google
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-600">
              <img src="https://www.svgrepo.com/show/442983/apple-logo.svg" className="w-5 h-5" alt="Apple" />
              Apple
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#075E54] font-bold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
