"use client";

import Script from "next/script";

export default function JsonLd() {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Scribe.CV",
        "url": "https://scribe.cv",
        "logo": "https://scribe.cv/android-chrome-512x512.png", // Using high-res icon as logo
        "description": "Contextual AI Cover Letter Generator for career alignment."
    };

    const softwareApplicationSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Scribe.CV",
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "offers": {
            "@type": "Offer",
            "price": "4.99",
            "priceCurrency": "USD"
        },
        "description": "AI-powered tool that mirrors your experience to job requirements for tailored cover letters."
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Will the hiring manager know it's AI?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Scribe.CV is designed for zero AI-footprint. It uses your specific career vectors to create a letter that sounds like a professional peer, not a chatbot."
                }
            },
            {
                "@type": "Question",
                "name": "Is Scribe.CV ATS-friendly?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. By mapping keywords from the job description link directly into the prose, we ensure your application hits the correct skill triggers for modern Applicant Tracking Systems."
                }
            },
            {
                "@type": "Question",
                "name": "Can I use it for LinkedIn postings?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Precisely. Paste any LinkedIn, Indeed, or Greenhouse URL, and our scraper will extract the context automatically."
                }
            }
        ]
    };

    return (
        <>
            <Script
                id="org-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <Script
                id="software-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
            />
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
