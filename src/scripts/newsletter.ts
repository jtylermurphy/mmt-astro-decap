const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_TIMEOUT = 10000;

function sanitizeName(value: FormDataEntryValue | null): string {
  return String(value ?? "")
    .trim()
    .slice(0, 80)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ");
}

function setBusy(form: HTMLFormElement, busy: boolean) {
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = busy;
    submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
  }
  form.setAttribute("data-busy", busy ? "true" : "false");
}

function setStatus(statusEl: HTMLElement | null, message: string, isError: boolean) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.setAttribute("data-error", isError ? "true" : "false");
  if (isError) {
    statusEl.tabIndex = -1;
    statusEl.focus();
  }
}

async function requestWithTimeout(url: string, params: URLSearchParams, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: params.toString(),
      signal: controller.signal,
    });

    try {
      return await response.json();
    } catch (_) {
      return { ok: response.ok, message: response.ok ? "Thanks for subscribing!" : "" };
    }
  } finally {
    clearTimeout(timer);
  }
}

function enhanceForm(form: HTMLFormElement) {
  if (form.dataset.newsletterBound === "true") return;
  form.dataset.newsletterBound = "true";

  const statusEl = document.getElementById("newsletter-status");
  if (statusEl && !statusEl.getAttribute("role")) {
    statusEl.setAttribute("role", "status");
    statusEl.setAttribute("aria-live", "polite");
  }

  const tsEl = form.querySelector<HTMLInputElement>('input[name="ts"]');
  if (tsEl) tsEl.value = String(Date.now());

  const action = form.getAttribute("action") || "/.netlify/functions/newsletter";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if ("onLine" in navigator && navigator.onLine === false) {
      setStatus(statusEl, "You appear to be offline. Please try again once you’re connected.", true);
      return;
    }

    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const name = sanitizeName(formData.get("name"));

    if (!EMAIL_RE.test(email) || email.length > 254) {
      setStatus(statusEl, "Please enter a valid email.", true);
      return;
    }

    setBusy(form, true);
    setStatus(statusEl, "Submitting…", false);

    formData.set("name", name);

    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      params.append(key, typeof value === "string" ? value : "");
    });

    requestWithTimeout(action, params)
      .then((data: any) => {
        if (data?.ok) {
          setStatus(statusEl, data.message || "Thanks for subscribing!", false);
          form.reset();
          if (tsEl) tsEl.value = String(Date.now());
        } else {
          setStatus(data?.error || "Something went wrong. Please try again.", true);
        }
      })
      .catch((err: Error) => {
        const aborted = err?.name === "AbortError" || String(err?.message ?? "").toLowerCase().includes("abort");
        setStatus(statusEl, aborted ? "Request timed out. Please try again." : "Network error. Please try again.", true);
      })
      .finally(() => {
        setBusy(form, false);
      });
  });
}

export default function initNewsletterForms() {
  const forms = Array.from(document.querySelectorAll<HTMLFormElement>("form[data-newsletter-form]"));
  forms.forEach(enhanceForm);
}
