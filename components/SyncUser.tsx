"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function SyncUser() {
    const { isLoaded, isSignedIn, user } = useUser();
    const storeUser = useMutation(api.users.store);
    const searchParams = useSearchParams();
    const synced = useRef(false);

    useEffect(() => {
        if (isLoaded && isSignedIn && user && !synced.current) {
            const referredByCode = searchParams.get("ref") || undefined;
            storeUser({ referredByCode });
            synced.current = true;
        }
    }, [isLoaded, isSignedIn, user, storeUser, searchParams]);

    return null;
}
