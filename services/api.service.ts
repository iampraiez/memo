import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { User } from "@/types/types";

export class ApiError<T> extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: T,
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

  public post<T, D>(url: string, data?: D, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, data, method: "POST" });
  }

  public patch<T, D>(url: string, data?: D, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, url, data, method: "PATCH" });
  }

  public put<T, D>(url: string, data?: D, config?: AxiosRequestConfig) {
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
      const res = await this.post("/auth/sign_in", { user }) as { user: User[]}
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
        status: response.status,
        data: {
          success: true,
          requiresVerification: response.data.requiresVerification,
          message: response.data.message,
          error: null,
        },
      };
    } catch (err) {
      const apiError = err as ApiError<unknown>;
      return {
        status: apiError.status || 500,
        data: {
          success: false,
          requiresVerification: false,
          error: apiError.message || "Registration failed",
          message: apiError.message,
        },
      };
    }
  }
}

export const apiService = new ApiService();
