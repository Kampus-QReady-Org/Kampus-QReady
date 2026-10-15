(() => {
  const token = localStorage.getItem("token");

  // Hide the page while authentication is checked.
  document.documentElement.style.visibility = "hidden";

  // Redirect users who are not logged in.
  if (!token) {
    window.location.replace("index.html");
    return;
  }

  // Validate the token with the backend.
  fetch("https://kampus-qready-api.onrender.com/api/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Session is invalid or expired.");
      }

      return response.json();
    })
    .then((data) => {
      const user = data.user;

      if (!user || (user.userId == null && user.id == null)) {
        throw new Error("No authenticated user returned.");
      }

      // Authentication passed.
      document.documentElement.style.visibility = "visible";
    })
    .catch((error) => {
      console.error("Authentication check failed:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.replace("index.html");
    });
})();