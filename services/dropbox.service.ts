import { Dropbox } from "dropbox";
import { env } from "@/config/env";

export class DropboxService {
  private static dbx = new Dropbox({
    accessToken: env.DROPBOX_ACCESS_TOKEN,
    clientId: env.DROPBOX_APP_KEY,
    clientSecret: env.DROPBOX_APP_SECRET,
    refreshToken: env.DROPBOX_REFRESH_TOKEN,
  });

  /**
   * Uploads a file to Dropbox and returns a direct download link.
   * @param fileBuffer The file content as a Buffer.
   * @param fileName The name of the file.
   * @param folderPath The folder path in Dropbox (defaults to /memo).
   * @returns The direct download URL (raw=1).
   */
  static async uploadFile(
    fileBuffer: Buffer | ArrayBuffer,
    fileName: string,
    folderPath: string = "/memo",
  ): Promise<string> {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${folderPath}/${Date.now()}_${cleanFileName}`;
    
    try {
      // 1. Upload the file
      const response = await this.dbx.filesUpload({
        path,
        contents: fileBuffer,
        mode: { ".tag": "overwrite" }
      });

      // 2. Create a shared link
      const linkResponse = await this.dbx.sharingCreateSharedLinkWithSettings({
        path: response.result.path_lower!
      });

      // 3. Convert to direct link
      return linkResponse.result.url.replace("dl=0", "raw=1");
    } catch (error: any) {
      // Handle case where shared link already exists (though unlikely with timestamp)
      if (error?.status === 409 && error?.error?.error?.shared_link_already_exists) {
        const existingLinks = await this.dbx.sharingGetSharedLinks({
          path,
        });
        if (existingLinks.result.links.length > 0) {
          return existingLinks.result.links[0].url.replace("dl=0", "raw=1");
        }
      }
      
      console.error("Dropbox Upload Error:", error);
      throw new Error(`Upload failed: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Deletes a file from Dropbox.
   * @param path The full path of the file in Dropbox.
   */
  static async deleteFile(path: string): Promise<boolean> {
    try {
      await this.dbx.filesDeleteV2({ path });
      return true;
    } catch (error) {
      console.error("Dropbox Delete Error:", error);
      return false;
    }
  }
}
