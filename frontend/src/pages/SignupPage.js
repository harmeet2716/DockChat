import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Phone, Lock, Eye, EyeOff, ArrowRight, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";

export function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.email || !formData.phoneNumber || !formData.password || !formData.confirmPassword) {
      return setError("Please fill in all required fields.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }

    // Strong password check (simple version)
    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters long.");
    }

    setLoading(true);
    setError("");
    try {
      // The backend will need to handle the lack of 'username' or auto-generate one
      const { confirmPassword, ...signupData } = formData;
      const res = await register(signupData);
      
      if (res.token) {
        navigate("/dashboard");
      } else {
        console.error("Backend Error Details:", res);
        setError(res.message || "Registration failed.");
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
          <h2 className="text-3xl font-bold text-[#075E54] tracking-tight mb-2">DockChat</h2>
          <p className="text-slate-500 font-medium">Join our Community.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075E54]/10 focus:border-[#075E54] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={18} />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Contact Number"
                required
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075E54]/10 focus:border-[#075E54] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#075E54] transition" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#075E54]/10 focus:border-[#075E54] transition-all shadow-sm"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/10 hover:shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : "Create Account"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-rose-500 text-xs font-bold bg-rose-50 border border-rose-100 p-3 rounded-lg animate-shake">
            {error}
          </p>
        )}

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#075E54] font-bold hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
