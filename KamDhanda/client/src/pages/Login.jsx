import React, { useState } from "react";
import { Mail, LockKeyhole, LogIn, Loader2, Eye, EyeOff, Briefcase, ArrowRight, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/Logo.png";
import { useForm } from "react-hook-form";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { serverObj } from "../config/serverConfig";
import { handleErrorMsg, handleSuccessMsg } from "../config/toast";
import { useDispatch } from "react-redux";
import { addUser } from "../store/slices/authSlice";
import { motion } from "framer-motion";

const RawInput = React.forwardRef(({ label, icon: Icon, type = "text", placeholder, error, inputClassName = "", ...rest }, ref) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative flex items-center">
        {Icon && <span className="absolute left-4 text-slate-400"><Icon size={18} /></span>}
        <input
          ref={ref}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          className={`w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm ${Icon ? 'pl-11' : ''} ${inputClassName}`}
          style={isPassword ? { paddingRight: "40px" } : {}}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
});
RawInput.displayName = "RawInput";

const Login = () => {
  const serverAPI = serverObj.serverAPI;
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: regOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm();

  const getNav = (role) => ({ Seeker: "/seeker", Client: "/client", Admin: "/admin" }[role] || "/");

  // Timer logic for Resend OTP
  React.useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleLoginStep1 = (data) => {
    setLoading(true);
    axios.post(`${serverAPI}/user/login-send-otp`, data)
      .then((res) => {
        handleSuccessMsg(res.data.message);
        setLoginEmail(data.email);
        setLoginPassword(data.password);
        setOtpSent(true);
        setResendTimer(60); // Start 60s countdown
      })
      .catch((err) => handleErrorMsg(err?.response?.data?.message || "Verification failed!"))
      .finally(() => setLoading(false));
  };

  const handleResendOtp = () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    axios.post(`${serverAPI}/user/login-send-otp`, { email: loginEmail, password: loginPassword })
      .then((res) => {
        handleSuccessMsg("New verification code sent!");
        setResendTimer(60);
      })
      .catch((err) => handleErrorMsg(err?.response?.data?.message || "Failed to resend OTP."))
      .finally(() => setIsResending(false));
  };

  const handleLoginStep2 = ({ otp }) => {
    setLoading(true);
    axios.post(`${serverAPI}/user/normalLogin`, { email: loginEmail, otp }, { withCredentials: true })
      .then((res) => {
        handleSuccessMsg(res.data.message);
        dispatch(addUser({ user: res.data.user, role: res.data.user.role }));
        navigate(getNav(res.data.user.role));
      })
      .catch((err) => handleErrorMsg(err?.response?.data?.message || "Verification failed!"))
      .finally(() => setLoading(false));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    setLoading(true);
    axios.post(`${serverAPI}/user/google-auth`, { token: credentialResponse.credential, role: "Client" }, { withCredentials: true })
      .then((res) => {
        handleSuccessMsg(res.data.message);
        dispatch(addUser({ user: res.data.user, role: res.data.user.role }));
        navigate(getNav(res.data.user.role));
      })
      .catch((err) => handleErrorMsg(err?.response?.data?.message || "Google Login Failed!"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations matching Landing Page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1200px] pointer-events-none -space-y-32 z-0 opacity-40">
        <div className="w-[600px] h-[600px] bg-purple-300 rounded-full blur-[100px] absolute -top-40 -left-20 mix-blend-multiply opacity-30"></div>
        <div className="w-[600px] h-[600px] bg-indigo-300 rounded-full blur-[100px] absolute top-20 right-0 mix-blend-multiply opacity-30"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 flex overflow-hidden relative z-10"
      >
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <Link to="/" className="flex items-center gap-2 mb-10 group w-fit">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <img src={logo} alt="Logo" className="w-6 h-6 brightness-0 invert" style={{ filter: "brightness(0) invert(1)" }} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight group-hover:opacity-80 transition">
              KamDhanda
            </span>
          </Link>

          {!otpSent ? (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-6">
                Step 1 of 2 — Welcome Back
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Log in to your account</h1>
              <p className="text-slate-500 mb-8">Enter your credentials to receive a secure OTP.</p>

              <form onSubmit={handleSubmit(handleLoginStep1)} className="space-y-5">
                <RawInput
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="name@company.com"
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email is required!",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email!" },
                  })}
                />
                <RawInput
                  label="Password"
                  type="password"
                  icon={LockKeyhole}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register("password", { required: "Password is required!" })}
                />

                <div className="flex items-center justify-between mt-2 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-medium">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</Link>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200 disabled:opacity-70 disabled:active:scale-100">
                  {loading ? <><Loader2 className="animate-spin" size={18} /> Verifying...</> : <><LogIn size={18} /> Continue with Email</>}
                </button>
              </form>

              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Or login with</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={() => handleErrorMsg("Google Login Failed")} 
                  theme="outline" 
                  shape="pill" 
                  size="large"
                />
              </div>

              <p className="text-center text-sm font-medium text-slate-500 mt-8">
                Don't have an account? <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Create one for free</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-semibold mb-6">
                Step 2 of 2 — Verify OTP
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Check your inbox</h1>
              <p className="text-slate-500 mb-6">We sent a 6-digit verification code to your email.</p>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Mail className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-slate-700">Verification code sent to <strong className="text-indigo-700">{loginEmail}</strong></p>
              </div>

              <form onSubmit={handleOtpSubmit(handleLoginStep2)} className="space-y-6">
                <RawInput
                  label="Enter 6-Digit Code"
                  type="text"
                  icon={LockKeyhole}
                  placeholder="123456"
                  error={otpErrors.otp?.message}
                  maxLength={6}
                  inputClassName="tracking-[0.5em] text-center text-xl font-mono"
                  {...regOtp("otp", {
                    required: "OTP is required!",
                    minLength: { value: 6, message: "OTP must be 6 digits" },
                    maxLength: { value: 6, message: "OTP must be 6 digits" },
                    pattern: { value: /^[0-9]+$/, message: "Only numbers allowed" },
                  })}
                />
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200 disabled:opacity-70">
                  {loading ? <><Loader2 className="animate-spin" size={18} /> Verifying...</> : <><CheckCircle size={18} /> Verify Code</>}
                </button>
              </form>

              <div className="text-center mt-8">
                <p className="text-sm font-medium text-slate-500">
                  {resendTimer > 0 ? (
                    <>Resend code in <span className="text-indigo-600 font-bold">{resendTimer}s</span></>
                  ) : (
                    <>
                      Didn't receive the code?{" "}
                      <button 
                        onClick={handleResendOtp} 
                        disabled={isResending}
                        className="text-indigo-600 font-bold hover:underline disabled:opacity-50"
                      >
                        {isResending ? "Sending..." : "Resend OTP"}
                      </button>
                    </>
                  )}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                   <button onClick={() => setOtpSent(false)} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Wrong email? Go back</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Side: Graphic/Info (Visible only on Desktop) */}
        <div className="hidden md:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 mix-blend-multiply z-0"></div>
          
          <div className="relative z-10 pt-4">
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              One platform.<br/>
              Endless <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">opportunities.</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-sm">
              Whether you're looking to hire elite talent or seeking your next big career flex, KamDhanda streamlines the entire process securely.
            </p>
            
            <div className="space-y-4">
              {[
                { top: "New proposal received", sub: "UI/UX Redesign — \u20B945,000", time: "2m ago", bg: "bg-indigo-500" },
                { top: "Job application shortlisted", sub: "React Developer @ TechCorp", time: "17m ago", bg: "bg-emerald-500" },
                { top: "Milestone marked complete", sub: "E-Commerce App — Phase 2", time: "1h ago", bg: "bg-purple-500" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 text-white">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.bg}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.top}</p>
                    <p className="text-xs text-slate-400">{item.sub}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex gap-6 text-white border-t border-white/10 pt-6 mt-8">
            <div>
              <p className="text-2xl font-bold">12k+</p>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Professionals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">98%</p>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Satisfaction</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;