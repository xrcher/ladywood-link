document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username") || "User";

  const title = document.querySelector(".top-header h1");
  title.textContent = `Welcome, ${username}`;

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