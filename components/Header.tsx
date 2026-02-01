"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    SignInButton,
    SignUpButton,
    UserButton,
    SignOutButton,
    SignedIn,
    SignedOut,
} from "@clerk/nextjs";
import { LogOut, Menu, X, Sparkles, Loader2 } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";


export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const isMax = useQuery(api.payments.getMaxStatus);
    const user = useQuery(api.users.currentUser);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleUpgrade = async () => {
        sendGAEvent("event", "click_upgrade_header", { value: "4.99" });
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

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="relative w-full">
            <header className="flex items-center justify-between px-6 md:px-20 py-4 fixed top-0 left-0 right-0 z-[150] bg-white/75 backdrop-blur-xl saturate-[180%] border-b border-black/[0.05] shadow-sm w-full transition-all duration-300">
                <div className="flex items-center gap-2 relative z-[210]">
                    <Link href="/" className="serif-heading text-2xl font-extrabold tracking-tight text-charcoal" onClick={closeMenu}>
                        Scribe.CV
                    </Link>
                </div>

                <div className="flex items-center gap-6 md:gap-10">
                    <nav className="hidden md:flex items-center gap-8">
                        {mounted && (
                            <SignedIn>
                                <Link
                                    href="/"
                                    className="text-xs uppercase tracking-[0.2em] font-bold text-charcoal hover:text-primary transition-colors"
                                >
                                    Editor
                                </Link>
                                <Link
                                    href="/history"
                                    className="text-xs uppercase tracking-[0.2em] font-bold text-charcoal hover:text-primary transition-colors"
                                >
                                    Archives
                                </Link>
                            </SignedIn>
                        )}
                    </nav>

                    <div className="flex items-center gap-4">
                        {mounted && (
                            <>
                                <SignedOut>
                                    <div className="hidden md:flex items-center gap-4 text-charcoal">
                                        <SignInButton mode="modal">
                                            <button
                                                onClick={() => sendGAEvent("event", "login_click")}
                                                className="text-xs uppercase tracking-[0.2em] font-bold hover:text-primary transition-colors cursor-pointer mr-4"
                                            >
                                                Login
                                            </button>
                                        </SignInButton>
                                        <SignUpButton mode="modal">
                                            <button
                                                onClick={() => sendGAEvent("event", "signup_click")}
                                                className="bg-charcoal text-white px-6 py-2 text-xs uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-primary transition-all cursor-pointer"
                                            >
                                                Join Free
                                            </button>
                                        </SignUpButton>

                                    </div>
                                </SignedOut>
                                <SignedIn>
                                    <div className="flex items-center gap-4 md:gap-6">
                                        {mounted && isMax === false && (
                                            <button
                                                onClick={handleUpgrade}
                                                disabled={isUpgrading}
                                                className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {isUpgrading ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <Sparkles size={12} />
                                                )}
                                                Upgrade to Max
                                            </button>
                                        )}
                                        {user?.referralCode && (
                                            <button
                                                onClick={() => {
                                                    const link = `https://scribe.cv/?ref=${user.referralCode}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert("Referral link copied! Share it to get +2 generations per friend.");
                                                }}
                                                className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-black text-primary hover:text-charcoal transition-colors cursor-pointer"
                                            >
                                                <Zap size={12} className="fill-primary" />
                                                Refer Friends (+2)
                                            </button>
                                        )}
                                        <SignOutButton>
                                            <button className="hidden md:flex text-xs uppercase tracking-[0.2em] font-bold text-charcoal/60 hover:text-primary transition-colors cursor-pointer items-center gap-1.5 focus:outline-none">
                                                <LogOut size={14} />
                                                Logout
                                            </button>
                                        </SignOutButton>
                                        <UserButton
                                            afterSignOutUrl="/"
                                            appearance={{
                                                elements: {
                                                    userButtonAvatarBox: "w-8 h-8 rounded-sm overflow-hidden border border-charcoal/10"
                                                }
                                            }}
                                        />
                                    </div>
                                </SignedIn>
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden p-2 text-charcoal hover:text-primary transition-colors relative z-[210] focus:outline-none"
                            aria-label="Toggle Menu"
                        >
                            <div className="p-1 px-2 border-2 border-charcoal/10 rounded-sm bg-white">
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Spacer to prevent content from being hidden under the fixed header */}
            <div className="h-[64px] md:h-[72px]" />

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[180] bg-white flex flex-col p-10 pt-32 md:hidden overflow-hidden">
                    <nav className="flex flex-col gap-8">
                        {/* Always show these links for now to verify rendering */}
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className="serif-heading text-6xl text-charcoal hover:text-primary transition-colors"
                        >
                            Editor
                        </Link>
                        <Link
                            href="/history"
                            onClick={closeMenu}
                            className="serif-heading text-6xl text-charcoal hover:text-primary transition-colors"
                        >
                            Archives
                        </Link>

                        {mounted && (
                            <>
                                <SignedOut>
                                    <div className="flex flex-col gap-6 pt-4">
                                        <SignInButton mode="modal">
                                            <button
                                                onClick={closeMenu}
                                                className="serif-heading text-4xl text-left text-charcoal/40 hover:text-charcoal transition-colors"
                                            >
                                                Log In
                                            </button>
                                        </SignInButton>
                                        <SignUpButton mode="modal">
                                            <button
                                                onClick={closeMenu}
                                                className="bg-charcoal text-white py-5 px-8 serif-heading text-2xl text-left hover:bg-primary transition-all w-fit"
                                            >
                                                Join Free
                                            </button>
                                        </SignUpButton>
                                    </div>
                                </SignedOut>

                                <SignedIn>
                                    {isMax === false && (
                                        <button
                                            onClick={() => {
                                                closeMenu();
                                                handleUpgrade();
                                            }}
                                            disabled={isUpgrading}
                                            className="w-full bg-primary text-white py-5 px-8 serif-heading text-2xl text-left hover:brightness-110 transition-all mb-8 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isUpgrading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                                <span>Upgrade to Max</span>
                                            </div>
                                            <span className="text-xs font-black tracking-widest opacity-60">$4.99</span>
                                        </button>
                                    )}
                                    {user?.referralCode && (
                                        <div className="p-6 bg-zinc-50 swiss-border mb-8">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Invite for Bonus Generations</p>
                                            <p className="text-xs font-bold text-charcoal/60 leading-relaxed mb-4">Refer a friend and you both get +2 generations for free.</p>
                                            <button
                                                onClick={() => {
                                                    const link = `https://scribe.cv/?ref=${user.referralCode}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert("Referral link copied!");
                                                }}
                                                className="w-full py-4 border border-charcoal/10 text-[10px] font-black uppercase tracking-widest text-charcoal hover:bg-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                Copy Invite Link
                                            </button>
                                        </div>
                                    )}
                                    <div className="pt-10 border-t border-charcoal/10 mt-4">
                                        <SignOutButton>
                                            <button
                                                onClick={closeMenu}
                                                className="text-[10px] uppercase tracking-[0.4em] font-black text-charcoal/30 hover:text-primary transition-colors flex items-center gap-2"
                                            >
                                                <LogOut size={14} />
                                                Log Out
                                            </button>
                                        </SignOutButton>
                                    </div>
                                </SignedIn>
                            </>
                        )}
                    </nav>

                    <div className="mt-auto pt-8 border-t border-charcoal/5">
                        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-charcoal/10">
                            &copy; {new Date().getFullYear()} Scribe.CV Architecture
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
