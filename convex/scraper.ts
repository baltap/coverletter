import { v } from "convex/values";
import { action } from "./_generated/server";
import axios from "axios";
import * as cheerio from "cheerio";

export const scrape = action({
    args: { url: v.string() },
    handler: async (ctx, args) => {
        let targetUrl = args.url;

        // LinkedIn "Guest API" Transformation
        // Public LinkedIn URLs often hit login walls. The jobs-guest API is more permissive for bots.
        if (args.url.includes("linkedin.com/jobs/view")) {
            const idMatch = args.url.match(/(\d+)(?:\/|\?|$)/);
            if (idMatch) {
                targetUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${idMatch[1]}`;
                console.log(`Rewriting LinkedIn URL for guest access: ${targetUrl}`);
            }
        }

        try {
            const { data: html, status } = await axios.get(targetUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Referer": "https://www.google.com/",
                },
                timeout: 10000,
                validateStatus: (status) => status < 500, // Handle 4xx specifically
            });

            if (status === 403 || status === 401) {
                throw new Error("Access denied (403). This site might be blocking automated access. Please paste the description manually.");
            }
            if (status === 404) {
                throw new Error("Page not found (404). Please verify the link or paste the job description manually.");
            }

            const $ = cheerio.load(html);

            // 1. Remove obvious boilerplate/junk from the whole document first
            $('script, style, nav, footer, header, svg, iframe, button, input, form, noscript').remove();

            // Common selectors for job descriptions (expanded)
            const selectors = [
                '.jobdescription', // SAP specifically
                'div[class*="job-description"]',
                'div[class*="description"]',
                'div[id*="job-description"]',
                'div[class*="show-more-less-html"]', // LinkedIn specific
                'div[id="jobDescriptionText"]', // Indeed specific
                'section[class*="job-description"]',
                'main',
                'article',
                '.job-info',
                '.content',
                '.job-details',
            ];

            let extractedText = "";

            for (const selector of selectors) {
                const element = $(selector);
                if (element.length > 0) {
                    // Clean the Matched Subtree specifically
                    element.find('nav, footer, header, script, style, svg, button, form, noscript, iframe, link, meta').remove();
                    const text = element.text().trim();
                    if (text.length > 150) {
                        extractedText = text;
                        break;
                    }
                }
            }

            // Fallback: cleaning up body text if no targeted selector hits
            if (!extractedText) {
                const bodyText = $('body').text().trim();
                const lowerBody = bodyText.toLowerCase();

                // Specific LinkedIn "Walled Garden" check
                const isLinkedIn = args.url.toLowerCase().includes("linkedin.com");
                const hitLoginWall = lowerBody.includes("sign in") || lowerBody.includes("log in") || lowerBody.includes("join now");

                if (isLinkedIn && hitLoginWall) {
                    throw new Error("LinkedIn is blocking automated access (Login Wall). Please paste the job description manually—we'll still handle the writing!");
                }

                // Detect "Success-Redirect" error pages (200 status but error content)
                const errorPatterns = [
                    "error 404",
                    "page not found",
                    "could not be found",
                    "errortype=404",
                    "job no longer available",
                    "position no longer available",
                    "sign in to continue",
                    "internal server error",
                    "access denied",
                    "please log in",
                ];

                if (errorPatterns.some(pattern => lowerBody.includes(pattern))) {
                    const baseMsg = "Page not found or unavailable.";
                    const suffix = isLinkedIn ? " LinkedIn often requires a login to view full details." : "";
                    throw new Error(`${baseMsg}${suffix} Please verify the link or paste the job description manually.`);
                }

                extractedText = bodyText;
            }

            // High-fidelity cleaning: normalize whitespace and remove excessive tabs/newlines
            extractedText = extractedText
                .replace(/\s\s+/g, ' ') // Normalize multiple spaces/newlines to single space
                .replace(/\n\s*\n/g, '\n') // Remove empty lines
                .trim();

            if (!extractedText || extractedText.length < 100) {
                throw new Error("Could not find the job description on this page. Please paste it manually.");
            }

            // Limit length for token efficiency (3500 is plenty for extractJobDetails)
            console.log(`Scraped text length after cleaning: ${extractedText.length} characters`);
            return extractedText.slice(0, 3500);
        } catch (error: unknown) {
            const err = error as Error;
            console.error("Scraping error:", err);
            if (err.message.includes("Access denied") || err.message.includes("not found") || err.message.includes("Could not find")) {
                throw err;
            }
            throw new Error(`Failed to fetch job description (Error: ${err.message}). Please paste manually.`);
        }
    },
});
