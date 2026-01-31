import { Sparkles, Quote } from "lucide-react";

const TESTIMONIALS = [
    {
        name: "Alex M.",
        role: "Software Engineer",
        company: "Vercel",
        text: "The alignment score was 98%. I didn't believe it until the recruiter mentioned how 'perfectly tailored' my letter felt.",
        score: "98% Alignment"
    },
    {
        name: "Sarah K.",
        role: "Product Manager",
        company: "Stripe",
        text: "I spent 15 seconds on Scribe.CV. Usually, this takes me an hour. The output is indistinguishable from my own professional writing.",
        score: "Clinical Quality"
    },
    {
        name: "David L.",
        role: "Data Analyst",
        company: "Scale AI",
        text: "It accurately captured technical nuances in the job description that other AI tools completely missed.",
        score: "100% Contextual"
    }
];

export default function SuccessWall() {
    return (
        <section className="py-32 w-full border-t border-charcoal/10 bg-white">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
                    <div className="max-w-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 italic">Social Proof</p>
                        <h2 className="serif-heading text-4xl md:text-6xl font-black text-charcoal tracking-tight">
                            The Scribe <br /><span className="italic">Success Stories.</span>
                        </h2>
                    </div>
                    <div className="text-right pb-2">
                        <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest">500+ professionals onboarded</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="p-10 swiss-border flex flex-col justify-between group hover:bg-zinc-50 transition-colors duration-500 min-h-[400px]">
                            <div>
                                <Quote className="text-primary mb-8" size={32} />
                                <p className="text-xl font-medium text-charcoal/80 leading-relaxed mb-8 italic">"{t.text}"</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles size={14} className="text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t.score}</span>
                                </div>
                                <div className="pt-6 border-t border-charcoal/5">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-charcoal">{t.name}</h4>
                                    <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest">{t.role} at {t.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
