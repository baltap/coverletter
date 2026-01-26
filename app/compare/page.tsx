import Link from "next/link";

export default function ComparePage() {
    const comparisons = [
        { name: "Teal", slug: "scribe-vs-teal", desc: "How Scribe.CV's alignment engine compares to Teal's manual builder." },
        { name: "Rezi", slug: "scribe-vs-rezi", desc: "A deep dive into AI-parsing vs. context-aware generation." },
        { name: "Jobscan", slug: "scribe-vs-jobscan", desc: "Why matching keyword density isn't enough for modern recruiters." }
    ];

    return (
        <div className="min-h-screen bg-background-light">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-32 pb-48">
                <div className="max-w-4xl mb-32">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-4">Product Comparisons</p>
                    <h1 className="serif-heading text-6xl md:text-8xl font-extrabold leading-none text-charcoal tracking-tighter mb-12">
                        Scribe.CV <span className="italic">vs.</span> The Market.
                    </h1>
                    <p className="text-xl md:text-2xl text-charcoal/60 leading-relaxed max-w-2xl">
                        A clinical breakdown of how the Scribe.CV Alignment Engine stacks up against generic AI templates and legacy resume builders.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {comparisons.map((c) => (
                        <Link
                            key={c.slug}
                            href={`/compare/${c.slug}`}
                            className="group bg-white p-12 swiss-border flex flex-col justify-between aspect-square hover:bg-charcoal transition-all duration-500"
                        >
                            <div className="space-y-6">
                                <h2 className="serif-heading text-4xl font-extrabold text-charcoal group-hover:text-white transition-colors">{c.name}</h2>
                                <p className="text-sm font-medium text-charcoal/40 group-hover:text-white/40 transition-colors leading-relaxed">
                                    {c.desc}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary">
                                <span>Read Analysis</span>
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform">east</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
