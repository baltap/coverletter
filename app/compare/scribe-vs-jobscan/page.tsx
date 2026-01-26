import Link from "next/link";
import { Sparkles, X, Check } from "lucide-react";

export default function ScribeVsJobscan() {
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
                            Scribe.CV <span className="text-primary">vs</span> Jobscan.
                        </h1>
                    </div>
                    <div>
                        <p className="text-xl md:text-2xl text-charcoal/60 leading-relaxed font-medium">
                            Why semantic alignment beats keyword stuffing every single time.
                        </p>
                    </div>
                </div>

                {/* The Core Difference */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-32">
                    <div className="bg-white swiss-border p-12 space-y-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/30">The Jobscan Approach</h2>
                        <h3 className="serif-heading text-4xl font-extrabold text-charcoal leading-tight">Literal Matching, Hard Parsing.</h3>
                        <p className="text-sm text-charcoal/50 leading-relaxed font-medium">
                            Jobscan is built on a legacy model of frequency-based matching. It tells you how many times you used a word, but not if you used it correctly. This often leads to "over-optimized" text that looks suspicious to human recruiters.
                        </p>
                    </div>
                    <div className="bg-charcoal swiss-border p-12 space-y-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Sparkles size={24} className="text-primary animate-pulse" />
                        </div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">The Scribe.CV Advantage</h2>
                        <h3 className="serif-heading text-4xl font-extrabold leading-tight">Semantic Resonance.</h3>
                        <p className="text-sm text-white/50 leading-relaxed font-medium">
                            Scribe.CV understands the <strong>intent</strong> behind the job description. Instead of keyword counting, we perform competency mapping—ensuring your professional narrative mirrors the language and values of the hiring team.
                        </p>
                    </div>
                </div>

                {/* Feature Comparison Table */}
                <div className="bg-white swiss-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-charcoal/10 bg-zinc-50">
                                <th className="p-8 text-[10px] uppercase tracking-widest font-black text-charcoal/40">Capability</th>
                                <th className="p-8 text-[10px] uppercase tracking-widest font-black text-charcoal">Jobscan</th>
                                <th className="p-8 text-[10px] uppercase tracking-widest font-black text-primary">Scribe.CV</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal/10 font-medium">
                            {[
                                { feat: "Semantic Intelligence", t: "Frequency Based", s: "Contextual Mapping" },
                                { feat: "Recruiter-Sentiment Analysis", t: false, s: true },
                                { feat: "Link-to-Draft Pipeline", t: "Manual Paste", s: "Automated Scraping" },
                                { feat: "Keyword Density Guard", t: true, s: "Natural Integration" },
                                { feat: "One-Time Ownership", t: "Subscription", s: "$4.99 Lifetime" },
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
                    <h2 className="serif-heading text-4xl font-extrabold max-w-xl leading-tight">Move beyond keyword counts. Start telling your story.</h2>
                    <Link href="/" className="px-12 py-5 bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all">
                        Experience Scribe.CV
                    </Link>
                </div>
            </div>
        </div>
    );
}
