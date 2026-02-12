document.addEventListener("DOMContentLoaded", () => {
  fetch("/static/footer.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);

      const y = document.getElementById("footer-year");
      if (y) y.textContent = new Date().getFullYear();
    })
    .catch(err => console.error("footer load failed:", err));
});
