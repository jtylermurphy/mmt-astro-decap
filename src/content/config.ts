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
    short_description: z.string().optional(),
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

    // socials (existing flat fields still supported)
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    threads: z.string().optional(),
    xtwitter: z.string().optional(),

    logo: z.string().optional(),
    logoAlt: z.string().optional(),
    seo: z
      .object({
        site_title: z.string().optional(),
        meta_description: z.string().optional(),
      })
      .optional(),

    // 🚩 ADDED: CTA fields for header/book button
    book_url: z.string().url().optional(),
    book_label: z.string().optional(),

    // 🚩 ADDED: optional grouped socials (future-proof; keeps back-compat)
    socials: z
      .object({
        facebook: z.string().url().optional(),
        instagram: z.string().url().optional(),
        tiktok: z.string().url().optional(),
        youtube: z.string().url().optional(),
        threads: z.string().url().optional(),
        xtwitter: z.string().url().optional(),
      })
      .partial()
      .optional(),
  }),
});

// Pages (Home/About/FAQ/Contact share one collection)
const pages = defineCollection({
  type: "content",
  schema: z.object({
    hero_heading: z.string().optional(),
    hero_subheading: z.string().optional(),
    hero_image: z.string().optional(),
    title: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    intro: z.string().optional(),
  }),
});

const testimonials = defineCollection({
  type: "content",
  schema: z.object({
    quote: z.string(),
    authorName: z.string(),
    authorMeta: z.string().optional(),
    avatar: z.string().optional(),
    rating: z.number().int().min(0).max(5).default(5),
    order: z.number().int().optional(),
    featured: z.boolean().default(true),
    tour: z
      .enum(["highlights", "custom", "packages"])
      .describe("Which tour/package this testimonial references")
      .optional(),
  }),
});

export const collections = { tours, blog, settings, pages, testimonials };
