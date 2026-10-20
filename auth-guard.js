(() => {
  const token = localStorage.getItem("token");

  // Hide the page while authentication is checked.
  document.documentElement.style.visibility = "hidden";

  // Redirect users who are not logged in.
  if (!token) {
    window.location.replace("index.html");
    return;
  }

  // Resolve API Base URL dynamically (Local vs Production)
  const BASE_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "https://kampus-qready-api.onrender.com";

  // Validate the token with the backend.
  fetch(`${BASE_URL}/api/auth/profile`, {
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
      const user = data.user || (data.data && data.data.user);

      if (!user) {
        throw new Error("No authenticated user returned.");
      }

      // Authentication passed. Reveal the dashboard UI.
      document.documentElement.style.visibility = "visible";
    })
    .catch((error) => {
      console.error("Authentication check failed:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.replace("index.html");
    });
})();