import NodeCache from "node-cache";
import { debugFactory } from "@collabland/common";
const debug = debugFactory("collab-hello-action-express:services:cache");
import { ImagesResponseDataInner } from "openai";

export interface ShuffleResponse {
  url: string;
  counter: number;
}
/**
 * NodeCache service for caching images and serving them to the user based on Discord message ID
 */
class CacheService {
  private static cache: NodeCache;
  /**
   * Initialize the caching service
   */
  public static initService() {
    try {
      CacheService.cache = new NodeCache();
      debug("Cache service initiated");
    } catch (err) {
      debug(err);
      process.exit(1);
    }
  }
  public static getService() {
    if (!this.cache) {
      this.initService();
    }
    return this.cache;
  }
  /**
   * Caches the images against the prompt, and then starts the counter
   * @param msgId Discord message ID
   * @param images The image array received from DALL·E 2
   * @returns The first image in line, with the counter set to 0
   */
  public static async cacheImages(
    msgId: string,
    images: ImagesResponseDataInner[]
  ): Promise<ShuffleResponse> {
    const parsedUrls: string[] = images.map((image) => {
      return image.url ?? "";
    });
    const cache = CacheService.getService();
    await cache.set(`${msgId}:urls`, parsedUrls);
    await cache.set(`${msgId}:counter`, 0);
    return {
      url: parsedUrls[0],
      counter: 0,
    };
  }
  /**
   * Gets the next image for the Message ID, and then update the counter
   * @param msgId Discord message ID
   * @returns The next image to be shown to the user
   */
  public static async getImage(msgId: string): Promise<ShuffleResponse> {
    const cache = CacheService.getService();
    const urls = (await cache.get(`${msgId}:urls`)) as string;
    const counter = +((await cache.get(`${msgId}:counter`)) as string);
    const parsedCounter = (counter + 1) % 10;
    const url = urls[parsedCounter];
    await cache.set(`${msgId}:counter`, parsedCounter);
    return {
      url: url,
      counter: parsedCounter,
    };
  }
}

export default CacheService;
