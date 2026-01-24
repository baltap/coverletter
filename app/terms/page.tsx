import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="flex flex-col gap-6 border-b border-charcoal/10 pb-12 mb-16">
                <h1 className="serif-heading text-6xl md:text-7xl">Terms.</h1>
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-charcoal/60">
                    Governing Logic for Scribe.CV System Usage
                </p>
            </div>

            <div className="space-y-16">
                <section className="space-y-6">
                    <h2 className="serif-heading text-3xl">01. Acceptance</h2>
                    <p className="text-lg leading-relaxed text-charcoal/80">
                        By accessing the Scribe.CV system, you agree to adhere to these governing principles. If you do not agree with any part of these terms, your access to the system is revoked.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="serif-heading text-3xl">02. Permitted Usage</h2>
                    <div className="space-y-4 text-charcoal/70 leading-relaxed font-medium">
                        <p>The system is designed for professional document generation. Usage is subject to the following constraints:</p>
                        <ul className="list-none space-y-4 pl-0">
                            <li className="flex gap-4">
                                <span className="font-bold text-charcoal">I.</span>
                                <div>
                                    <span className="text-charcoal font-bold uppercase tracking-widest text-[10px] block mb-1">Authenticity</span>
                                    You must provide accurate professional history and valid job specifications.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="font-bold text-charcoal">II.</span>
                                <div>
                                    <span className="text-charcoal font-bold uppercase tracking-widest text-[10px] block mb-1">Commercial Use</span>
                                    Individual usage for job applications is permitted. Systematic commercial exploitation of the generation engine is prohibited.
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="serif-heading text-3xl">03. System Constraints</h2>
                    <div className="p-8 swiss-border bg-slate-50/50">
                        <p className="text-sm text-charcoal/80 leading-relaxed font-semibold italic">
                            &quot;All generated syntax is provided &apos;as-is&apos;. Scribe.CV utilizes advanced probabilistic models; therefore, accuracy, relevance, and successful employment outcomes are not guaranteed.&quot;
                        </p>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="serif-heading text-3xl">04. Prohibited Actions</h2>
                    <ul className="list-disc pl-6 space-y-4 text-charcoal/70 font-medium">
                        <li>Attempting to bypass authentication or rate-limiting protocols.</li>
                        <li>Reverse-engineering the scraping or generation logic.</li>
                        <li>Automated scanning of the Scribe.CV interface through headless browsers.</li>
                    </ul>
                </section>

                <section className="space-y-6 pt-12 border-t border-charcoal/10">
                    <p className="text-xs uppercase tracking-widest font-bold text-charcoal/40">
                        Version 1.0.2 / Jan 2026
                    </p>
                    <Link href="/" className="inline-block text-xs font-black uppercase tracking-[0.3em] border-b-2 border-primary pb-1">
                        Back to Scribe
                    </Link>
                </section>
            </div>
        </div>
    );
}
