// src/lib/data/site.ts
import { getCollection } from "astro:content";
import { icons } from "@/lib/icons";
import type { SiteSettings } from "@/lib/siteSettings";

let _settings: SiteSettings | null = null;

/** Read the single settings entry (supports multiple filenames; picks first if many). */
export async function getSettings(): Promise<SiteSettings> {
  if (_settings) return _settings;
  const rows = await getCollection("settings");
  const entry = rows.find((r) => /(?:global|site|settings)\.(md|mdx|json|yaml|yml)$/i.test(r.id)) ?? rows[0];

  _settings = (entry?.data ?? {}) as SiteSettings;
  return _settings;
}

export type HeaderSocial = { label: string; url: string; iconKey: keyof typeof icons };
export type HeaderLink = { label: string; href: string };
export type SocialEntry = { label: string; url: string; iconKey: keyof typeof icons };
export type HeaderNavProps = {
  siteName: string;
  logoSrc?: string;
  logoAlt?: string;
  sticky: boolean;
  links: HeaderLink[];
  cta?: { label: string; href: string };
  contact: { phone?: string; telHref?: string; email?: string; mailHref?: string };
  socials: HeaderSocial[];
};

export type FooterProps = {
  siteName: string;
  logoSrc?: string;
  address?: SiteSettings["address"];
  contact: { phone?: string; telHref?: string; email?: string; mailHref?: string; hours?: string };
  socials: HeaderSocial[];
  nav: {
    tours: HeaderLink[];
    company: HeaderLink[];
  };
  legalLinks: HeaderLink[];
  year: number;
};

function collectSocials(settings: SiteSettings): HeaderSocial[] {
  const raw = {
    ...(settings.socials ?? {}),
    facebook: settings.socials?.facebook ?? settings.facebook,
    instagram: settings.socials?.instagram ?? settings.instagram,
    tiktok: settings.socials?.tiktok ?? settings.tiktok,
    youtube: settings.socials?.youtube ?? settings.youtube,
    threads: settings.socials?.threads ?? settings.threads,
    xtwitter: settings.socials?.xtwitter ?? settings.xtwitter,
  };

  const map: Array<{ label: string; key: keyof typeof raw; iconKey: keyof typeof icons }> = [
    { label: "Facebook", key: "facebook", iconKey: "facebook" },
    { label: "Instagram", key: "instagram", iconKey: "instagram" },
    { label: "TikTok", key: "tiktok", iconKey: "tiktok" },
    { label: "YouTube", key: "youtube", iconKey: "youtube" },
    { label: "Threads", key: "threads", iconKey: "threads" },
    { label: "X (Twitter)", key: "xtwitter", iconKey: "xtwitter" },
  ];

  return map
    .map(({ label, key, iconKey }) => {
      const url = raw[key];
      return typeof url === "string" && url.trim().length > 0 ? { label, url: url.trim(), iconKey } : null;
    })
    .filter(Boolean) as HeaderSocial[];
}

/** Normalize settings → HeaderNavProps (keeps back-compat with flat social fields). */
export function toHeaderNavProps(settings: SiteSettings, overrides?: Partial<HeaderNavProps>): HeaderNavProps {
  const siteName = settings.company_name ?? "Mid MO Tours";
  const logoSrc = settings.logo ?? undefined;
  const logoAlt = settings.logoAlt ?? siteName;

  const phone = settings.phone || "";
  const email = settings.email || "";
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined;
  const mailHref = email ? `mailto:${email}` : undefined;

  const links: HeaderLink[] = overrides?.links ?? [
    { label: "Home", href: "/" },
    { label: "Tours", href: "/tours/" },
    { label: "About", href: "/about/" },
    { label: "FAQ", href: "/faq/" },
    { label: "Contact", href: "/contact/" },
  ];

  const socials = collectSocials(settings);

  const cta = settings.book_url ? { label: settings.book_label ?? "See Tours", href: settings.book_url } : undefined;

  const base: HeaderNavProps = {
    siteName,
    logoSrc,
    logoAlt,
    sticky: true,
    links,
    cta,
    contact: { phone, telHref, email, mailHref },
    socials,
  };

  return { ...base, ...overrides, links: overrides?.links ?? base.links };
}

export function toFooterProps(settings: SiteSettings, overrides?: Partial<FooterProps>): FooterProps {
  const siteName = settings.company_name ?? "Mid MO Tours";
  const logoSrc = settings.logo ?? undefined;
  const phone = settings.phone ?? "";
  const email = settings.email ?? "";
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined;
  const mailHref = email ? `mailto:${email}` : undefined;

  const base: FooterProps = {
    siteName,
    logoSrc,
    address: settings.address,
    contact: {
      phone,
      email,
      hours: settings.hours ?? "",
      telHref,
      mailHref,
    },
    socials: collectSocials(settings),
    nav: {
      tours: [
        { label: "Highlights Tour", href: "/tours/highlightstour" },
        { label: "Custom Tours", href: "/tours/custom" },
        { label: "Packages", href: "/packages" },
      ],
      company: [
        { label: "About", href: "/about" },
        { label: "FAQ", href: "/faq" },
        { label: "Contact", href: "/contact" },
      ],
    },
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
      { label: "Liability Waiver", href: "/liability-waiver" },
    ],
    year: new Date().getFullYear(),
  };

  return {
    ...base,
    ...overrides,
    contact: { ...base.contact, ...overrides?.contact },
    nav: {
      tours: overrides?.nav?.tours ?? base.nav.tours,
      company: overrides?.nav?.company ?? base.nav.company,
    },
    legalLinks: overrides?.legalLinks ?? base.legalLinks,
    socials: overrides?.socials ?? base.socials,
  };
}
