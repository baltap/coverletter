"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sparkles, Check, ArrowRight, Loader2, Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { SignedIn, SignedOut, SignUpButton, useClerk } from "@clerk/nextjs";
import SuccessWall from "@/components/SuccessWall";

export default function PricingPage() {
    const [isUpgrading, setIsUpgrading] = useState(false);
    const isMax = useQuery(api.payments.getMaxStatus);
    const clerk = useClerk();

    const handleUpgrade = async () => {
        sendGAEvent("event", "click_upgrade_pricing_page", { value: "4.99" });
        setIsUpgrading(true);

        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Failed to initiate checkout:", data.error);
                setIsUpgrading(false);
            }
        } catch (error: any) {
            console.error("Upgrade failed:", error);
            setIsUpgrading(false);
        }
    };

    const features = [
        { title: "Unlimited Generations", description: "No daily or monthly limits. Generate as many versions as you need.", icon: <Zap size={18} /> },
        { title: "Surgical Precision", description: "Access to our most advanced alignment models for maximum conversion.", icon: <Sparkles size={18} /> },
        { title: "Cloud Synchronization", description: "Your CV and history synced across all your devices securely.", icon: <Globe size={18} /> },
        { title: "Priority Support", description: "Direct line to our architecture team for technical assistance.", icon: <Shield size={18} /> },
    ];

    const faqs = [
        { q: "Is it really a lifetime license?", a: "Yes. Scribe.CV Max is a one-time purchase. No subscriptions, no recurring fees." },
        { q: "What if I need to update my CV?", a: "Your Max status covers all updates to your professional profile. You can re-align as many times as your career evolves." },
        { q: "Does this work for all job sites?", a: "Our scraping engine is optimized for LinkedIn, Indeed, and Greenhouse, but our manual override works for every site on the internet." },
    ];

    return (
        <div className="min-h-screen bg-background-light">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-32 pb-48">
                {/* Hero Header */}
                <div className="max-w-4xl mb-32">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-4 italic">The Master License</p>
                    <h1 className="serif-heading text-6xl md:text-8xl font-extrabold leading-none text-charcoal tracking-tighter mb-12">
                        Invest Once. <br /><span className="text-primary italic">Apply Everywhere.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-charcoal/60 leading-relaxed max-w-2xl font-medium">
                        Stop paying monthly for "career tools." Scribe.CV is built for the long game. One clinical license for your entire job search.
                    </p>
                </div>

                {/* Pricing Card Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* The "Max" Card */}
                    <div className="bg-charcoal text-white p-12 md:p-16 swiss-border relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 -mr-32 -mt-32 rotate-45 group-hover:bg-primary/20 transition-all duration-700" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h2 className="serif-heading text-4xl font-black mb-2">Scribe.CV Max</h2>
                                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">Early Adopter License</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-5xl font-black mb-1 font-mono tracking-tighter">$4.99</div>
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-white/40">One-Time Payment</div>
                                </div>
                            </div>

                            <div className="space-y-6 mb-16">
                                {features.map((f, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1 text-primary">{f.icon}</div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-widest mb-1">{f.title}</h4>
                                            <p className="text-xs text-white/50 leading-relaxed font-medium">{f.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <SignedIn>
                                {isMax ? (
                                    <div className="w-full py-6 bg-primary/20 border border-primary/40 text-primary font-black text-sm uppercase tracking-[0.3em] rounded-sm flex items-center justify-center gap-2">
                                        <Check size={18} />
                                        License Active
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={isUpgrading}
                                        className="w-full bg-primary text-white py-6 font-black text-sm uppercase tracking-[0.3em] hover:brightness-110 transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                                    >
                                        {isUpgrading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                        {isUpgrading ? "Authorizing..." : "Secure My License"}
                                    </button>
                                )}
                            </SignedIn>

                            <SignedOut>
                                <SignUpButton mode="modal">
                                    <button className="w-full bg-primary text-white py-6 font-black text-sm uppercase tracking-[0.3em] hover:brightness-110 transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20">
                                        Sign Up to Upgrade
                                    </button>
                                </SignUpButton>
                            </SignedOut>

                            <p className="text-[10px] text-white/30 text-center mt-6 font-bold uppercase tracking-widest">
                                30-Day Money Back Guarantee • Secure via Stripe
                            </p>
                        </div>
                    </div>

                    {/* The "Why Max" Section */}
                    <div className="space-y-16 lg:pt-16">
                        <div>
                            <h3 className="serif-heading text-3xl font-extrabold mb-8 text-charcoal">The Contextual Edge.</h3>
                            <p className="text-lg text-charcoal/60 leading-relaxed font-medium">
                                Generic AI letters are dead on arrival. Scribe.CV Max uses advanced career vector analysis to ensure your letter doesn't just "mention" keywords, but demonstrates **top-tier alignment** with the hiring team's specific goals.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 border border-charcoal/10 bg-white">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/40 mb-4">Market Standard</h4>
                                <p className="text-xs font-bold text-charcoal/60 leading-relaxed">
                                    "$20/mo subscription. Robotic templates. No context awareness."
                                </p>
                            </div>
                            <div className="p-8 border-l-4 border-primary bg-zinc-50">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Scribe Logic</h4>
                                <p className="text-xs font-bold text-charcoal leading-relaxed italic">
                                    "$4.99 forever. Surgical alignment. Recruiter-approved tone."
                                </p>
                            </div>
                        </div>

                        <Link href="/compare" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-charcoal hover:text-primary transition-colors group">
                            Full Competitor Analysis <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Success Wall */}
                <div className="-mx-6 md:-mx-12">
                    <SuccessWall />
                </div>

                {/* FAQ Section */}
                <div className="mt-48 pt-32 border-t border-charcoal/10">
                    <h2 className="serif-heading text-4xl font-extrabold mb-16 text-charcoal">FAQ.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {faqs.map((faq, i) => (
                            <div key={i} className="space-y-4">
                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-charcoal">{faq.q}</h3>
                                <p className="text-sm font-medium text-charcoal/50 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
