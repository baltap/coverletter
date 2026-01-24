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
import { LogOut, Menu, X } from "lucide-react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
            <header className="flex items-center justify-between px-6 md:px-20 py-6 fixed top-0 left-0 right-0 z-[150] bg-white/40 backdrop-blur-md saturate-[200%] border-b border-white/30 shadow-md w-full">
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
                                    Scribe
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
                                            <button className="text-xs uppercase tracking-[0.2em] font-bold hover:text-primary transition-colors cursor-pointer mr-4">
                                                Login
                                            </button>
                                        </SignInButton>
                                        <SignUpButton mode="modal">
                                            <button className="bg-charcoal text-white px-6 py-2 text-xs uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-primary transition-all cursor-pointer">
                                                Join Free
                                            </button>
                                        </SignUpButton>
                                    </div>
                                </SignedOut>
                                <SignedIn>
                                    <div className="flex items-center gap-4 md:gap-6">
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
            <div className="h-[82px] md:h-[88px]" />

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
                            Scribe
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
