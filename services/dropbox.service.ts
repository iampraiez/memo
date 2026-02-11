import { Dropbox } from "dropbox";
import { env } from "@/config/env";

export class DropboxService {
  private static dbx: Dropbox;
  private static accessToken: string = env.DROPBOX_ACCESS_TOKEN!!;
  private static refreshToken: string = env.DROPBOX_REFRESH_TOKEN!!;
  private static clientId: string = env.DROPBOX_APP_KEY!!;
  private static clientSecret: string = env.DROPBOX_APP_SECRET!!;
  private static tokenExpiry: number | null = null;
  private static isInitialized: boolean = false;

  /**
   * Initialize Dropbox client with token refresh if needed
   */
  private static async initializeClient(): Promise<void> {
    // Check if token is expired or will expire in next 5 minutes
    if (this.tokenExpiry && Date.now() > this.tokenExpiry - 300000) {
      console.log("Dropbox token expired or expiring soon, refreshing...");
      await this.refreshAccessToken();
    }

    // Create new client instance
    this.dbx = new Dropbox({
      accessToken: this.accessToken,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      refreshToken: this.refreshToken,
      fetch: this.fetchWithTimeout.bind(this),
    });

    this.isInitialized = true;
  }

  /**
   * Fetch with timeout and retry logic
   */
  private static async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        // If we get a 401, token might be expired - refresh and retry
        if (response.status === 401 && attempt < maxRetries - 1) {
          console.log("Received 401, refreshing token and retrying...");
          await this.refreshAccessToken();
          
          // Update authorization header with new token
          if (options.headers) {
            (options.headers as any)["Authorization"] = `Bearer ${this.accessToken}`;
          }
          
          continue;
        }

