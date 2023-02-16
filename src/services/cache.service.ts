import NodeCache from "node-cache";
import { debugFactory } from "@collabland/common";
const debug = debugFactory("collab-hello-action-express:services:cache");
import { ImagesResponseDataInner } from "openai";

export interface ShuffleResponse {
  url: string;
  counter: number;
}

class CacheService {
  private static cache: NodeCache;
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
  public static async getImage(msgId: string): Promise<ShuffleResponse> {
    const cache = CacheService.getService();
    const url = (await cache.get(`${msgId}:urls`)) as string;
    const counter = +((await cache.get(`${msgId}:counter`)) as string);
    return {
      url: url,
      counter: counter,
    };
  }
}

export default CacheService;
