const pptxgen = require("pptxgenjs");

try {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "KamDhanda - Professional Product Deck";
  pres.author = "KamDhanda Team";

  // Shared Design Elements
  const COLORS = {
    BG: "0F172A",      // Deep Navy from index.css
    PRIMARY: "6366F1", // Indigo from index.css
    SECONDARY: "00A884", // Teal from index.css
    TEXT: "F1F5F9",    // Slate-100
    SUBTEXT: "94A3B8", // Slate-400
    ACCENT: "F472B6",  // Pink
  };

  const FONTS = {
    HEADER: "Poppins",
    BODY: "Nunito"
  };

  // Helper macro for slides
  const addDefaultSlide = (title, items, iconText = "") => {
    const slide = pres.addSlide();
    slide.background = { fill: COLORS.BG };
    
    // Header Bar
    slide.addText(title, { 
      x: 0.5, y: 0.2, w: "90%", h: 0.8, 
      fontSize: 32, color: COLORS.PRIMARY, bold: true, fontFace: FONTS.HEADER 
    });

    // Decorative Line
    slide.addShape(pres.ShapeType.line, { x: 0.5, y: 1.0, w: "90%", h: 0, line: { color: COLORS.PRIMARY, width: 2 } });

    // Icon Placeholder (Text based for now)
    if (iconText) {
       slide.addText(iconText, { x: 8.5, y: 0.2, w: 1, h: 0.8, fontSize: 40, color: COLORS.ACCENT, align: "center" });
    }

    // Bullet points
    slide.addText(items.join("\n\n"), { 
      x: 0.5, y: 1.5, w: "90%", h: 3.5, 
      fontSize: 20, color: COLORS.TEXT, bullet: { type: "bullet", code: "2022" }, fontFace: FONTS.BODY 
    });

    // Footer
    slide.addText("KamDhanda | Modern Freelance Ecosystem", { x: 0.5, y: 5.2, w: "90%", h: 0.3, fontSize: 10, color: COLORS.SUBTEXT });
  };

  // --- SLIDE 1: TITLE ---
  const slide1 = pres.addSlide();
  slide1.background = { fill: COLORS.BG };
  slide1.addText("KamDhanda", {
    x: 0, y: "30%", w: "100%", h: 1.2,
    fontSize: 72, bold: true, color: COLORS.TEXT, align: "center", fontFace: FONTS.HEADER
  });
  slide1.addText("Redefining Professional Workflows", {
    x: 0, y: "45%", w: "100%", h: 0.6,
    fontSize: 24, color: COLORS.PRIMARY, align: "center", fontFace: FONTS.BODY
  });
  slide1.addText("HIRING FUNNEL • WORKSPACE • PAYMENTS", {
    x: 0, y: "55%", w: "100%", h: 0.4,
    fontSize: 14, color: COLORS.SUBTEXT, align: "center", fontFace: FONTS.BODY, charSpacing: 5
  });

  // --- SLIDE 2: MISSION ---
  addDefaultSlide("01. Platform Mission", [
    "Bridging the Gap: A unified home for both Freelance Projects and Full-time Jobs.",
    "Trust-First Ecosystem: Verified identities, secure OTPs, and milestone-based releases.",
    "Workflow Automation: Structured funnels from application to final payment.",
    "Enterprise Messaging: Replacing fragmented tools with a singular, secure chat hub."
  ], "🎯");

  // --- SLIDE 3: THE HIRING FUNNEL ---
  addDefaultSlide("02. The Structured Hiring Funnel", [
    "Phase 1 - Application: Professional profiles with resume and cover letter indexing.",
    "Phase 2 - Automated Mock Test: Timed, anti-cheat assessments with auto-grading.",
    "Phase 3 - Virtual Interviews: Direct scheduling and meeting link integration.",
    "Phase 4 - One-Click Hire: Instant transition from applicant to team member."
  ], "🚀");

  // --- SLIDE 4: WORKSPACE & TRACKING ---
  addDefaultSlide("03. Post-Hire: Active Workspace", [
    "Milestone Management: Projects segmented into granular, trackable modules.",
    "Visual Progress: Real-time dynamic progress bars for task completion tracking.",
    "Secure Deliverables: Cloud-synced file sharing (PDFs/Images) for all project assets.",
    "Transparency: Complete visibility for both Clients and Seekers on work progress."
  ], "🏗️");

  // --- SLIDE 5: MESSAGING & COLLABORATION ---
  addDefaultSlide("04. Enterprise Communication Suite", [
    "Real-time Chat: High-performance messaging powered by Socket.io.",
    "Media Support: Robust sharing of project assets, images, and documents.",
    "Advanced Interaction: Threaded replies, emoji reactions, and 1-hour edit window.",
    "End-to-End Privacy: Optional data encryption for sensitive corporate communication."
  ], "💬");

  // --- SLIDE 6: FINANCIAL INTEGRITY ---
  addDefaultSlide("05. Secure Financial Ecosystem", [
    "RazorPay Integration: Native, multi-currency checkout for safe transactions.",
    "Escrow Protection: Funds are locked and only released upon milestone approval.",
    "Flexible Models: Support for full upfront payments or granular task-based releases.",
    "Digital Invoicing: Automated generation of payment receipts and transaction trails."
  ], "💳");

  // --- SLIDE 7: AI CORE (GEMINI) ---
  addDefaultSlide("06. KamDhanda AI Assistant", [
    "Role-Aware Logic: Intelligent drafting for Job Descriptions and Proposals.",
    "Platform Help: Contextual guidance and navigation assistance for all users.",
    "Multilingual support: Fluid interaction in English, Hindi, and regional languages.",
    "Advanced Generation: Suggesting budgets, skills, and pricing strategies."
  ], "🤖");

  // --- SLIDE 8: TECH STACK ---
  addDefaultSlide("07. Modern Technology Stack", [
    "Frontend: React + Redux Toolkit + Tailwind CSS + Framer Motion.",
    "Backend: Node.js + Express.js + Mongoose (REST API).",
    "Real-time: Socket.io for messaging and global system alerts.",
    "Storage: MongoDB (Scalable Data) + Cloudinary (Enterprise Media)."
  ], "⚡");

  // --- SLIDE 9: THANK YOU ---
  const slide9 = pres.addSlide();
  slide9.background = { fill: COLORS.BG };
  slide9.addText("KamDhanda.", {
    x: 0, y: "40%", w: "100%", h: 1.2,
    fontSize: 72, bold: true, color: COLORS.TEXT, align: "center", fontFace: FONTS.HEADER
  });
  slide9.addText("Professional Work, Redefined.", {
    x: 0, y: "55%", w: "100%", h: 0.5,
    fontSize: 20, color: COLORS.PRIMARY, align: "center", fontFace: FONTS.BODY
  });

  const finalName = "KamDhanda_Company_Presentation.pptx";
  pres.writeFile({ fileName: finalName })
    .then(fileName => {
      console.log(`Successfully generated: ${fileName}`);
    })
    .catch(err => console.error("Write error:", err));

} catch(e) {
  console.error("Setup error:", e);
}
