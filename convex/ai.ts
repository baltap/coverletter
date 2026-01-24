import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt } from "./style_guidelines";
import { api } from "./_generated/api";

export const generate = action({
    args: {
        cvText: v.string(),
        jobDescription: v.string(),
        companyName: v.string(),
        jobTitle: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; data?: string; model?: string; error?: string }> => {
        // 1. Backend Usage Check
        const usage: any = await ctx.runQuery(api.users.checkUsage, {});
        if (!usage.allowed) {
            return { success: false, error: (usage.reason as string) || "Monthly generation limit reached." };
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const modelsToTry = [
            "gemini-3-flash-preview",
            "gemini-3-pro-preview",
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ];

        console.log(`Generating cover letter for ${args.jobTitle} at ${args.companyName}...`);

        const prompt = `
      ${getSystemPrompt()}

      CONTEXT:
      Candidate CV:
      ${args.cvText}

      Job Description:
      ${args.jobDescription}

      TARGET DETAILS:
      Company: ${args.companyName}
      Position: ${args.jobTitle}

      FINAL CONSTRAINTS:
      - Length: Under 400 words.
      - DO NOT use generic placeholders like [Company Name] except for the candidate's name which should be [My Name].
      - Output ONLY the cover letter text in Markdown format.
    `;

        let lastError = null;
        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (text) {
                    return { success: true, data: text, model: modelName };
                }
            } catch (err: unknown) {
                const error = err as Error;
                const errorStr = (error.message || "").toLowerCase();
                const isQuotaError = errorStr.includes("429") || errorStr.includes("quota");
                const isOverloaded = errorStr.includes("503") || errorStr.includes("overload");

                console.error(`Model ${modelName} failed${isQuotaError ? " (Rate Limit)" : isOverloaded ? " (Overloaded)" : ""}:`, error.message);
                lastError = error.message || "Unknown error";

                // Continue to next model even on rate limits - different models have independent quotas
            }
        }

        const errorStr = lastError?.toLowerCase() || "";
        let finalError = "AI is temporarily unavailable. Please try again in a minute.";

        const isDailyLimit = errorStr.includes("daily") || errorStr.includes("quota exceeded") || errorStr.includes("limit exceeded") || errorStr.includes("exhausted");

        if (errorStr.includes("429") || errorStr.includes("quota")) {
            finalError = isDailyLimit
                ? "Daily AI limit reached. Please try again tomorrow or use a different API key."
                : "AI is temporarily busy (minute limit reached). Please wait 60 seconds and try again.";
        } else if (errorStr.includes("503") || errorStr.includes("overload")) {
            finalError = "AI servers are currently busy. Please try again in a few moments.";
        }

        return { success: false, error: finalError };
    },
});

export const extractJobDetails = action({
    args: { text: v.string() },
    handler: async (ctx, args): Promise<{ success: boolean; companyName?: string; jobTitle?: string; jobDescription?: string; error?: string }> => {
        // 1. Backend Usage Check
        const usage: any = await ctx.runQuery(api.users.checkUsage, {});
        if (!usage.allowed) {
            return { success: false, error: (usage.reason as string) || "Usage limit reached." };
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelsToTry = [
            "gemini-3-flash-preview",
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-flash-latest"
        ];
        let lastError = null;

        console.log(`Job description text length: ${args.text.length} characters`);

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting extraction with ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const prompt = `
          Extract the following from this job description text:
          1. Company Name
          2. Job Title
          3. A clean version of the Job Description (remove headers/footers/ads)

          Output ONLY a valid JSON object with keys: "companyName", "jobTitle", "jobDescription".
          If the text provided does not appear to be a job description, return an empty object {}.
          DO NOT include markdown formatting or backticks in the response.

          TEXT:
          ${args.text}
        `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let text = response.text();

                // Clean up any markdown code blocks or edge cases
                text = text.replace(/```json|```/g, "").trim();

                // If the response contains extra text before/after the JSON, try to extract just the JSON part
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    text = jsonMatch[0];
                }

                try {
                    const parsed = JSON.parse(text);
                    if (!parsed.jobTitle && !parsed.jobDescription) {
                        throw new Error("The page content doesn't look like a job description. Please verify the link or paste details manually.");
                    }
                    console.log(`Success with ${modelName}`);
                    return { success: true, ...parsed };
                } catch (jsonErr: unknown) {
                    const error = jsonErr as Error;
                    console.error(`Extraction failed for ${modelName}:`, error.message);
                    throw error;
                }
            } catch (err: unknown) {
                const error = err as Error;
                const errorStr = (error.message || "").toLowerCase();
                const isQuotaError = errorStr.includes("429") || errorStr.includes("quota");
                const isOverloaded = errorStr.includes("503") || errorStr.includes("overload");

                console.error(`Model ${modelName} failed${isQuotaError ? " (Rate Limit)" : isOverloaded ? " (Overloaded)" : ""}:`, error.message);
                lastError = error.message || "Unknown error";

                // Continue to next model even on rate limits - different models have independent quotas
            }
        }

        const errorStr = lastError?.toLowerCase() || "";
        const isDailyLimit = errorStr.includes("daily") || errorStr.includes("quota exceeded") || errorStr.includes("limit exceeded") || errorStr.includes("exhausted");
        let finalError = lastError || "Details couldn't be auto-filled. Please paste them manually to continue!";

        if (errorStr.includes("429") || errorStr.includes("quota")) {
            finalError = isDailyLimit
                ? "Daily AI extraction limit reached. Please paste details manually or try again tomorrow."
                : "AI is temporarily busy (minute limit reached). Please wait 60 seconds or paste details manually.";
        } else if (errorStr.includes("503") || errorStr.includes("overload")) {
            finalError = "AI servers are currently busy. Please paste details manually or try in a few moments!";
        }

        return { success: false, error: finalError };
    },
});

export const debugListModels = action({
    args: {},
    handler: async () => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

        // Use standard fetch to check the ListModels endpoint
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json() as { models?: { name: string }[] };
            console.log("AVAILABLE MODELS:", JSON.stringify(data.models?.map(m => m.name)));
            return { success: true, models: data.models?.map(m => m.name) || [] };
        } catch (err: unknown) {
            const error = err as Error;
            console.error("DIAGNOSTIC FAILED:", error.message);
            return { success: false, error: error.message };
        }
    }
});
