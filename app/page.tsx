"use client";

import { Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import Generator from "@/components/Generator";

export default function Home() {
  return (
    <main className="p-0 min-h-screen">
      <Generator />

    </main>
  );
}
