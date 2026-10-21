// Share buttons beside the posted date. "Copy link" writes the page URL to the
// clipboard, "Email" opens a draft with the page title and URL, and "Save" toggles
// its pressed state and dispatches an "article:save" event for the host site to handle.

export function initShare(root: HTMLElement) {
  const status = root.querySelector<HTMLElement>("[data-share-status]");
  const announce = (message: string) => {
    if (status) status.textContent = message;
  };

  root.querySelector<HTMLButtonElement>('[data-share="copy"]')?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      announce("The link is copied to your clipboard.");
    } catch {
      announce("Your browser blocked the clipboard, so the link wasn't copied.");
    }
  });

  root.querySelector<HTMLButtonElement>('[data-share="email"]')?.addEventListener("click", () => {
    const subject = encodeURIComponent(document.title);
    const body = encodeURIComponent(location.href);
    location.href = `mailto:?subject=${subject}&body=${body}`;
  });

  const save = root.querySelector<HTMLButtonElement>('[data-share="save"]');
  save?.addEventListener("click", () => {
    const saved = save.getAttribute("aria-pressed") !== "true";
    save.setAttribute("aria-pressed", String(saved));
    root.dispatchEvent(new CustomEvent("article:save", { bubbles: true, detail: { saved, url: location.href } }));
    announce(saved ? "The article is saved." : "The article is no longer saved.");
  });
}
