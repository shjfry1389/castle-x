import axios from "axios";

const api = axios.create({
  baseURL: "https://castle-x-api.sharminjafari1389.workers.dev",
});

let sessionAlertShown = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "";

    const lowerMessage = String(message).toLowerCase();
    const hasToken = !!localStorage.getItem("token");

    const isTokenError =
      status === 401 ||
      lowerMessage.includes("jwt") ||
      lowerMessage.includes("token") ||
      message.includes("توکن") ||
      message.includes("نشست");

    if (hasToken && isTokenError && !sessionAlertShown) {
      sessionAlertShown = true;

      alert(
        "نشست شما منقضی شده است. لطفاً یک بار خارج شوید و دوباره وارد حساب کاربری شوید."
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("premium_plan");
      localStorage.removeItem("premium_until");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;