import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&

      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        await api.post("/auth/refresh");

        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        console.log("Session expired");

         if (
    typeof window !== "undefined" &&
    window.location.pathname !== "/login"
  ) {
    window.location.href = "/login";
  }


        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;