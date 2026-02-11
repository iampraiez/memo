import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${env.NEXT_PUBLIC_URL}/api`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status || 500;
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "An unexpected error occurred";

        // Log important codes for debugging
        if (status === 401) {
          console.warn("[API] Unauthorized - 401");
        } else if (status === 403) {
          console.error("[API] Forbidden - 403");
        } else if (status >= 500) {
          console.error(`[API] Server Error - ${status}: ${message}`);
        }

        return Promise.reject(
          new ApiError(message, status, error.response?.data),
        );
      },
    );
  }

  /**
   * Universal request handler
   */
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }

  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "GET" });
  }

  public post<T>(url: string, data?: T, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, data, method: "POST" });
  }

  public patch<T>(url: string, data?: T, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, data, method: "PATCH" });
  }

  public put<T>(url: string, data?: T, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, data, method: "PUT" });
  }

  public delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, method: "DELETE" });
  }

  public async uploadFiles(files: File[] | File): Promise<string[]> {
    const formData = new FormData();
    const fileList = Array.isArray(files) ? files : [files];
    fileList.forEach((file) => formData.append("file", file));

    const response = await this.client.post<{ urls: string[] }>(
      "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.urls;
  }

  public async userExists(user: string) {
    try {
      const res = await this.post("/auth/sign_in", { user });
      return res.user?.[0];
    } catch (err) {
      console.error("[API] userExists error:", err);
      return null;
    }
  }

  public async registerUser(userData: {
    email: string;
    password: string;
    name?: string;
  }) {
    try {
      const response = await this.client.post("/auth/register", {
        ...userData,
        name: userData.name || userData.email.split("@")[0],
      });

      return {
        data: {
          success: response.status === 201,
          requiresVerification: response.data.requiresVerification,
          error: null,
        },
      };
    } catch (err) {
      const apiError = err as ApiError;
      return {
        data: {
          success: false,
          error: apiError.message || "Registration failed",
        },
      };
    }
  }
}

export const apiService = new ApiService();
