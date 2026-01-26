import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="flex flex-col gap-6 border-b border-charcoal/10 pb-12 mb-16">
                <h1 className="serif-heading text-6xl md:text-7xl">Privacy.</h1>
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-charcoal/60">
                    Protocol for Data Archiving & Privacy
                </p>
            </div>

            <div className="space-y-16">
                <section className="space-y-6">
                    <h2 className="serif-heading text-3xl">01. Overview</h2>
                    <p className="text-lg leading-relaxed text-charcoal/80">
                        At Scribe.CV, we prioritize the integrity and security of your professional data. This protocol outlines how your information is handled within our ecosystem.
                    </p>
                </section>

                <section className="space-y-6">
                    <h2 className="serif-heading text-3xl">02. Data Acquisition</h2>
                    <div className="space-y-4 text-charcoal/70 leading-relaxed font-medium">
                        <p>We process the following professional vectors to generate your documents:</p>
                        <ul className="list-none space-y-4 pl-0">
                            <li className="flex gap-4">
                                <span className="font-bold text-charcoal">A.</span>
                                <div>
                                    <span className="text-charcoal font-bold uppercase tracking-widest text-[10px] block mb-1">Profile Content</span>
                                    The text extracted from your uploaded CV or resume.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="font-bold text-charcoal">B.</span>
                                <div>
                                    <span className="text-charcoal font-bold uppercase tracking-widest text-[10px] block mb-1">Job Specification</span>
                                    URLs and descriptions of job postings processed through our scanning engine.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="font-bold text-charcoal">C.</span>
                                <div>
                                    <span className="text-charcoal font-bold uppercase tracking-widest text-[10px] block mb-1">Generated Syntax</span>
                                    The output documents created by our AI models.
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="serif-heading text-3xl">03. Archive Layer</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 swiss-border">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Cloud Archives</h3>
                            <p className="text-sm text-charcoal/60 leading-relaxed font-medium">
                                For authenticated users, data is synchronized and stored securely in our cloud database to enable cross-device archiving.
                            </p>
                        </div>
                        <div className="p-8 swiss-border">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Local Cache</h3>
                            <p className="text-sm text-charcoal/60 leading-relaxed font-medium">
                                For guest users, data remains solely within your browser&apos;s local storage. This data is ephemeral and cleared when browser history is purged.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="serif-heading text-3xl">04. AI Processing</h2>
                    <p className="text-lg leading-relaxed text-charcoal/80">
                        Your professional documents are processed using Google Gemini AI models. By using Scribe.CV, you acknowledge that your input data is shared with these models solely for the purpose of generating tailored cover letters.
                    </p>
                </section>

                <section className="space-y-6 pt-12 border-t border-charcoal/10">
                    <p className="text-xs uppercase tracking-widest font-bold text-charcoal/40">
                        Last Modified: January 2026
                    </p>
                    <Link href="/" className="inline-block text-xs font-black uppercase tracking-[0.3em] border-b-2 border-primary pb-1">
                        Back to Scribe.CV
                    </Link>
                </section>
            </div>
        </div>
    );
}
