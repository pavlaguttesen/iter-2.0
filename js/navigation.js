document.addEventListener("DOMContentLoaded", () => {
  // Hent navigation
  fetch("../komponenter/navigation.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("navigation").innerHTML = data;
      setupBurgerMenu();
      scrollNavigation();
    });

    

    function scrollNavigation() {
        const header = document.querySelector("header");
        const heroForside = document.querySelector(".hero");

        if (!header) return;

        if (!heroForside) {
            header.classList.add("nav-underside");
            return;
        }

        window.addEventListener("scroll", () => {
            if (window.scrollY > 600) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    }
});

// === Burgermenu funktion ===
function setupBurgerMenu() {
  const burgerMenu = document.querySelector(".burger_menu");
  const offScreenMenu = document.querySelector(".offscreen_menu");

  if (burgerMenu && offScreenMenu) {
    burgerMenu.addEventListener("click", () => {
      burgerMenu.classList.toggle("active");
      offScreenMenu.classList.toggle("active");
    });

    // Luk menuen når et link klikkes
    offScreenMenu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        burgerMenu.classList.remove("active");
        offScreenMenu.classList.remove("active");
      })
    );
  }
}
