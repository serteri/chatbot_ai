export interface BlogPost {
    id: number
    slug: string
    title: string
    excerpt: string
    content: string
    date: string
    author: string
    category: string
    image: string
}

export const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        slug: "understanding-2025-price-guide",
        title: "Understanding the 2025 Price Guide Changes",
        excerpt: "An in-depth analysis of the recent NDIS Price Guide adjustments and how they impact your agency's claiming strategy.",
        content: `
An in-depth analysis of the recent NDIS Price Guide adjustments and how they impact your agency's claiming strategy.

## Key Changes in the 2025/26 NDIS Price Guide

The NDIA has released its 2025-2026 Annual Pricing Review, bringing critical updates to support coordination, therapy support limits, and transport line items.

### 1. Adjustments to Core Supports
The hourly limits and price caps for standard intensity Core Supports have been indexed by 2.4% to match the Fair Work Commission wage decision. Agencies must ensure that service agreements explicitly outline these indexed gaps, particularly where participant budgets have not been entirely replenished.

### 2. Therapy Price Caps Stagnation
Despite lobbying from peak bodies, the price limits for occupational therapy, speech pathology, and psychology remain frozen. This emphasizes the critical need for absolute accuracy in scheduling and claiming to manage margins effectively.

### How NDIS Shield Hub Protects You
With our updated algorithmic checks, NDIS Shield Hub instantly blocks any invoice that attempts to claim standard weekday rates on public holidays, or claims above the mandated TTP (Temporary Transformation Payment) limits. This guarantees your business will not accidentally trigger an NDIA review for systemic over-claiming.
        `,
        date: "Oct 12, 2025",
        author: "Sarah Chembo",
        category: "Compliance Trends",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
    },
    {
        id: 2,
        slug: "top-5-audit-pitfalls",
        title: "Top 5 Audit Pitfalls",
        excerpt: "Don't get caught out during your next NDIS Commission Audit. We break down the top 5 areas agencies fail on.",
        content: `
Don't get caught out during your next NDIS Commission Audit. We break down the top 5 areas agencies fail on.

## Staying Ahead of the NDIS Quality and Safeguards Commission

Preparing for a certification or verification audit is notoriously stressful. Based on recent tribunal data, here are the top 5 pitfalls providers inevitably fall into:

### 1. Incomplete Incident Management Registers
One of the fastest ways to receive a non-conformance is a failure to properly document Reportable Incidents within the mandated 24-hour window. *Documentation is just as important as the incident response itself.*

### 2. Expired Worker Screening Checks
Relying on decentralized spreadsheets often results in staff working with participants while their NDIS Worker Screening Check is expired. This is an immediate critical breach.

### 3. Lack of Signed Service Agreements
While not legally mandated for every single support type, the Commission expects signed agreements. Not having them means you cannot prove the participant consented to the support prices.

### 4. Poor Progress Notes
Clinical and support worker notes that lack detail or fail to map back to the participant's explicit NDIS goals can result in reclaimed funds.

### 5. Ignoring Data Sovereignty
Using generic cloud storage that pushes participant health data offshore violates the Australian Privacy Principles.

**Solution**: NDIS Shield Hub centralizes your Worker Screenings, automatically flags missing Service Agreements, and enforces strictly localized Sydney-based Azure server storage. You remain perpetually Audit-Ready.
        `,
        date: "Oct 08, 2025",
        author: "Michael Chen",
        category: "Audit Preparation",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800&q=80"
    },
    {
        id: 3,
        slug: "accuracy-shield-protection",
        title: "How Accuracy Shield Protects You",
        excerpt: "Discover the technical mechanisms behind our flagship Accuracy Shield and how it prevents reclaim liabilities.",
        content: `
Discover the technical mechanisms behind our flagship Accuracy Shield and how it prevents reclaim liabilities.

## The Cost of Manual Invoicing

The average mid-sized NDIS provider loses approximately $40,000 annually to rejected claims, administrative rework, and accidental under-claiming. The complexity of the NDIS Support Catalogue makes manual invoicing a severe operational risk.

### Introducing Accuracy Shield
Accuracy Shield is our proprietary validation engine. Before you generate your bulk upload file for PRODA, the engine runs your data against 400+ specific compliance rules.

#### What Does It Check?
- **Line Item Validation**: Ensures the support category actually exists and is valid for the current financial year.
- **Participant Budget Checking**: Cross-references claimed amounts to ensure the participant's budget can cover the support.
- **Date/Time Overlaps**: Flags instances where a single worker is rostered to provide 1:1 support to two different participants at the exact same time.
- **Ratio Claims**: Ensures group pricing models are applied correctly.

### The Bottom Line
By catching these errors upstream, Accuracy Shield ensures your PRODA bulk upload is accepted on the first try. Say goodbye to the dreaded "Error 422" and reclaim your administrative time.
        `,
        date: "Oct 01, 2025",
        author: "Emma Wilson",
        category: "Product Updates",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
    }
]

export function getPostBySlug(slug: string): BlogPost | undefined {
    return MOCK_BLOG_POSTS.find(post => post.slug === slug)
}
