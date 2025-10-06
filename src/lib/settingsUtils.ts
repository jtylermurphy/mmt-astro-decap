// src/lib/settingsUtils.ts
import type { SiteSettings } from "../lib/siteSettings";

const phoneHref = (p?: string) => (p ? `tel:${p.replace(/[^\d+]/g, "")}` : "");
const mailHref = (e?: string) => (e ? `mailto:${e}` : "");

export function deriveSettings(s: SiteSettings) {
  return {
    ...s,
    companyName: s.company_name ?? "Mid MO Tours",
    telHref: phoneHref(s.phone),
    mailHref: mailHref(s.email),
    socials: {
      facebook: s.facebook,
      instagram: s.instagram,
      tiktok: s.tiktok,
      youtube: s.youtube,
      threads: s.threads,
      xtwitter: s.xtwitter,
    },
  };
}
