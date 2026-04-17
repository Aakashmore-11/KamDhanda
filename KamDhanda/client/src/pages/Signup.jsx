import React, { useState } from "react";
import { Mail, LockKeyhole, LogIn, Loader2, Eye, EyeOff, ShieldCheck, User2Icon, ArrowRight, CheckCircle2, Globe, Zap, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/Logo.png";
import { useForm } from "react-hook-form";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { serverObj } from "../config/serverConfig";
import { useDispatch } from "react-redux";
import { addUser } from "../store/slices/authSlice";
import { handleSuccessMsg, handleErrorMsg } from "../config/toast";
import { motion, AnimatePresence } from "framer-motion";

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

const Signup = () => {
  const serverAPI = serverObj.serverAPI;
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(1); // 1: Email, 2: OTP, 3: Details
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [tempData, setTempData] = useState({});
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, watch, trigger, formState: { errors: formErrors } } = useForm();
  const currentEmail = watch("email");

  const slideVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  // Timer logic for Resend OTP
  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleEmailNext = async () => {
    const isValid = await trigger("email");
    if (!isValid) return;

    setLoading(true);
    axios.post(`${serverAPI}/user/send-otp`, { email: currentEmail })
      .then(() => {
        handleSuccessMsg("Verification code sent to your email!");
        setStage(2);
        setTimer(60); // Start 60s countdown
      })
      .catch((err) => handleErrorMsg(err?.response?.data?.message || "Failed to send verification code."))
      .finally(() => setLoading(false));
  };

  const handleResendOtp = () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    axios.post(`${serverAPI}/user/send-otp`, { email: currentEmail })
      .then(() => {
        handleSuccessMsg("New verification code sent!");
        setTimer(60);
      })
      .catch((err) => handleErrorMsg(err?.response?.data?.message || "Failed to resend code."))
      .finally(() => setIsResending(false));
  };

  const handleOtpVerify = () => {
    const otp = watch("otp");
    if (!otp || otp.length !== 6) {
      handleErrorMsg("Please enter a valid 6-digit OTP.");
      return;
    }
    setVerifiedEmail(currentEmail);
    setTempData({ otp });
    setStage(3);
  };

  const onFinalSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      handleErrorMsg("Passwords do not match!");
      return;
    }

    setLoading(true);
    const endpoint = tempData.googleToken ? `${serverAPI}/user/google-auth` : `${serverAPI}/user/signUp`;
    const payload = tempData.googleToken
      ? { token: tempData.googleToken, role: data.role, password: data.password }
      : { fullName: data.fullName, email: verifiedEmail, otp: tempData.otp || data.otp, password: data.password, role: data.role };

    axios.post(endpoint, payload, { withCredentials: true })
      .then((res) => {
        handleSuccessMsg("Account created successfully!");
        dispatch(addUser({ user: res.data.user, role: res.data.user.role }));
        const rolePaths = { Seeker: "/seeker", Client: "/client", Admin: "/admin" };
        navigate(rolePaths[res.data.user.role] || "/");
      })
      .catch((err) => {
        handleErrorMsg(err?.response?.data?.message || "Signup failed! Verification code might be incorrect.");
        if (err?.response?.status === 400) setStage(2);
      })
      .finally(() => setLoading(false));
  };

  const handleGoogleSuccess = (res) => {
    // Basic decode for preview
    const payload = JSON.parse(atob(res.credential.split('.')[1]));
    setVerifiedEmail(payload.email);
    setTempData({ googleToken: res.credential });
    setStage(3);
    handleSuccessMsg("Email verified with Google! Please complete your profile.");
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
        className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 flex overflow-hidden relative z-10 min-h-[600px]"
      >
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col pt-10">
          <Link to="/" className="flex items-center gap-2 mb-10 group w-fit">
            <img src={logo} alt="KamDhanda Logo" className="h-7 w-7" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight group-hover:opacity-80 transition">
              KamDhanda
            </span>
          </Link>

          <AnimatePresence mode="wait">
            {stage === 1 && (
              <motion.div key="stage1" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-6">
                  Step 1 of 3 — Secure Onboarding
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Create your account</h1>
                <p className="text-slate-500 mb-8">Enter your email to start the secure verification process.</p>

                <div className="space-y-5">
                  <RawInput
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    placeholder="name@company.com"
                    error={formErrors.email?.message}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
                    })}
                  />
                  <button onClick={handleEmailNext} disabled={loading} className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200 disabled:opacity-70 disabled:active:scale-100">
                    {loading ? <><Loader2 className="animate-spin" size={18} /> Sending...</> : <><ShieldCheck size={18} /> Send Verification Code</>}
                  </button>
                </div>

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Or sign up with</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="flex justify-center w-full">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess} 
                    onError={() => handleErrorMsg("Google failed")} 
                    theme="outline" 
                    shape="pill" 
                    size="large"
                  />
                </div>
              </motion.div>
            )}

            {stage === 2 && (
              <motion.div key="stage2" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-semibold mb-6">
                  Step 2 of 3 — Verify Identity
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Verify your email</h1>
                <p className="text-slate-500 mb-6">We've sent a 6-digit code to <strong>{currentEmail}</strong>.</p>

                <div className="space-y-6">
                  <RawInput
                    label="Enter 6-Digit Code"
                    type="text"
                    icon={LockKeyhole}
                    placeholder="123456"
                    maxLength={6}
                    inputClassName="tracking-[0.5em] text-center text-xl font-mono"
                    {...register("otp", { required: "Code is required" })}
                  />
                  <button onClick={handleOtpVerify} disabled={loading} className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200 disabled:opacity-70">
                    <CheckCircle2 size={18} /> Verify & Continue
                  </button>
                </div>

                <div className="text-center mt-8">
                  <p className="text-sm font-medium text-slate-500">
                    {timer > 0 ? (
                      <>Resend code in <span className="text-indigo-600 font-bold">{timer}s</span></>
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
                     <button onClick={() => setStage(1)} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Wrong email? Go back</button>
                  </div>
                </div>
              </motion.div>
            )}

            {stage === 3 && (
              <motion.div key="stage3" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold mb-6">
                  Step 3 of 3 — Profile Details
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Complete profile</h1>
                <p className="text-slate-500 mb-6">Tell us a bit more about yourself to get started.</p>

                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-lg inline-flex items-center gap-2 mb-6 shadow-sm">
                  <ShieldCheck size={14} /> {verifiedEmail} Verified
                </div>

                <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-4">
                  <RawInput
                    label="Full Name"
                    icon={User2Icon}
                    placeholder="John Doe"
                    error={formErrors.fullName?.message}
                    {...register("fullName", { required: "Name is required" })}
                  />

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Type</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm appearance-none"
                        {...register("role", { required: "Please select a role" })}
                      >
                        <option value="">Choose your perspective...</option>
                        <option value="Seeker">Seeker (I want to work/find jobs)</option>
                        <option value="Client">Client (I want to hire talent)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    {formErrors.role && <p className="text-xs text-rose-500 mt-1.5 font-medium">{formErrors.role.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <RawInput
                      label="Password"
                      type="password"
                      placeholder="Min 6 chars"
                      error={formErrors.password?.message}
                      {...register("password", { required: "Required", minLength: 6 })}
                    />
                    <RawInput
                      label="Confirm"
                      type="password"
                      placeholder="Confirm"
                      error={formErrors.confirmPassword?.message}
                      {...register("confirmPassword", { required: "Required" })}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200 disabled:opacity-70">
                    {loading ? <><Loader2 className="animate-spin" size={18} /> Creating account...</> : <><LogIn size={18} /> Create Account</>}
                  </button>
                </form>

                <p className="text-center text-sm font-medium text-slate-500 mt-6 pb-4">
                  <button onClick={() => setStage(1)} className="text-indigo-600 font-bold hover:underline">Start over with a different email</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-6 text-center text-sm font-medium text-slate-500 border-t border-slate-100">
            Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign in here</Link>
          </div>
        </div>

        {/* Right Side: Graphic/Info (Visible only on Desktop) */}
        <div className="hidden md:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 mix-blend-multiply z-0"></div>
          
          <div className="relative z-10 pt-4">
            <div className="inline-block text-[10px] text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full font-bold uppercase tracking-widest mb-6 border border-rose-400/20">
              Secure Onboarding
            </div>
            <h2 className="text-3xl font-bold text-white mb-8 leading-tight">
              Unlock the power of<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">KamDhanda.</span>
            </h2>
            
            <div className="space-y-8 mt-12">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Real Identity First</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Verification ensures you're dealing with real professionals, every single time.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Instant Access</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Complete your profile and start applying or hiring in less than 2 minutes.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Dual Mode Ecosystem</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Seamlessly jump between finding freelance projects and full-time job roles.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex gap-6 text-white border-t border-white/10 pt-6 mt-8">
            <p className="text-sm text-slate-400">Join the fastest growing professional network in India.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;