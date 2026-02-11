import { Dropbox } from "dropbox";
import { env } from "@/config/env";

export class DropboxService {
  private static dbx = new Dropbox({
    accessToken: env.DROPBOX_ACCESS_TOKEN,
    clientId: env.DROPBOX_APP_KEY,
    clientSecret: env.DROPBOX_APP_SECRET,
    refreshToken: env.DROPBOX_REFRESH_TOKEN,
    fetch: (url: string, options: RequestInit = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  });

  /**
   * Uploads a file to Dropbox and returns a direct download link (raw=1).
   */
  static async uploadFile(
    fileBuffer: Buffer | ArrayBuffer | Uint8Array,
    fileName: string,
    folderPath: string = "/memo",
  ): Promise<string> {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${folderPath}/${Date.now()}_${cleanFileName}`;

    try {
      // 1. Upload
      const uploadResponse = await DropboxService.dbx.filesUpload({
        path,
        contents: fileBuffer,
        mode: { ".tag": "overwrite" } as const,
      });

      const uploadedPath = uploadResponse.result.path_lower;
      if (!uploadedPath) throw new Error("No path_lower returned after upload");

      // 2. Create shared link (or get existing)
      const linkResponse =
        await DropboxService.dbx.sharingCreateSharedLinkWithSettings({
          path: uploadedPath,
        });

      return linkResponse.result.url.replace("dl=0", "raw=1");
    } catch (error: any) {
      // Handle already-exists case for shared link
      if (
        error?.status === 409 &&
        error?.error?.error?.reason?.[".tag"] === "shared_link_already_exists"
      ) {
        try {
          const links = await DropboxService.dbx.sharingGetSharedLinks({
            path,
          });
          if (links.result.links.length > 0) {
            return links.result.links[0].url.replace("dl=0", "raw=1");
          }
        } catch (linkErr) {
          console.warn("Failed to get existing shared link:", linkErr);
        }
      }

      console.error("Dropbox upload failed:", {
        path,
        message: error.message,
        code: error.code,
        status: error.status,
        cause: error.cause,
        stack: error.stack?.slice(0, 400),
      });

      throw new Error(
        `Dropbox upload failed: ${error.message || "unknown error"}`,
      );
    }
  }

  /**
   * Deletes a file from Dropbox by path.
   * Returns true if deleted, false if not found or other error.
   */
  static async deleteFile(path: string): Promise<boolean> {
    try {
      await DropboxService.dbx.filesDeleteV2({ path });
      return true;
    } catch (error: any) {
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
}