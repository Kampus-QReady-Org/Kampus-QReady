
document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.getElementById("menuButton");
  const dashboardSidebar = document.querySelector(".dashboard-sidebar");

  if (menuButton && dashboardSidebar) {
    menuButton.addEventListener("click", function () {
      dashboardSidebar.classList.toggle("mobile-open");

      const isOpen = dashboardSidebar.classList.contains("mobile-open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });
  }
});
