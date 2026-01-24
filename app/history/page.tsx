"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format } from "date-fns";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface Letter {
    _id: Id<"coverLetters"> | string;
    companyName?: string;
    jobTitle?: string;
    jobUrl?: string;
    coverLetter: string;
    createdAt: number;
    isGuest?: boolean;
}

export default function HistoryPage() {
    const convexLetters = useQuery(api.coverLetters.list);
    const removeLetter = useMutation(api.coverLetters.remove);
    const [guestLetters, setGuestLetters] = useState<Letter[]>([]);
    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("guest_history");
        if (stored) {
            try {
                setGuestLetters(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse guest history", e);
            }
        }
    }, []);

    const handleDelete = async (e: React.MouseEvent, letter: Letter) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this cover letter?")) return;

        if (letter.isGuest) {
            const updated = guestLetters.filter(l => l._id !== letter._id);
            setGuestLetters(updated);
            localStorage.setItem("guest_history", JSON.stringify(updated));
        } else {
            await removeLetter({ id: letter._id as Id<"coverLetters"> });
        }
    };

    const handleCopy = () => {
        if (selectedLetter?.coverLetter) {
            navigator.clipboard.writeText(selectedLetter.coverLetter);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (convexLetters === undefined) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-xs uppercase tracking-widest text-charcoal/40 animate-pulse">
                    SYNCHRONIZING ARCHIVES...
                </div>
            </div>
        );
    }

    const allLetters = [...(convexLetters || []).map(l => ({ ...l, isGuest: false })), ...guestLetters].sort((a, b) => b.createdAt - a.createdAt);

    if (allLetters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
                <div className="w-20 h-20 swiss-border flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-charcoal/20">folder_off</span>
                </div>
                <div className="text-center flex flex-col gap-2">
                    <h2 className="serif-heading text-3xl">NO ARCHIVES FOUND</h2>
                    <p className="text-xs uppercase tracking-widest text-charcoal/60">
                        THE ARCHIVE LAYER IS CURRENTLY VACANT.
                    </p>
                </div>
                <Link
                    href="/"
                    className="px-10 py-4 bg-charcoal text-white text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors"
                >
                    INITIATE GENERATION
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-24 pb-32">
                {/* Typographic Hero */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 pb-12 border-b border-charcoal">
                    <div className="max-w-4xl">
                        <h1 className="serif-heading text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8 text-charcoal tracking-tight">
                            Archives
                        </h1>
                        <p className="max-w-2xl text-lg md:text-xl font-normal leading-relaxed text-charcoal/70">
                            Every tailored document, stored in your personal vault.
                        </p>
                    </div>
                    <div className="mt-12 md:mt-0 text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal">
                            {allLetters.length} {allLetters.length === 1 ? "Entry" : "Entries"}
                        </p>
                    </div>
                </div>

                {/* Archive List Header (Desktop Only) */}
                <div className="hidden md:grid grid-cols-12 gap-8 px-6 py-8 border-b border-charcoal/10 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black opacity-30">
                    <div className="col-span-5">Company</div>
                    <div className="col-span-3">Role</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>

                <div className="divide-y divide-charcoal/10">
                    {allLetters.map((letter, index) => (
                        <div
                            key={letter._id?.toString() || `letter-${index}`}
                            className="group relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center px-6 py-8 md:py-10 hover:bg-charcoal/[0.02] transition-colors cursor-pointer"
                            onClick={() => setSelectedLetter(letter)}
                        >
                            <div className="col-span-5 flex items-center gap-4">
                                <h3 className="serif-heading text-3xl md:text-4xl font-extrabold truncate leading-none">
                                    {letter.companyName || "Untitled"}
                                </h3>
                                {letter.isGuest && (
                                    <span className="font-mono text-[8px] border border-charcoal/20 px-2 py-0.5 uppercase tracking-widest text-charcoal/40">Ephemeral</span>
                                )}
                            </div>
                            <div className="col-span-3">
                                <span className="font-mono text-[11px] md:text-sm uppercase tracking-[0.1em] text-charcoal/50 group-hover:text-charcoal transition-colors">
                                    {letter.jobTitle || "N/A"}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="font-mono text-[12px] md:text-[13px] font-medium tracking-tight text-charcoal/40 group-hover:text-charcoal transition-colors">
                                    {letter.createdAt ? format(new Date(letter.createdAt), "dd.MM.yyyy") : "N/A"}
                                </span>
                            </div>
                            <div className="col-span-2 text-right flex items-center justify-end gap-6">
                                <button
                                    onClick={(e) => handleDelete(e, letter)}
                                    className="p-2 text-charcoal/20 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                                <button className="px-6 py-3 border border-charcoal/10 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-black group-hover:border-charcoal group-hover:bg-charcoal group-hover:text-white transition-all">
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Refinement */}
                <div className="mt-32 flex flex-col items-center">
                    <button className="group relative">
                        <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-black text-charcoal/40 group-hover:text-charcoal transition-colors">
                            Load Archive 02 — 09
                        </span>
                        <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-charcoal transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* Premium Document Modal */}
            {selectedLetter && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-charcoal/80 backdrop-blur-md"
                        onClick={() => setSelectedLetter(null)}
                    />
                    <div className="relative w-full max-w-5xl h-[95vh] md:h-[90vh] bg-[#FFF] swiss-border flex flex-col shadow-3xl animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden m-4 md:m-0">
                        {/* Control Bar */}
                        <div className="px-8 py-6 border-b border-charcoal/10 flex justify-between items-center bg-[#FFF]">
                            <div className="flex items-center gap-8">
                                <Link href="/" className="serif-heading text-xl font-black hover:text-primary transition-colors">SCRIBE.CV</Link>
                                <div className="h-4 w-px bg-charcoal/20" />
                                <div className="font-mono text-[10px] uppercase tracking-widest text-charcoal/40">
                                    Archive ID: {selectedLetter._id?.toString().substring(0, 8) || "GUEST"}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleCopy}
                                    className={`px-8 py-3 font-mono text-[10px] font-black tracking-[0.3em] uppercase transition-all ${copied ? 'bg-primary text-white' : 'bg-charcoal text-white hover:bg-primary'}`}
                                >
                                    {copied ? 'Copied' : 'Copy Document'}
                                </button>
                                <button
                                    onClick={() => setSelectedLetter(null)}
                                    className="p-2 text-charcoal/40 hover:text-charcoal transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Editorial Body */}
                        <div className="flex-1 overflow-y-auto p-12 md:p-32 bg-[#F9F9F9]">
                            <div className="max-w-3xl mx-auto bg-white p-12 md:p-24 shadow-sm min-h-full swiss-border border-charcoal/5">
                                <div className="mb-20 pb-12 border-b border-charcoal/10">
                                    <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-charcoal/30 mb-8">Generated Communication</div>
                                    <h2 className="serif-heading text-6xl font-black mb-4 leading-none">{selectedLetter.companyName || "Recipient"}</h2>
                                    <div className="font-mono text-xs uppercase tracking-widest text-charcoal/50">{selectedLetter.jobTitle || "Position Details"}</div>
                                </div>
                                <div className="whitespace-pre-wrap font-serif text-[#1A1A1A] leading-[1.7] text-xl md:text-2xl tracking-tight selection:bg-primary selection:text-white">
                                    {selectedLetter.coverLetter}
                                </div>
                                <div className="mt-32 pt-12 border-t border-charcoal/5 font-mono text-[10px] uppercase tracking-widest text-charcoal/20">
                                    End of document. Internal copy only.
                                </div>
                            </div>
                        </div>

                        {/* Meta Footer */}
                        <div className="px-8 py-6 border-t border-charcoal/10 bg-[#FFF] flex justify-between items-center font-mono text-[9px] font-bold tracking-[0.3em] text-charcoal/30 uppercase">
                            <span>Timestamp: {selectedLetter.createdAt ? format(new Date(selectedLetter.createdAt), "dd.MM.yyyy HH:mm:ss") : "N/A"}</span>
                            <span>Scribe.CV Intelligence Archive Layer</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
