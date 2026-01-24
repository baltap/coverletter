import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
    matcher: [
        // ONLY apply middleware to these specific API routes
        // This prevents the "blank page" issue on the main site
        "/api/stripe/checkout",
        "/api/stripe/webhook"
    ],
};
