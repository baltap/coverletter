"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useRef } from "react";

export default function SyncUser() {
    const { isLoaded, isSignedIn, user } = useUser();
    const storeUser = useMutation(api.users.store);
    const synced = useRef(false);

    useEffect(() => {
        if (isLoaded && isSignedIn && user && !synced.current) {
            storeUser();
            synced.current = true;
        }
    }, [isLoaded, isSignedIn, user, storeUser]);

    return null;
}
