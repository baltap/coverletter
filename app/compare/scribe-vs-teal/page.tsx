import Link from "next/link";
import { Sparkles, X, Check } from "lucide-react";

export default function ScribeVsTeal() {
    return (
        <div className="min-h-screen bg-background-light">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-32 pb-48">
                {/* Comparison Hero */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-end mb-32">
                    <div>
                        <Link href="/compare" className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 hover:text-primary transition-colors flex items-center gap-2 mb-8">
                            <span className="material-symbols-outlined text-xs">west</span>
                            Back to comparisons
                        </Link>
                        <h1 className="serif-heading text-6xl md:text-8xl font-extrabold leading-[0.9] text-charcoal tracking-tighter">
                            Scribe.CV <span className="text-primary">vs</span> Teal.
                        </h1>
                    </div>
                    <div>
                        <p className="text-xl md:text-2xl text-charcoal/60 leading-relaxed font-medium">
                            Why "Resume Management" isn't enough for high-conversion cover letters.
                        </p>
                    </div>
                </div>

                {/* The Core Difference */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-32">
                    <div className="bg-white swiss-border p-12 space-y-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/30">The Teal Approach</h2>
                        <h3 className="serif-heading text-4xl font-extrabold text-charcoal leading-tight">Structured Database, Manual Input.</h3>
                        <p className="text-sm text-charcoal/50 leading-relaxed font-medium">
                            Teal excels at organizing your job search. However, their cover letter builder often relies on static templates and manual prompt engineering, leading to letters that feel "assembled" rather than written.
                        </p>
                    </div>
                    <div className="bg-charcoal swiss-border p-12 space-y-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Sparkles size={24} className="text-primary animate-pulse" />
                        </div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">The Scribe Advantage</h2>
                        <h3 className="serif-heading text-4xl font-extrabold leading-tight">Contextual Mirroring.</h3>
                        <p className="text-sm text-white/50 leading-relaxed font-medium">
                            Scribe.CV doesn't just store data; it <strong>aligns</strong> it. Our engine scrapes the specific job posting, analyzes the recruiter's specific intent, and mirrors your history to their future roadmap.
                        </p>
                    </div>
                </div>

                {/* Feature Comparison Table */}
                <div className="bg-white swiss-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-charcoal/10 bg-zinc-50">
                                <th className="p-8 text-[10px] uppercase tracking-widest font-black text-charcoal/40">Capability</th>
                                <th className="p-8 text-[10px] uppercase tracking-widest font-black text-charcoal">Teal</th>
                                <th className="p-8 text-[10px] uppercase tracking-widest font-black text-primary">Scribe.CV</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal/10 font-medium">
                            {[
                                { feat: "Automatic URL Scraping", t: false, s: true },
                                { feat: "Competency Mapping", t: "Manual", s: "AI-Driven" },
                                { feat: "Editorial Tone Engine", t: "Templates", s: "Variable Persona" },
                                { feat: "ATS Signal Optimization", t: "Basic", s: "Proprietary" },
                                { feat: "Lifetime One-Time Fee", t: false, s: true },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="p-8 text-sm uppercase tracking-tight text-charcoal/70">{row.feat}</td>
                                    <td className="p-8 text-xs text-charcoal/40">
                                        {row.t === true ? <Check size={16} /> : (row.t === false ? <X size={16} /> : row.t)}
                                    </td>
                                    <td className="p-8 text-xs font-black text-charcoal">
                                        {row.s === true ? <Check size={16} className="text-primary" /> : row.s}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Call to Action */}
                <div className="mt-32 text-center p-20 bg-zinc-50 swiss-border flex flex-col items-center gap-8">
                    <h2 className="serif-heading text-4xl font-extrabold max-w-xl leading-tight">Ready to stop managing databases and start winning interviews?</h2>
                    <Link href="/" className="px-12 py-5 bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all">
                        Experience Scribe.CV
                    </Link>
                </div>
            </div>
        </div>
    );
}
