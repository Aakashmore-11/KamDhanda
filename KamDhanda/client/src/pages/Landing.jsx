import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  Briefcase, Search, MessageSquare, ShieldCheck, Bell, User,
  CheckCircle, ArrowRight, Star, ChevronRight, Menu, X, Play
} from 'lucide-react';
import AIChatbot from '../components/common/AIChatbot';

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200 z-50 transition-all">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/Logo.png" alt="KamDhanda Logo" className="h-8 w-8" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                KamDhanda
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">How it Works</a>
              <a href="#testimonials" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Testimonials</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                Log in
              </NavLink>
              <NavLink to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md shadow-indigo-200 hover:shadow-lg">
                Sign Up
              </NavLink>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden bg-white border-b border-slate-200"
          >
            <div className="px-4 py-4 space-y-4 flex flex-col">
              <a href="#features" className="text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
              <a href="#testimonials" className="text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
              <hr className="border-slate-100" />
              <NavLink to="/login" className="text-slate-600 font-medium text-center py-2">Log in</NavLink>
              <NavLink to="/signup" className="bg-indigo-600 text-white text-center py-2 rounded-full font-medium">Sign Up</NavLink>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-12 xl:px-16 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -space-y-32 z-0 opacity-40 overflow-hidden">
          <div className="w-[600px] h-[600px] bg-purple-300 rounded-full blur-[100px] absolute -top-40 -left-20 mix-blend-multiply opacity-50"></div>
          <div className="w-[600px] h-[600px] bg-indigo-300 rounded-full blur-[100px] absolute top-20 right-0 mix-blend-multiply opacity-50"></div>
          <div className="w-[400px] h-[400px] bg-blue-300 rounded-full blur-[100px] absolute -bottom-20 left-40 mix-blend-multiply opacity-50"></div>
        </div>

        <div className="w-full flex flex-col lg:flex-row items-center gap-12 relative z-10 transition-all duration-300">
          <motion.div
            initial="hidden" animate="visible" variants={staggerContainer}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
              The #1 Platform for Talent & Opportunities
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Find Work. <br className="hidden lg:block" />
              Hire Talent. <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Grow Together.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              KamDhanda is the modern workspace that connects elite freelancers, ambitious job seekers, and forward-thinking employers in one powerful platform.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <NavLink to="/signup?mode=seeker" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-600/30 transform hover:-translate-y-1">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </NavLink>
              <NavLink to="/signup?mode=client" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-slate-800 border border-slate-200 font-semibold  hover:bg-slate-50 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 shadow-sm">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Post a Job
              </NavLink>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-10 h-10 rounded-full border-2 border-white pointer-events-none" />
                ))}
              </div>
              <div>
                <p className="flex items-center text-amber-500"><Star className="h-4 w-4 fill-current mr-1" /> 4.9/5 Average Rating</p>
                <p>Trusted by 10,000+ Users</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-white p-2">
              <div className="absolute top-4 left-4 flex gap-1.5 z-20">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <img src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Platform Dashboard" className="rounded-xl w-full object-cover h-[400px] lg:h-[500px]" />

              {/* Floating UI Elements */}
              <div className="absolute -left-6 lg:-left-12 top-1/4 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce hover:animate-none transition-all" style={{ animationDuration: '3s' }}>
                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Project Completed!</p>
                  <p className="text-xs text-slate-500">Payment Released: ₹ 1200</p>
                </div>
              </div>

              <div className="absolute -right-6 lg:-right-12 bottom-1/4 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="relative">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
                  <img src="https://i.pravatar.cc/100?img=33" className="w-12 h-12 rounded-full" alt="msg" />
                </div>
                <div>
                  <p className="text-xs text-indigo-600 font-semibold">New Message</p>
                  <p className="font-bold text-slate-800 text-sm">"The design looks amazing..."</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CLIENT/SEEKER SPLIT SECTION ===== */}
      <section className="py-20 bg-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">One Platform, Two Powerful Views</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Seamlessly switch between finding top talent and hunting for your next big opportunity.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 group hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                <Briefcase className="text-white h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">I'm a Client</h3>
              <p className="text-slate-600 mb-6 min-h-[80px]">Looking to build something great? Post your project or job, receive competitive proposals, and collaborate with top-tier verified professionals.</p>
              <ul className="space-y-3 mb-8 text-slate-600 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-indigo-500" /> Post unlimited projects</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-indigo-500" /> Verified candidate pool</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-indigo-500" /> Real-time chat & milestone tracking</li>
              </ul>
              <NavLink to="/signup" className="inline-flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700">
                Hire Talent <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
              </NavLink>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 border border-purple-100 group hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
                <Search className="text-white h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">I'm a Seeker</h3>
              <p className="text-slate-600 mb-6 min-h-[80px]">Ready to grow your career? Create your stellar profile, apply for high-paying freelance gigs, or land a full-time modern job instantly.</p>
              <ul className="space-y-3 mb-8 text-slate-600 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-purple-500" /> Dual-mode: Freelance or Full-time Jobs</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-purple-500" /> Smart application tracking</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-purple-500" /> Build a robust verifiable portfolio</li>
              </ul>
              <NavLink to="/signup" className="inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                Find Work <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-indigo-600 tracking-wider uppercase mb-2">Why KamDhanda</h2>
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900">Everything you need to succeed</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Briefcase, color: 'bg-blue-100 text-blue-600', title: 'Freelance & Full-time', desc: 'Seamlessly toggle between contract gigs and permanent job applications.' },
              { icon: MessageSquare, color: 'bg-emerald-100 text-emerald-600', title: 'Real-Time Chat', desc: 'WhatsApp-style messaging with instant alerts and rich file attachments.' },
              { icon: ShieldCheck, color: 'bg-indigo-100 text-indigo-600', title: 'Secure Identity', desc: 'Google Authentication and multi-step verification keeps the platform scam-free.' },
              { icon: Bell, color: 'bg-amber-100 text-amber-600', title: 'Instant Notifications', desc: 'Never miss an opportunity with our robust real-time notification engine.' },
              { icon: User, color: 'bg-rose-100 text-rose-600', title: 'Rich Profiles', desc: 'Showcase your skills with a beautiful portfolio, bio, and experience timeline.' },
              { icon: Briefcase, color: 'bg-purple-100 text-purple-600', title: 'Project Management', desc: 'Track proposals, monitor active projects, and finalize deliveries seamlessly.' },
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feat.color}`}>
                  <feat.icon className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-20 relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">From creating an account to completing your first project, we've made the process completely frictionless.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
            <div className="hidden md:block absolute top-[45%] left-0 w-full h-[2px] bg-gradient-to-r from-indigo-100 via-indigo-300 to-indigo-100 -z-0"></div>

            {[
              { num: '01', title: 'Create Account', desc: 'Sign up securely using Google or Email and set up your distinct profile in minutes.' },
              { num: '02', title: 'Post / Apply', desc: 'Browse available opportunities tailored to you, or post a job to attract top talent.' },
              { num: '03', title: 'Collaborate & Earn', desc: 'Connect instantly via live chat, execute the project, and achieve your goals.' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3"
              >
                <div className="w-20 h-20 bg-white rounded-full border-4 border-indigo-100 shadow-xl flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 bg-indigo-600 rounded-full scale-[0.8] z-0"></div>
                  <span className="relative z-10 text-white font-bold text-xl">{step.num}</span>
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h4>
                <p className="text-slate-600 max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-24 bg-slate-900 text-white">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Trusted by professionals</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Don't just take our word for it. Hear from people who have transformed their careers with KamDhanda.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Rahul S.", role: "Senior Developer", content: "KamDhanda completely changed how I freelance. The ability to switch between seeking full-time roles and picking up side gigs is phenomenal.", img: "C:\Users\Asus\Videos\KamDhanda (2)\KamDhanda\client\src\assets\vansh.jpeg" },
              { name: "Priya V.", role: "Startup Founder", content: "I found my core engineering team through this platform within 2 weeks. The UI is incredibly intuitive and the chat feature speeds up hiring.", img: "41" },
              { name: "Amit K.", role: "UI/UX Designer", content: "The clean aesthetic and the quality of clients here is unmatched. It feels premium and professional. Highly recommended for elite freelancers.", img: "32" },
            ].map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-slate-800 rounded-2xl p-8 border border-slate-700 relative layout"
              >
                <div className="flex text-amber-400 mb-6">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-lg leading-relaxed mb-8">"{t.content}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <img src={`https://i.pravatar.cc/100?img=${t.img}`} alt={t.name} className="w-12 h-12 rounded-full border border-slate-600" />
                  <div>
                    <h5 className="font-bold">{t.name}</h5>
                    <p className="text-sm text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50 pointer-events-none"></div>
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Ready to elevate your career?</h2>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Join thousands of verified professionals and businesses. The next big opportunity is waiting for you.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <NavLink to="/signup" className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200">
              Create Free Account
            </NavLink>
            <NavLink to="/login" className="px-8 py-4 rounded-full bg-white text-slate-800 font-bold text-lg hover:bg-slate-50 transition border border-slate-200">
              Log in to Dashboard
            </NavLink>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/Logo.png" alt="KamDhanda Logo" className="h-6 w-6" />
            <span className="text-xl font-bold text-slate-900">KamDhanda</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600">About Us</a>
            <a href="#" className="hover:text-indigo-600">Find Jobs</a>
            <a href="#" className="hover:text-indigo-600">Post a Project</a>
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
          </div>
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} KamDhanda. All rights reserved.
          </div>
        </div>
      </footer>
      <AIChatbot />
    </div>
  );
};

export default Landing;
