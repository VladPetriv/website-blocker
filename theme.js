const themeToggle = document.getElementById("themeToggle");

// Detect system/browser theme on load
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
} else {
  document.body.classList.remove("dark");
  themeToggle.textContent = "🌙";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "☀️"
    : "🌙";
});
