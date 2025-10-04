import { defineCollection, z } from "astro:content";

// Tours (Markdown + frontmatter)
const tours = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    price: z.number(),
    duration: z.string(),
    image: z.string(),
    booking_url: z.string().url(),
    short_description: z.string().optional(), // keep optional to avoid breaking existing content
    active: z.boolean().default(true),
    order: z.number().int().default(0),
    featured: z.boolean().default(false),
    tour_type: z.enum(["standard", "package"]).default("standard"),
  }),
});

// Blog posts (Markdown + frontmatter)
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    image: z.string(),
    thumbnail: z.string().optional(),
    teaser: z.string(),
    enable_cta: z.boolean().optional(),
    cta_label: z.string().optional(),
    cta_url: z.string().url().optional(),
  }),
});

// Site settings (single file, frontmatter-only)
const settings = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    company_name: z.string().optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      })
      .optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    hours: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    threads: z.string().optional(),
    logo: z.string().optional(),
    seo: z
      .object({
        site_title: z.string().optional(),
        meta_description: z.string().optional(),
      })
      .optional(),
  }),
});

// Pages (Home/About/FAQ/Contact share one collection; fields are optional as they vary per file)
const pages = defineCollection({
  type: "content",
  schema: z.object({
    // Home
    hero_heading: z.string().optional(),
    hero_subheading: z.string().optional(),
    hero_image: z.string().optional(),
    // About
    title: z.string().optional(),
    // FAQ
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    // Contact
    intro: z.string().optional(),
    // (Markdown body is available separately)
  }),
});

export const collections = { tours, blog, settings, pages };
