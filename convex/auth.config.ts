import { AuthConfig } from "convex/server";

export default {
  providers: [
    // Uncomment this once you have set up a Clerk app
    {
      domain: "https://happy-antelope-82.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
