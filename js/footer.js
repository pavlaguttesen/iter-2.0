document.addEventListener("DOMContentLoaded", () => {
  // Hent footer
  fetch("../komponenter/footer.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    });
});