        return response;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.name === "AbortError") {
          console.warn(
            `Request timeout (attempt ${attempt + 1}/${maxRetries})`
          );
        } else if (error.status >= 400 && error.status < 500 && error.status !== 401) {
          // Don't retry client errors except 401
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${backoffTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  /**
   * Refresh Dropbox access token using refresh token
   */
  private static async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken || !this.clientId || !this.clientSecret) {
      throw new Error(
        "Dropbox refresh token, client ID, and client secret are required for token refresh"
      );
    }

    try {
      const response = await fetch("https://api.dropbox.com/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiry (usually 4 hours, use expires_in from response)
      this.tokenExpiry = Date.now() + (data.expires_in * 1000 || 4 * 60 * 60 * 1000);
      
      console.log("Dropbox token refreshed successfully, expires in:", 
        new Date(this.tokenExpiry).toLocaleString());
    } catch (error: any) {
      console.error("Failed to refresh Dropbox token:", error);
      throw new Error(`Dropbox authentication failed: ${error.message}`);
    }
  }

  /**
   * Upload large files in chunks
   */
  private static async uploadFileChunked(
    buffer: Buffer,
    path: string
  ): Promise<any> {
    const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks (Dropbox optimal size)
    const totalSize = buffer.length;
    const chunks = Math.ceil(totalSize / CHUNK_SIZE);
    
    console.log(`Starting chunked upload: ${totalSize} bytes in ${chunks} chunks`);
    
    try {
      // Start upload session with first chunk
      let session = await this.dbx.filesUploadSessionStart({
        contents: buffer.slice(0, CHUNK_SIZE)
      });
      
      let sessionId = session.result.session_id;
      let offset = CHUNK_SIZE;
      
      // Upload middle chunks
      for (let i = 1; i < chunks - 1; i++) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        await this.dbx.filesUploadSessionAppendV2({
          contents: chunk,
          cursor: {
            session_id: sessionId,
            offset
          }
        });
        offset += CHUNK_SIZE;
        
        if (i % 10 === 0) {
          console.log(`Uploaded ${i}/${chunks} chunks`);
        }
      }
      
      // Finish upload with final chunk
      const finalChunk = buffer.slice(offset);
      const response = await this.dbx.filesUploadSessionFinish({
        contents: finalChunk,
        cursor: {
          session_id: sessionId,
          offset
        },
        commit: {
          path,
          mode: { ".tag": "overwrite" },
          autorename: true
        }
      });
      
      console.log(`Chunked upload complete: ${path}`);
      return response;
    } catch (error) {
      console.error("Chunked upload failed:", error);
      throw error;
    }
  }

  /**
   * Check Dropbox connection health and quota
   */
  static async checkHealth(): Promise<{
    ok: boolean;
    message: string;
    tokenValid?: boolean;
    spaceUsed?: number;
    spaceAllocated?: number;
    spaceRemaining?: number;
    accountType?: string;
  }> {
    try {
      await this.initializeClient();
      
      // Test token by getting account info
      const account = await this.dbx.usersGetCurrentAccount();
      
      // Check available space
      const space = await this.dbx.usersGetSpaceUsage();
      
      const allocation = space.result.allocation as any;
      const allocated = allocation?.individual?.allocated || allocation?.team?.allocated || 0;
      const used = space.result.used || 0;
      const remaining = allocated - used;
      
      return {
        ok: true,
        message: "Dropbox connection successful",
        tokenValid: true,
        spaceUsed: used,
        spaceAllocated: allocated,
        spaceRemaining: remaining,
        accountType: account.result.account_type[".tag"]
      };
    } catch (error: any) {
      return {
        ok: false,
        message: `Dropbox connection failed: ${error.message}`,
        tokenValid: error.status !== 401
      };
    }
  }

  /**
   * Uploads a file to Dropbox and returns a direct download link (raw=1).
   */
  static async uploadFile(
    fileBuffer: Buffer | ArrayBuffer | Uint8Array,
    fileName: string,
    folderPath: string = "/memo"
  ): Promise<string> {
    // Validate inputs
    if (!fileBuffer || fileBuffer.byteLength === 0) {
      throw new Error("File buffer is empty");
    }

    if (!fileName) {
      throw new Error("File name is required");
    }

    // Convert to Buffer if needed
    const buffer = Buffer.isBuffer(fileBuffer)
      ? fileBuffer
      : Buffer.from(fileBuffer as any);

    // Validate file size (Dropbox free tier limit is 350MB)
    const MAX_FILE_SIZE = 350 * 1024 * 1024; // 350MB
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(
        `File too large: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB (max: 350MB)`
      );
    }

    // Check available space before uploading
    const health = await this.checkHealth();
    if (!health.ok) {
      throw new Error(`Dropbox not healthy: ${health.message}`);
    }

    if (health.spaceRemaining && buffer.length > health.spaceRemaining) {
      throw new Error(
        `Insufficient Dropbox space: Need ${(buffer.length / (1024 * 1024)).toFixed(2)}MB, ` +
        `only ${(health.spaceRemaining / (1024 * 1024)).toFixed(2)}MB available`
      );
    }

    // Clean filename and create path
    const cleanFileName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_+/g, "_"); // Replace multiple underscores with single
      
    const timestamp = Date.now();
    const path = `${folderPath}/${timestamp}_${cleanFileName}`;

    try {
      await this.initializeClient();

      let uploadResponse;
      
      // Use chunked upload for files > 10MB
      if (buffer.length > 10 * 1024 * 1024) {
        console.log(`Large file detected (${buffer.length} bytes), using chunked upload`);
        uploadResponse = await this.uploadFileChunked(buffer, path);
      } else {
        uploadResponse = await this.dbx.filesUpload({
          path,
          contents: buffer,
          mode: { ".tag": "overwrite" } as const,
          autorename: true,
          mute: false,
          strict_conflict: false
        });
      }

      const uploadedPath = uploadResponse.result.path_lower;
      if (!uploadedPath) {
        throw new Error("No path_lower returned after upload");
      }

      // Create shared link (or get existing)
      try {
        const linkResponse =
          await this.dbx.sharingCreateSharedLinkWithSettings({
            path: uploadedPath,
            settings: {
              requested_visibility: { ".tag": "public" }
            }
          });

        // Convert to direct download link
        return linkResponse.result.url.replace("dl=0", "raw=1");
      } catch (linkError: any) {
        // Handle already-exists case for shared link
        if (
          linkError?.status === 409 &&
          linkError?.error?.error?.reason?.[".tag"] === "shared_link_already_exists"
        ) {
          console.log("Shared link already exists, fetching existing link...");
          const links = await this.dbx.sharingGetSharedLinks({
            path: uploadedPath,
          });
          
          if (links.result.links.length > 0) {
            return links.result.links[0].url.replace("dl=0", "raw=1");
          }
        }
        
        throw linkError;
      }
    } catch (error: any) {
      // Enhanced error logging
      console.error("Dropbox upload detailed error:", {
        fileName,
        path,
        fileSize: `${(buffer.length / (1024 * 1024)).toFixed(2)}MB`,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name,
          stack: error.stack?.split("\n").slice(0, 3).join("\n")
        }
      });

      // Handle specific error types
      if (error?.status === 401) {
        throw new Error("Dropbox authentication failed - token expired or invalid");
      }
      if (error?.status === 403) {
        throw new Error("Dropbox permission denied - insufficient scope");
      }
      if (error?.status === 409) {
        throw new Error("File conflict - try again with different name");
      }
      if (error?.status === 413) {
        throw new Error("File too large for Dropbox");
      }
      if (error?.status === 429) {
        throw new Error("Rate limited by Dropbox. Please wait a moment and try again.");
      }
      if (error?.status === 507) {
        throw new Error("Dropbox storage quota exceeded");
      }
      if (error?.code === "ETIMEDOUT" || error?.name === "AbortError" || error?.code === "UND_ERR_ABORTED") {
        throw new Error("Connection to Dropbox timed out. Please check your internet connection and try again.");
      }
      if (error?.code === "ENOTFOUND" || error?.code === "ECONNREFUSED") {
        throw new Error("Cannot connect to Dropbox. Please check your network connection.");
      }

      // Re-throw with user-friendly message
      throw new Error(
        `Dropbox upload failed: ${error.message || "unknown error"}`
      );
    }
  }

  /**
   * Deletes a file from Dropbox by path.
   * Returns true if deleted, false if not found or other error.
   */
  static async deleteFile(path: string): Promise<boolean> {
    if (!path) {
      throw new Error("File path is required");
    }

    try {
      await this.initializeClient();
      await this.dbx.filesDeleteV2({ path });
      console.log(`Successfully deleted file: ${path}`);
      return true;
    } catch (error: any) {
      // File not found is not an error condition for delete
      if (
        error?.status === 409 ||
        error?.error?.error?.path?.[".tag"] === "not_found"
      ) {
        console.log(`File already does not exist: ${path}`);
        return false;
      }

      console.error("Dropbox delete failed:", {
        path,
        message: error.message,
        code: error.code,
        status: error.status,
      });

      return false;
    }
  }

  /**
   * Get file metadata from Dropbox
   */
  static async getFileMetadata(path: string): Promise<any> {
    try {
      await this.initializeClient();
      const response = await this.dbx.filesGetMetadata({ path });
      return response.result;
    } catch (error) {
      console.error("Failed to get file metadata:", error);
      throw error;
    }
  }

  /**
   * List files in a folder
   */
  static async listFiles(folderPath: string = "/memo"): Promise<any[]> {
    try {
      await this.initializeClient();
      const response = await this.dbx.filesListFolder({ path: folderPath });
      return response.result.entries;
    } catch (error) {
      console.error("Failed to list files:", error);
      return [];
    }
  }
}