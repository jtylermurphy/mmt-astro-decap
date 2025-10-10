// src/lib/data/chrome.ts
import { getSettings, toFooterProps, toHeaderNavProps } from "./site";
import type { FooterProps, HeaderNavProps } from "./site";

let _header: HeaderNavProps | null = null;
let _footer: FooterProps | null = null;

/** Load site-chrome props (memoized per build/request). */
export async function loadChrome() {
  if (!_header || !_footer) {
    const settings = await getSettings();
    _header = toHeaderNavProps(settings);
    _footer = toFooterProps(settings);
  }
  return { header: _header, footer: _footer };
}

/** For tests or preview modes you can clear the memoized chrome data. */
export function resetChromeCache() {
  _header = null;
  _footer = null;
}
