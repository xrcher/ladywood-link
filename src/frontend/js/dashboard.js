document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.querySelector(".search-bar");

  searchBar.addEventListener("input", () => {
    const query = searchBar.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();

      if (text.includes(query)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
});