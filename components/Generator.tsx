"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Sparkles, AlertCircle, Loader2, Lock } from "lucide-react";
import { SignInButton, SignUpButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

export default function Generator() {
    const [cvText, setCvText] = useState("");
    const [fileName, setFileName] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [generatedLetter, setGeneratedLetter] = useState("");
    const [generatedModel, setGeneratedModel] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [showCV, setShowCV] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generationStage, setGenerationStage] = useState<"idle" | "scraping" | "extracting" | "generating">("idle");
    const [limitReached, setLimitReached] = useState(false);
    const [guestGens, setGuestGens] = useState(0);

    const user = useQuery(api.users.currentUser);
    const isMax = useQuery(api.payments.getMaxStatus);
    const userHistory = useQuery(api.coverLetters.list);
    const updateCV = useMutation(api.users.updateCV);
    const saveLetter = useMutation(api.coverLetters.save);
    const generateLetter = useAction(api.ai.generate);
    const scrapeJob = useAction(api.scraper.scrape);
    const extractDetails = useAction(api.ai.extractJobDetails);
    const router = useRouter();
    const clerk = useClerk();

    const [isUpgrading, setIsUpgrading] = useState(false);

    const handleUpgrade = useCallback(async () => {
        setIsUpgrading(true);
        setError("");
        console.log("Starting upgrade process...");
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            console.log("Upgrade API Response:", data);

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError(data.error || "Failed to initiate checkout. Please check the console.");
                setIsUpgrading(false);
            }
        } catch (error: any) {
            console.error("Upgrade failed:", error);
            setError("Something went wrong with the payment system. Please try again later.");
            setIsUpgrading(false);
        }
    }, [user]);

    // Derived Capacity Tracking
    const remainingGens = useMemo(() => {
        if (isMax) return "UNLIMITED";
        if (user) {
            const count = userHistory?.length || 0;
            return Math.max(0, 3 - count).toString();
        }
        return Math.max(0, 1 - guestGens).toString();
    }, [user, isMax, userHistory, guestGens]);

    // 0. Initial load of guest stats
    useEffect(() => {
        if (typeof window !== "undefined") {
            const history = JSON.parse(localStorage.getItem("guest_history") || "[]");
            setGuestGens(history.length);
        }
    }, []);

    // 0b. Auto-trigger upgrade after login if pending
    useEffect(() => {
        if (user && isMax === false && localStorage.getItem("pending_max_purchase") === "true") {
            localStorage.removeItem("pending_max_purchase");
            handleUpgrade();
        }
    }, [user, isMax, handleUpgrade]);

    // 1. Load CV on mount
    useEffect(() => {
        const guestCV = localStorage.getItem("guest_cv");
        const guestFileName = localStorage.getItem("guest_cv_filename");
        if (user?.cvText) {
            setCvText(user.cvText);
            setFileName(user.cvFileName || "");
        } else if (guestCV) {
            setCvText(guestCV);
            setFileName(guestFileName || "");
        }
    }, [user?.cvText, user?.cvFileName]);

    // 2. Debounced save CV
    useEffect(() => {
        if (!cvText) return;

        const timer = setTimeout(async () => {
            if (user) {
                // Save to Convex for authenticated users
                try {
                    await updateCV({ cvText, cvFileName: fileName });
                } catch (err) {
                    console.error("Failed to auto-save CV to Convex:", err);
                }
            } else {
                // Save to localStorage for guests
                localStorage.setItem("guest_cv", cvText);
                localStorage.setItem("guest_cv_filename", fileName);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [cvText, fileName, user, updateCV]);

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsParsing(true);
        setError("");

        try {
            // Dynamic imports to avoid SSR issues
            const [mammoth, pdfjs] = await Promise.all([
                import("mammoth"),
                import("pdfjs-dist")
            ]);

            // Initialize PDF.js worker only on the client
            if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
                pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
            }

            const arrayBuffer = await file.arrayBuffer();
            let text = "";

            if (file.type === "application/pdf") {
                const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                let fullText = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(" ");
                    fullText += pageText + "\n";
                }
                text = fullText;
            } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else {
                throw new Error("Unsupported file type.");
            }

            setCvText(text);
            setFileName(file.name);
        } catch (err) {
            console.error("Parsing error:", err);
            setError("Failed to parse file. Please try pasting the text manually.");
        } finally {
            setIsParsing(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false
    });

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobUrl && !jobDescription) {
            setError("Please provide a job URL.");
            return;
        }

        // 0. Check guest limit
        if (!user) {
            const history = JSON.parse(localStorage.getItem("guest_history") || "[]");
            if (history.length >= 1) {
                setLimitReached(true);
                setWarning("Protocol Limit Reached: Guests are permitted 1 generation. Please establish a session for unlimited access.");
                return;
            }
        }

        // 0b. Check Max limit for signed-in users
        if (user && !isMax) {
            if (userHistory && userHistory.length >= 3) {
                setLimitReached(true);
                setWarning("Standard Capacity Reached: Your free generations are exhausted. Upgrade to MAX for unlimited editorial capacity.");
                return;
            }
        }

        setIsGenerating(true);
        setGenerationStage("scraping");
        setError("");
        setWarning("");

        try {
            let currentDescription = jobDescription;
            let currentCompany = companyName;
            let currentTitle = jobTitle;

            // 1. Auto-extract if we only have a URL
            if (jobUrl && (!jobDescription || !companyName || !jobTitle)) {
                try {
                    setGenerationStage("scraping");
                    const rawText = await scrapeJob({ url: jobUrl });

                    setGenerationStage("extracting");
                    const result = await extractDetails({ text: rawText });

                    if (result.success) {
                        const data = result as { success: true, jobDescription: string, companyName: string, jobTitle: string };
                        currentDescription = data.jobDescription;
                        currentCompany = data.companyName;
                        currentTitle = data.jobTitle;

                        // Sync state for history saving
                        setJobDescription(currentDescription);
                        setCompanyName(currentCompany);
                        setJobTitle(currentTitle);
                    } else {
                        // Soft extraction failure
                        setShowManual(true);
                        setWarning(result.error || "Details couldn't be auto-filled. Please paste them manually to continue!");
                        setIsGenerating(false);
                        setGenerationStage("idle");
                        return;
                    }
                } catch (scrapeErr: any) {
                    setShowManual(true);
                    setError(""); // Clear hard error
                    // Set a descriptive warning instead
                    setWarning(scrapeErr.message || "We hit a snag reading the link. Please paste the details manually below!");
                    setIsGenerating(false);
                    setGenerationStage("idle");
                    return;
                }
            }

            // 2. Generate Letter
            setGenerationStage("generating");
            const result = await generateLetter({
                cvText,
                jobDescription: currentDescription,
                companyName: currentCompany,
                jobTitle: currentTitle,
            });

            if (!result.success) {
                setWarning(result.error || "AI is temporarily busy. Please try again in a moment.");
                if (result.error?.includes("limit reached")) {
                    setLimitReached(true);
                }
                setIsGenerating(false);
                setGenerationStage("idle");
                return;
            }

            const letterText = result.data!;
            setGeneratedLetter(letterText);
            setGeneratedModel(result.model || "");

            // 3. Save to localStorage (fallback for guests)
            const guestLetter = {
                _id: "guest_" + Date.now(),
                jobUrl,
                jobDescription: currentDescription,
                coverLetter: letterText,
                companyName: currentCompany || "Untitled Company",
                jobTitle: currentTitle || "Position not specified",
                createdAt: Date.now(),
                isGuest: true
            };
            const existingHistory = JSON.parse(localStorage.getItem("guest_history") || "[]");
            const newHistory = [guestLetter, ...existingHistory.slice(0, 9)];
            localStorage.setItem("guest_history", JSON.stringify(newHistory));
            setGuestGens(newHistory.length);

            // 4. Save to history (only works if signed in)
            if (user) {
                try {
                    await saveLetter({
                        jobUrl,
                        jobDescription: currentDescription,
                        coverLetter: letterText,
                        companyName: currentCompany,
                        jobTitle: currentTitle,
                    });
                } catch (err) {
                    console.error("Failed to save letter to database:", err);
                }
            }
        } catch (err: any) {
            const msg = err.message || "Something went wrong. Please check your URL and try again.";
            setError(msg);
            console.error("Generation error:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col items-center pt-16 pb-24 px-6 max-w-[1000px] mx-auto">
            {/* Notifications */}
            <div className="w-full space-y-4 mb-8">
                {error && (
                    <div className="bg-red-50 border border-charcoal text-charcoal px-5 py-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {warning && (
                    <div className="bg-amber-50 border border-charcoal text-charcoal px-5 py-4 flex flex-col md:flex-row items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3 flex-grow">
                            {limitReached ? <Lock size={20} className="text-primary flex-shrink-0" /> : <Sparkles size={20} className="text-charcoal flex-shrink-0" />}
                            <p className="text-sm font-bold uppercase tracking-tight">{warning}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {limitReached && (
                                user ? (
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={isUpgrading}
                                        className="text-[10px] font-black underline uppercase tracking-widest text-primary hover:text-charcoal transition-colors disabled:opacity-50"
                                    >
                                        {isUpgrading ? "PREPARING..." : "UPGRADE TO PRO ($4.99)"}
                                    </button>
                                ) : (
                                    <SignInButton mode="modal">
                                        <button className="text-[10px] font-black underline uppercase tracking-widest text-primary hover:text-charcoal transition-colors">
                                            SIGN IN NOW
                                        </button>
                                    </SignInButton>
                                )
                            )}
                            <button
                                onClick={() => {
                                    setWarning("");
                                    setLimitReached(false);
                                }}
                                aria-label="Dismiss warning"
                                className="text-charcoal hover:text-primary font-black text-xs p-1 transition-colors"
                            >
                                DISMISS
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {!generatedLetter ? (
                <>
                    {/* Hero Section */}
                    <section className="mb-16 text-center md:text-left w-full">
                        <h1 className="serif-heading text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8 text-charcoal tracking-tight">
                            Your CV + Any Job Link<br />One Perfect Cover Letter.
                        </h1>
                        <p className="max-w-2xl text-lg md:text-xl font-normal leading-relaxed text-charcoal/70 mb-10">
                            Scribe.CV mirrors your experience to job requirements with surgical precision. Effortless matching, editorial quality.
                        </p>
                    </section>

                    {/* Generator Module */}
                    <section className="bg-white swiss-border p-2 md:p-2 mb-20 w-full overflow-hidden">
                        <div className="flex flex-col md:flex-row gap-2">
                            {/* Left Zone: Upload */}
                            <div
                                {...getRootProps()}
                                className={`flex-1 swiss-dashed p-10 flex flex-col items-center justify-center min-h-[350px] group transition-colors cursor-pointer
                                    ${isDragActive ? 'bg-zinc-100' : 'bg-transparent hover:bg-zinc-50'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="mb-4">
                                    {isParsing ? (
                                        <Loader2 size={40} className="animate-spin text-charcoal" />
                                    ) : (
                                        <span className="material-symbols-outlined text-5xl text-charcoal">
                                            {fileName ? 'description' : 'add'}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-extrabold text-sm uppercase tracking-[0.2em] mb-1">
                                    {fileName ? fileName : "Upload Resume"}
                                </h3>
                                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-charcoal/40">
                                    {isParsing ? "Analyzing Profile..." : "PDF, DOCX (Max 10MB)"}
                                </p>

                                {cvText && !isParsing && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCV(!showCV);
                                        }}
                                        className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary hover:text-charcoal transition-colors border-b-2 border-primary/20"
                                    >
                                        {showCV ? "Close Editor" : "Review Profile"}
                                    </button>
                                )}
                            </div>

                            {/* Right Zone: Input */}
                            <form onSubmit={handleGenerate} className="flex-1 p-10 flex flex-col justify-between min-h-[350px]">
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="font-extrabold text-[10px] uppercase tracking-[0.3em] block text-charcoal/60">Job Specification</label>
                                        <div className="relative group">
                                            <input
                                                value={jobUrl}
                                                onChange={(e) => {
                                                    setJobUrl(e.target.value);
                                                    setJobDescription("");
                                                    setCompanyName("");
                                                    setJobTitle("");
                                                    setError("");
                                                    setWarning("");
                                                }}
                                                className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal outline-none py-4 text-sm font-bold placeholder:text-charcoal/20 transition-colors"
                                                placeholder="Paste LinkedIn or Company URL..."
                                                type="url"
                                                required
                                            />
                                            {isGenerating && generationStage === "scraping" && (
                                                <div className="absolute right-0 bottom-4">
                                                    <Loader2 size={16} className="animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(companyName || jobTitle) && !showManual && (
                                        <div className="p-4 bg-zinc-50 border-l-4 border-primary animate-in fade-in slide-in-from-left-2">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Context Identified</p>
                                            <p className="text-sm font-black text-charcoal truncate">{jobTitle}</p>
                                            <p className="text-xs font-bold text-charcoal/50 truncate">at {companyName}</p>
                                            <button
                                                type="button"
                                                onClick={() => setShowManual(true)}
                                                className="mt-2 text-[9px] font-black uppercase tracking-widest border-b border-charcoal/20"
                                            >
                                                Manual Override
                                            </button>
                                        </div>
                                    )}

                                    {showManual && (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    placeholder="ENTITY"
                                                    className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal outline-none py-2 text-[10px] font-black uppercase tracking-widest"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    required
                                                />
                                                <input
                                                    placeholder="POSITION"
                                                    className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal outline-none py-2 text-[10px] font-black uppercase tracking-widest"
                                                    value={jobTitle}
                                                    onChange={(e) => setJobTitle(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <textarea
                                                placeholder="PASTE REQUIREMENTS..."
                                                className="w-full bg-zinc-50 border border-charcoal/10 p-3 outline-none text-xs font-bold leading-relaxed min-h-[100px] resize-none"
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowManual(false)}
                                                className="text-[9px] font-black uppercase tracking-widest text-charcoal/40"
                                            >
                                                Revert to Auto
                                            </button>
                                        </div>
                                    )}

                                    {!jobDescription && !showManual && (
                                        <div className="pt-2">
                                            <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest leading-relaxed">
                                                AI will extract technical requirements, culture fit indicators, and key metrics to match your tone.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 space-y-3">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/30">Capacity Balance</p>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${remainingGens === "0" ? 'text-primary' : 'text-charcoal'}`}>
                                            {remainingGens} {remainingGens === "UNLIMITED" ? "" : (remainingGens === "1" ? "Generation Left" : "Generations Left")}
                                        </span>
                                    </div>
                                    {remainingGens === "0" && !isGenerating ? (
                                        user ? (
                                            <button
                                                type="button"
                                                onClick={handleUpgrade}
                                                disabled={isUpgrading}
                                                className="w-full bg-primary text-white py-5 font-black text-sm uppercase tracking-[0.3em] hover:brightness-110 transition-all rounded-sm flex items-center justify-center gap-2"
                                            >
                                                {isUpgrading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                                {isUpgrading ? "PREPARING..." : "UPGRADE TO MAX — $4.99"}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    localStorage.setItem("pending_max_purchase", "true");
                                                    clerk.openSignIn({
                                                        afterSignInUrl: "/?trigger_upgrade=true"
                                                    });
                                                }}
                                                className="w-full bg-primary text-white py-5 font-black text-sm uppercase tracking-[0.3em] hover:brightness-110 transition-all rounded-sm flex items-center justify-center gap-2"
                                            >
                                                <Lock size={18} />
                                                SIGN UP TO CONTINUE
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isGenerating || !cvText || !jobUrl}
                                            className="w-full bg-primary text-white py-5 font-black text-sm uppercase tracking-[0.3em] hover:brightness-110 transition-all rounded-sm disabled:opacity-50 disabled:grayscale"
                                        >
                                            {isGenerating ? (
                                                <span className="flex items-center justify-center gap-3">
                                                    <Loader2 size={18} className="animate-spin" />
                                                    {generationStage === "scraping" && "SCANNING..."}
                                                    {generationStage === "extracting" && "EXTRACTING..."}
                                                    {generationStage === "generating" && "PRODUCING..."}
                                                </span>
                                            ) : (
                                                "Start My Free Letter"
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* Process Flow */}
                    <section className="border-t border-charcoal/10 pt-16 w-full">
                        <h2 className="sr-only">How Scribe.CV Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black px-2 py-1 bg-charcoal text-white rounded-sm">01</span>
                                    <h4 className="font-extrabold text-sm uppercase tracking-widest">Extract Your Best</h4>
                                </div>
                                <p className="text-sm leading-relaxed text-charcoal/60 font-medium">
                                    We programmatically extract core competencies, leadership history, and quantifiable achievements from your professional document.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black px-2 py-1 bg-charcoal text-white rounded-sm">02</span>
                                    <h4 className="font-extrabold text-sm uppercase tracking-widest">Mirror Their Language</h4>
                                </div>
                                <p className="text-sm leading-relaxed text-charcoal/60 font-medium">
                                    Mapping requirements from the live job posting to identify exactly what the hiring manager is looking for in a candidate.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black px-2 py-1 bg-charcoal text-white rounded-sm">03</span>
                                    <h4 className="font-extrabold text-sm uppercase tracking-widest">Shipped to Inbox</h4>
                                </div>
                                <p className="text-sm leading-relaxed text-charcoal/60 font-medium">
                                    Generating a high-conversion editorial letter that bridges the gap between your history and their future needs.
                                </p>
                            </div>
                        </div>
                    </section>

                    {!user && (
                        <>
                            {/* ATS Alignment Authority Section */}
                            <section className="mt-32 w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                                <div className="space-y-8">
                                    <h2 className="serif-heading text-4xl md:text-5xl font-extrabold leading-tight text-charcoal">
                                        Engineered for the <span className="text-primary italic">ATS Era.</span>
                                    </h2>
                                    <p className="text-lg leading-relaxed text-charcoal/70">
                                        Most AI writers produce "generic fluff" that gets flagged by Applicant Tracking Systems (ATS). Scribe.CV uses a proprietary <strong>Alignment Engine</strong> to map the specific keywords and technical requirements from the job link directly to your career history.
                                    </p>
                                    <ul className="space-y-4">
                                        {[
                                            { title: "Keyword Synchronization", desc: "Identifies and matches high-priority skills automatically." },
                                            { title: "Recruiter-Approved Tone", desc: "Professional, authoritative, and human-centric output." },
                                            { title: "Zero Flagging", desc: "Output that passes through modern AI detection filters with ease." }
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-4">
                                                <div className="w-1.5 h-1.5 bg-primary mt-1.5 shrink-0" />
                                                <div>
                                                    <span className="block text-xs font-black uppercase tracking-widest text-charcoal">{item.title}</span>
                                                    <span className="text-sm text-charcoal/50 font-medium">{item.desc}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-zinc-50 swiss-border p-12 aspect-square flex flex-col justify-center gap-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45" />
                                    <div className="space-y-4 relative">
                                        <div className="h-2 w-32 bg-charcoal/10" />
                                        <div className="h-2 w-48 bg-charcoal/10" />
                                        <div className="h-10 w-full bg-primary/10 border-l-4 border-primary p-4 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">MATCH DETECTED: LEADERSHIP SIGNAL</span>
                                            <Sparkles size={12} className="text-primary" />
                                        </div>
                                        <div className="h-2 w-40 bg-charcoal/10" />
                                        <div className="h-2 w-52 bg-charcoal/10" />
                                    </div>
                                    <div className="mt-8 border-t border-charcoal/5 pt-8">
                                        <p className="text-[10px] font-mono text-charcoal/30 uppercase tracking-[0.4em]">ANALYSIS: 98% ALIGNMENT CONFIDENCE</p>
                                    </div>
                                </div>
                            </section>

                            {/* Generic vs Scribe Section */}
                            <section className="mt-32 w-full pt-32 border-t border-charcoal/10">
                                <div className="max-w-3xl mb-20 text-center md:text-left">
                                    <h2 className="serif-heading text-4xl md:text-5xl font-extrabold mb-8 text-charcoal">The Contextual Advantage.</h2>
                                    <p className="text-xl text-charcoal/60 leading-relaxed">
                                        Don't just "generate" a letter. Architect a persona that mirrors your next role.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-12 border border-charcoal/10 space-y-6">
                                        <h3 className="font-extrabold text-[10px] uppercase tracking-[0.4em] text-charcoal/30">Generic AI Templates</h3>
                                        <p className="text-sm font-medium text-charcoal/60">"I am excited to apply for the [Position] at [Company]. I have 5 years of experience in [Skill]..."</p>
                                        <div className="inline-flex gap-2 items-center px-3 py-1 bg-red-50 text-red-500 text-[9px] font-black uppercase tracking-widest">
                                            <AlertCircle size={10} /> RECRUITER FRICTION
                                        </div>
                                    </div>
                                    <div className="p-12 bg-charcoal text-white space-y-6">
                                        <h3 className="font-extrabold text-[10px] uppercase tracking-[0.4em] text-primary">Scribe.CV (Aligned)</h3>
                                        <p className="text-sm font-medium text-white/80">"Analyzing your recent expansion into Fintech, my background scaling Ruby microservices at Stripe mirrors your current technical roadmap..."</p>
                                        <div className="inline-flex gap-2 items-center px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest">
                                            <Sparkles size={10} /> HIGH CONVERSION
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* FAQ FAQ Section for rich snippets */}
                            <section className="mt-32 w-full pt-32 border-t border-charcoal/10">
                                <h2 className="serif-heading text-4xl md:text-5xl font-extrabold mb-16 text-charcoal text-center">Frequently Asked.</h2>
                                <div className="max-w-3xl mx-auto space-y-4">
                                    {[
                                        { q: "Will the hiring manager know it's AI?", a: "Scribe.CV is designed for zero AI-footprint. It uses your specific career vectors to create a letter that sounds like a professional peer, not a chatbot." },
                                        { q: "Is Scribe.CV ATS-friendly?", a: "Yes. By mapping keywords from the job description link directly into the prose, we ensure your application hits the correct 'skill triggers' for modern Applicant Tracking Systems." },
                                        { q: "Can I use it for LinkedIn postings?", a: "Precisely. Paste any LinkedIn, Indeed, or Greenhouse URL, and our scraper will extract the context automatically." }
                                    ].map((faq, i) => (
                                        <details key={i} className="group swiss-border bg-white cursor-pointer">
                                            <summary className="p-8 font-black text-xs uppercase tracking-widest list-none flex justify-between items-center group-open:bg-zinc-50 transition-colors">
                                                {faq.q}
                                                <span className="material-symbols-outlined text-charcoal/30 group-open:rotate-180 transition-transform">expand_more</span>
                                            </summary>
                                            <div className="px-8 pb-8 pt-4 text-sm font-medium text-charcoal/60 leading-relaxed bg-zinc-50">
                                                {faq.a}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}

                    {/* Membership Tiers */}
                    <section className="mt-24 w-full">
                        <h2 className="sr-only">Membership Tiers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-charcoal/10 text-left">
                            <div className="p-10 space-y-8 border-b md:border-b-0 md:border-r border-charcoal/10 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h4 className="font-extrabold text-[10px] uppercase tracking-[0.4em] text-charcoal/40">Tier 01</h4>
                                    <h3 className="serif-heading text-2xl font-black">Guest</h3>
                                    <p className="text-sm font-medium text-charcoal/60 leading-relaxed">
                                        1 Free Generation. Identity extraction and local persistence included.
                                    </p>
                                </div>
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="w-full py-4 border border-charcoal text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-50 transition-colors cursor-pointer"
                                >
                                    Start Generating
                                </button>
                            </div>
                            <div className="p-10 space-y-8 border-b md:border-b-0 md:border-r border-charcoal/10 bg-zinc-50 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h4 className="font-extrabold text-[10px] uppercase tracking-[0.4em] text-primary">Tier 02</h4>
                                    <h3 className="serif-heading text-2xl font-black">Member</h3>
                                    <p className="text-sm font-medium text-charcoal/60 leading-relaxed">
                                        3 Free Generations. Automatic CV persistence and cloud history synchronization.
                                    </p>
                                </div>
                                {user ? (
                                    <button disabled className="w-full py-4 bg-charcoal/10 text-charcoal/40 text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">
                                        Current Plan
                                    </button>
                                ) : (
                                    <SignUpButton mode="modal">
                                        <button className="w-full py-4 bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-colors cursor-pointer">
                                            Sign Up Free
                                        </button>
                                    </SignUpButton>
                                )}
                            </div>
                            <div className="p-10 space-y-8 bg-charcoal text-white flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-extrabold text-[10px] uppercase tracking-[0.4em] text-primary">Tier 03</h4>
                                        <span className="px-2 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <Sparkles size={8} /> LIFETIME
                                        </span>
                                    </div>
                                    <h3 className="serif-heading text-2xl font-black">Max</h3>
                                    <p className="text-sm font-medium text-white/60 leading-relaxed">
                                        Unlimited Generations. Full access for a $4.99 one-time editorial license.
                                    </p>
                                </div>
                                {!user ? (
                                    <button
                                        onClick={() => {
                                            localStorage.setItem("pending_max_purchase", "true");
                                            clerk.openSignIn({
                                                afterSignInUrl: "/?trigger_upgrade=true"
                                            });
                                        }}
                                        className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all cursor-pointer"
                                    >
                                        Get Lifetime Max
                                    </button>
                                ) : isMax ? (
                                    <button disabled className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                        <Sparkles size={10} /> Active
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={isUpgrading}
                                        className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {isUpgrading ? "Preparing..." : "Get Lifetime Max"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Syntax Overlay (Optional Editor) */}
                    {showCV && (
                        <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                            <div className="bg-white w-full max-w-2xl swiss-border p-10 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="serif-heading text-2xl font-bold">Profile Content</h2>
                                    <button aria-label="Close editor" onClick={() => setShowCV(false)} className="material-symbols-outlined">close</button>
                                </div>
                                <textarea
                                    className="w-full h-80 bg-zinc-50 swiss-border p-6 outline-none text-xs font-bold leading-relaxed scrollbar-hide"
                                    value={cvText}
                                    onChange={(e) => setCvText(e.target.value)}
                                />
                                <button
                                    onClick={() => setShowCV(false)}
                                    className="w-full bg-charcoal text-white py-4 font-black text-xs uppercase tracking-[0.3em]"
                                >
                                    COMMIT CHANGES
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Results Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-charcoal/10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Generation Complete</p>
                            <h2 className="serif-heading text-4xl md:text-5xl font-extrabold text-charcoal tracking-tight">
                                Your Document.
                            </h2>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setGeneratedLetter("")}
                                className="px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-charcoal hover:bg-zinc-100 transition-colors bg-white swiss-border"
                            >
                                NEW TASK
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedLetter);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className={`px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-black transition-all ${copied
                                    ? "bg-primary text-white"
                                    : "bg-charcoal text-white hover:bg-primary"
                                    }`}
                            >
                                {copied ? "COPIED" : "COPY DOCUMENT"}
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="bg-white swiss-border p-12 md:p-20 relative">
                        <div className="max-w-2xl mx-auto space-y-8">
                            <div className="whitespace-pre-wrap font-serif text-[#333] leading-[1.8] text-xl cursor-text selection:bg-primary/20">
                                {generatedLetter}
                            </div>

                            {generatedModel && (
                                <div className="pt-12 border-t border-charcoal/10 text-charcoal/30 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={10} className="text-primary" />
                                        <span>SYSTEM: {generatedModel.replace("models/", "")}</span>
                                    </div>
                                    {user && (
                                        <button
                                            onClick={() => router.push("/history")}
                                            className="hover:text-charcoal transition-colors underline decoration-charcoal/10"
                                        >
                                            ARCHIVE HISTORY
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
