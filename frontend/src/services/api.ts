import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("plotai_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export interface ManualPlotInput {
  length_ft: number;
  width_ft: number;
  shape: "rectangular" | "l_shape" | "irregular";
  road_facing_side: "north" | "south" | "east" | "west";
}

export const analyzeManualPlot = (payload: ManualPlotInput) =>
  api.post("/land-analysis/manual", payload).then((r) => r.data);

export const analyzePlotImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api
    .post("/land-analysis/from-image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const suggestBuildType = (payload: object) =>
  api.post("/build-suggestion/", payload).then((r) => r.data);

export const estimateMaterials = (payload: object) =>
  api.post("/material-estimation/", payload).then((r) => r.data);

export const generate3DModel = (payload: object) =>
  api.post("/model-3d/generate", payload).then((r) => r.data);
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const registerUser = (payload: {
  full_name: string;
  email: string;
  password: string;
}) => api.post<AuthResponse>("/auth/signup", payload).then((r) => r.data);

export const loginUser = (payload: {
  email: string;
  password: string;
}) => api.post<AuthResponse>("/auth/login", payload).then((r) => r.data);

export default api;
