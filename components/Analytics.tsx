"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function Analytics({ gaId }: { gaId: string }) {
    const [shouldTrack, setShouldTrack] = useState<boolean | null>(null);

    useEffect(() => {
        // Check local storage for exclusion flag
        const isExcluded = localStorage.getItem("scribe_cv_exclude_ga") === "true";
        setShouldTrack(!isExcluded);

        if (isExcluded) {
            console.log("📊 GA Tracking disabled: 'scribe_cv_exclude_ga' flag found in localStorage.");
        }
    }, []);

    // While checking, render nothing to avoid hydration mismatch
    if (shouldTrack === null) return null;
    if (!shouldTrack) return null;

    return <GoogleAnalytics gaId={gaId} />;
}
