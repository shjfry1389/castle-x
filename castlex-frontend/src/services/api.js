import axios from "axios";

const api = axios.create({
  baseURL: "https://castle-x-api.sharminjafari1389.workers.dev",
});

export default api;