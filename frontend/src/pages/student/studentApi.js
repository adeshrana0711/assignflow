// ======================================================
// API HELPER
// ======================================================

export const api = async (path, options = {}) => {
  try {
    const response = await fetch(path, {
      method: options.method || "GET",

      credentials: "include",

      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(options.headers || {}),
      },

      body: options.body,
    });

    const contentType =
      response.headers.get("content-type") || "";

    let data = {};

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = {
        error:
          text ||
          `Server returned status ${response.status}`,
      };
    }

    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "You are not authorized to access this page."
      );
    }

    if (response.status === 404) {
      throw new Error(
        "Student API endpoint was not found."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
          data.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;

  } catch (error) {

    console.error(
      "Student API error:",
      error
    );

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please make sure your backend is running."
      );
    }

    throw error;
  }
};


// ======================================================
// DATE FORMATTER
// ======================================================

export const date = (value) => {
  if (!value) {
    return "—";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};


// ======================================================
// DATE + TIME FORMATTER
// ======================================================

export const dateTime = (value) => {
  if (!value) {
    return "—";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};


// ======================================================
// STATUS LABEL
// ======================================================

export const statusLabel = (status) => {
  switch (status) {

    case "draft":
      return "Draft";

    case "active":
      return "Open";

    case "closed":
      return "Closed";

    case "submitted":
      return "Submitted";

    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    case "forwarded":
      return "Forwarded to HOD";

    default:
      return status || "Unknown";
  }
};
