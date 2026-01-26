import { AuthConfig } from "convex/server";

export default {
  providers: [
    // Uncomment this once you have set up a Clerk app
    {
      domain: "https://clerk.scribe.cv",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
