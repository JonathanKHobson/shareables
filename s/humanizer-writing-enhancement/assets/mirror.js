document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const prompt = button.closest(".prompt-card")?.querySelector("pre")?.textContent;
    if (!prompt) return;

    await navigator.clipboard.writeText(prompt);
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = "Copy prompt";
    }, 1600);
  });
});
