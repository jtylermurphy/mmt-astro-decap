import { getEntry, type CollectionEntry } from "astro:content";

export type SiteSettings = CollectionEntry<"settings">["data"];

export async function getSiteSettings(): Promise<SiteSettings> {
  const entry = await getEntry("settings", "global");
  return (entry?.data ?? {}) as SiteSettings;
}
