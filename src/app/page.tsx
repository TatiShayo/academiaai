import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090f] text-[#f8fafc] flex flex-col font-sans select-none selection:bg-[#6366f1]/30 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-[#1e1e2e] bg-[#09090f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-indigo-900 flex items-center justify-center border border-[#6366f1]/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight font-mono text-white">
              Academia<span className="text-[#6366f1]">AI</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Documentation</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium bg-[#111118] border border-[#1e1e2e] rounded-lg hover:border-[#6366f1]/50 hover:bg-[#1a1a26] transition-all"
            >
              Log In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-white bg-[#6366f1] rounded-lg hover:bg-indigo-600 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center gap-1.5"
            >
              Enter Workspace
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden border-b border-[#1e1e2e]">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111118] border border-[#1e1e2e] text-xs font-mono text-indigo-400 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            V2.0 is Live: Integrated AI Academic Suite
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 font-sans leading-[1.15]">
            Write, Refine & Validate Your Research <br className="hidden md:inline" />
            with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-[#6366f1]">Absolute Academic Rigor</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A comprehensive, dark-themed AI workbench built exclusively for researchers, students, and educators. Humanize drafts, elevate vocabulary tiers, scan plagiarism risk, and generate robust citations instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-[#6366f1] text-white font-medium rounded-xl hover:bg-indigo-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 group"
            >
              Start Free Trial
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-[#111118] border border-[#1e1e2e] text-slate-300 font-medium rounded-xl hover:text-white hover:border-slate-700 hover:bg-[#151520] transition-all flex items-center justify-center"
            >
              Explore Tools
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 border-b border-[#1e1e2e]">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            Engineered for Academic Excellence
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Six advanced scholarly workflows integrated into a single, unified database dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tool 1 */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-all group hover:shadow-[0_4px_30px_rgba(99,102,241,0.05)]">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366f1] mb-5 group-hover:bg-[#6366f1] group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2 font-mono">AI Humanizer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bypasses rigid AI detection. Restructures expressions into natural, organic phrasing while keeping key scientific thesis arguments fully intact.
            </p>
          </div>

          {/* Tool 2 */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-all group hover:shadow-[0_4px_30px_rgba(99,102,241,0.05)]">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366f1] mb-5 group-hover:bg-[#6366f1] group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2 font-mono">Academic Enhancer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Elevates terminology weight and sentence structure. Supports targeted upgrades for High School, Undergraduate, Master&apos;s, or PhD level literature.
            </p>
          </div>

          {/* Tool 3 */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-all group hover:shadow-[0_4px_30px_rgba(99,102,241,0.05)]">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366f1] mb-5 group-hover:bg-[#6366f1] group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2 font-mono">Plagiarism Risk Scanner</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Estimates overlap risks. Pinpoints specific sentence fragments that match existing literature styles, providing instant rewrites and inline comments.
            </p>
          </div>

          {/* Tool 4 */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-all group hover:shadow-[0_4px_30px_rgba(99,102,241,0.05)]">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366f1] mb-5 group-hover:bg-[#6366f1] group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2 font-mono">Citation Generator</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Formats citations instantly in APA, MLA, Chicago, and Harvard structures based on DOI, title, URL, or author inputs. Perfect for quick bibliographies.
            </p>
          </div>

          {/* Tool 5 */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-all group hover:shadow-[0_4px_30px_rgba(99,102,241,0.05)]">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366f1] mb-5 group-hover:bg-[#6366f1] group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2 font-mono">Syllabus Organizer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Takes unstructured lecture transcripts or course bullet points and generates logical, weekly structured curriculum modules with reading logs.
            </p>
          </div>

          {/* Tool 6 */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#6366f1]/40 transition-all group hover:shadow-[0_4px_30px_rgba(99,102,241,0.05)]">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366f1] mb-5 group-hover:bg-[#6366f1] group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2 font-mono">AI Quiz Generator</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instantly converts research papers, chapters, or summaries into highly interactive multiple-choice tests, providing detailed correction metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            Transparent, Simple Pricing
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Choose the workflow format that suits your research schedule. No hidden agreements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 flex flex-col relative">
            <h3 className="text-lg font-medium text-slate-400 mb-2 font-mono">Free Trial</h3>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-xs text-slate-400 font-mono">/ forever</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">
              Explore the interfaces and test the outputs of all six tools out-of-the-box.
            </p>
            <ul className="space-y-4 text-sm text-slate-300 mb-8 flex-1">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                3 Document saves total
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Basic AI transformations
              </li>
              <li className="flex items-center gap-2 text-slate-500 line-through">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Unlimited processing
              </li>
              <li className="flex items-center gap-2 text-slate-500 line-through">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Priority OpenAI execution
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="block w-full text-center px-4 py-3 bg-[#111118] border border-[#1e1e2e] rounded-xl hover:border-slate-700 font-medium text-white transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="bg-[#111118] border-2 border-[#6366f1] rounded-2xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#6366f1] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              Most Popular
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2 font-mono">Pro Membership</h3>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-4xl font-bold text-white">$19</span>
              <span className="text-xs text-slate-400 font-mono">/ month</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">
              For active researchers and students demanding heavy-duty document outputs.
            </p>
            <ul className="space-y-4 text-sm text-slate-300 mb-8 flex-1">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited document saves
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Full access to all 6 tools
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Advanced vocabulary enhancers
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Priority API responses
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="block w-full text-center px-4 py-3 bg-[#6366f1] hover:bg-indigo-600 font-medium text-white rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
            >
              Subscribe Now
            </Link>
          </div>

          {/* Pay-per-doc Tier */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 flex flex-col relative">
            <h3 className="text-lg font-medium text-slate-400 mb-2 font-mono">Pay-Per-Doc</h3>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-4xl font-bold text-white">$5</span>
              <span className="text-xs text-slate-400 font-mono">/ document</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">
              No subscription commitment. Process and finalize a single comprehensive study.
            </p>
            <ul className="space-y-4 text-sm text-slate-300 mb-8 flex-1">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Full access to all 6 tools
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save and export outputs
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                One-time payment validation
              </li>
              <li className="flex items-center gap-2 text-slate-500 line-through">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Multiple document saves
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="block w-full text-center px-4 py-3 bg-[#111118] border border-[#1e1e2e] rounded-xl hover:border-slate-700 font-medium text-white transition-all"
            >
              Purchase Access
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-12 mt-auto bg-[#09090f]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400">AcademiaAI</span>
            <span>© 2026. Academic Integrity Suite.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Use</a>
            <a href="#" className="hover:text-slate-300">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
