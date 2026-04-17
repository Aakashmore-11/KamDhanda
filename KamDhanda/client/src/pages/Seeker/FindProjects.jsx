import React, { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Frown, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid,
  Briefcase,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { serverObj } from "../../config/serverConfig";
import ProjectCard from "../../components/seeker/ProjectCard";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const FindProjects = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverObj.serverAPI}/freelancerProject/get-allProjects`, { withCredentials: true });
        const data = Array.isArray(res.data) ? res.data : [];
        console.log("Fetched Projects:", data);
        setProjects(data);
      } catch (err) {
        console.error("Filter Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Compute available categories dynamically from data to ensure mismatch doesn't happen
  const availableCategories = useMemo(() => {
    const cats = new Set(["All"]);
    projects.forEach(p => {
      if (p.category) {
        // Normalize: Title case for button display
        const normalized = p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase();
        cats.add(normalized);
      }
    });
    // Add default ones if they don't exist
    ["Development", "Design", "Writing", "Marketing"].forEach(c => cats.add(c));
    return Array.from(cats);
  }, [projects]);

  // Compute filtered projects with looser matching
  const filteredData = useMemo(() => {
    return projects.filter(p => {
      // 1. Status Check
      const matchesStatus = p.status?.toLowerCase() === "open";
      if (!matchesStatus) return false;

      // 2. Category Check (Loose Match)
      let catMatch = true;
      if (selectedCategory !== "All") {
        const pCat = p.category?.toLowerCase().trim() || "";
        const sCat = selectedCategory.toLowerCase().trim();
        // Match if string is equal OR if its a sub-string (e.g. "Web Development" matched by "Development")
        catMatch = pCat === sCat || pCat.includes(sCat) || sCat.includes(pCat);
      }
      
      // 3. Search Check
      const searchVal = searchTerm.toLowerCase().trim();
      const searchMatch = !searchVal || 
        p.title?.toLowerCase().includes(searchVal) || 
        p.description?.toLowerCase().includes(searchVal) ||
        (Array.isArray(p.skills) && p.skills.some(s => s?.toLowerCase().trim().includes(searchVal)));

      return catMatch && searchMatch;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [projects, selectedCategory, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Loading amazing projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 w-full pb-24">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 pt-28 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider">Project Explorer</span>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">• {projects.length} Available</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Global Opportunities</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            Find the perfect project for your skill set. Use the filters below to narrow down your search.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        {/* Search & Filters Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 mb-12">
          <div className="flex flex-col gap-10">
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
              <input
                type="text"
                placeholder="Search by titles, skills, or keywords..."
                className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] pl-16 pr-8 py-5 text-lg font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Filter size={16} />
                  <span className="text-xs font-black uppercase tracking-widest leading-none">Filter by Category</span>
                </div>
                {selectedCategory !== "All" && (
                    <button onClick={() => setSelectedCategory("All")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Reset Category</button>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableCategories.map(cat => {
                    const count = projects.filter(p => p.status?.toLowerCase() === "open" && (cat === "All" || p.category?.toLowerCase().trim().includes(cat.toLowerCase().trim()))).length;
                    return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`group relative flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                            selectedCategory === cat 
                              ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 scale-105" 
                              : "bg-white text-slate-600 border-slate-100 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30"
                          }`}
                        >
                          {cat}
                          {count > 0 && (
                             <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                               {count}
                             </span>
                          )}
                        </button>
                    )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                 <LayoutGrid size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {selectedCategory === "All" ? "Everything" : selectedCategory} <span className="text-slate-300 font-medium ml-1">({filteredData.length})</span>
              </h2>
           </div>
           
           {(searchTerm || selectedCategory !== "All") && (
             <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100 animate-in fade-in slide-in-from-right-2">
                <AlertCircle size={14} />
                Filtering active
                <button onClick={() => {setSearchTerm(""); setSelectedCategory("All");}} className="ml-2 hover:underline">Clear all</button>
             </div>
           )}
        </div>

        {/* Project Grid */}
        <div className="relative min-h-[400px]">
          {paginatedData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
              {paginatedData.map((project, i) => (
                <motion.div
                  key={project._id || i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center px-6 shadow-sm"
            >
               <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-full mb-8">
                 <Briefcase className="text-slate-200" size={40} />
               </div>
               <h3 className="text-3xl font-black text-slate-900 mb-3">No matching results</h3>
               <p className="text-slate-400 text-lg mb-10 max-w-sm mx-auto font-medium">Try broadening your category selection or check for typos in your search.</p>
               <button 
                  onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-2xl active:scale-95"
               >
                 Reset All Filters
               </button>
            </motion.div>
          )}
        </div>

        {/* Dynamic Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12 mb-12">
             <button 
                onClick={() => {setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({top: 400, behavior: 'smooth'});}}
                disabled={currentPage === 1}
                className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all disabled:opacity-20 shadow-sm"
             >
               <ChevronLeft size={24} />
             </button>
             
             <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {setCurrentPage(i + 1); window.scrollTo({top: 400, behavior: 'smooth'});}}
                    className={`min-w-[3.5rem] h-14 px-4 rounded-2xl text-lg font-black transition-all ${
                      currentPage === i + 1 
                        ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-110 z-10" 
                        : "bg-white text-slate-400 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
             </div>

             <button 
                onClick={() => {setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({top: 400, behavior: 'smooth'});}}
                disabled={currentPage === totalPages}
                className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all disabled:opacity-20 shadow-sm"
             >
               <ChevronRight size={24} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindProjects;
