import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { Metadata } from "next";

// This data could eventually move to a database or a separate config file
const ROLES_DATA: Record<string, { title: string; desc: string; keywords: string[] }> = {
    "software-engineer": {
        title: "Software Engineer",
        desc: "Precision-engineered cover letters for full-stack, frontend, and backend roles. Scribe.CV aligns your technical stack with their architectural needs.",
        keywords: ["Technical Stack Alignment", "System Architecture", "Agile Velocity"],
    },
    "product-manager": {
        title: "Product Manager",
        desc: "Outcome-driven cover letters focusing on roadmaps, metrics, and user-centric growth. Prove your strategic value through clinical alignment.",
        keywords: ["KPI Metrics", "Roadmap Strategy", "Stakeholder Alignment"],
    },
    "marketing-manager": {
        title: "Marketing Manager",
        desc: "High-conversion cover letters that mirror their brand voice and campaign goals. Show them you understand their market better than anyone.",
        keywords: ["Conversion Rates", "Brand Authority", "GTM Strategy"],
    },
    "data-analyst": {
        title: "Data Analyst",
        desc: "Clinical cover letters that highlight your ability to transform raw data into architectural business decisions.",
        keywords: ["Statistical Modeling", "Insight Extraction", "Visual Storytelling"],
    },
};

export async function generateStaticParams() {
    return Object.keys(ROLES_DATA).map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const role = ROLES_DATA[slug];
    if (!role) return { title: "Role Not Found" };

    return {
        title: `AI Cover Letter for ${role.title} | Scribe.CV`,
        description: `Generate a high-conversion, tailored cover letter for ${role.title} roles in 15 seconds using AI alignment.`,
    };
}

export default async function RolePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const role = ROLES_DATA[slug];

    if (!role) return <div>Role not found.</div>;

    return (
        <div className="min-h-screen bg-background-light">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-32 pb-48">
                {/* Hero Section */}
                <div className="max-w-4xl mb-32">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-4 italic">Tailored for {role.title}s</p>
                    <h1 className="serif-heading text-6xl md:text-8xl font-extrabold leading-tight text-charcoal tracking-tighter mb-12">
                        Clinical Alignment for <span className="text-primary italic">{role.title} Roles.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-charcoal/60 leading-relaxed max-w-2xl font-medium">
                        {role.desc}
                    </p>

                    <div className="mt-12 flex flex-wrap gap-4">
                        <Link
                            href="/"
                            className="bg-charcoal text-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary transition-all rounded-sm flex items-center gap-3"
                        >
                            Start My {role.title} Letter <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Why it works */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-12">
                        <h2 className="serif-heading text-4xl font-black text-charcoal">The {role.title} Advantage.</h2>
                        <div className="space-y-8">
                            {role.keywords.map((kw, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-charcoal mb-2">{kw}</h4>
                                        <p className="text-sm text-charcoal/50 leading-relaxed font-medium">
                                            Our alignment engine specifically analyzes the job link for indicators related to {kw.toLowerCase()}, ensuring your cover letter speaks the industry language.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white swiss-border p-12 md:p-16 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45" />
                        <div className="flex items-center gap-3 mb-8">
                            <Zap size={18} className="text-primary" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-charcoal">System Analysis: {role.title}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="h-2 w-3/4 bg-charcoal/10" />
                            <div className="h-2 w-1/2 bg-charcoal/10" />
                            <div className="p-4 bg-primary/5 border-l-2 border-primary">
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary italic">MATCH IDENTIFIED</p>
                                <p className="text-xs font-bold text-charcoal mt-1">High-confidence correlation between your history and their technical requirements.</p>
                            </div>
                            <div className="h-2 w-5/6 bg-charcoal/10" />
                            <div className="h-2 w-2/3 bg-charcoal/10" />
                        </div>
                        <div className="pt-8 mt-8 border-t border-charcoal/5">
                            <p className="text-[9px] font-mono text-charcoal/30 uppercase tracking-[0.4em]">Scribe.CV Engine v2.1 | 98% Alignment Score</p>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-48 text-center bg-charcoal text-white p-20 swiss-border">
                    <Sparkles size={40} className="text-primary mx-auto mb-8" />
                    <h2 className="serif-heading text-4xl md:text-6xl font-black mb-8">Ready to get hired?</h2>
                    <p className="text-lg text-white/50 mb-12 max-w-xl mx-auto font-medium">Join 500+ professionals using Scribe.CV to land their dream roles through surgical AI alignment.</p>
                    <Link
                        href="/"
                        className="inline-block bg-primary text-white px-12 py-6 text-[10px] font-black uppercase tracking-[0.4em] hover:brightness-110 transition-all rounded-sm"
                    >
                        Create My First Letter Free
                    </Link>
                </div>
            </div>
        </div>
    );
}
