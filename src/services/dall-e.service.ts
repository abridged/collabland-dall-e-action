import { Configuration, OpenAIApi } from "openai";
import { debugFactory } from "@collabland/common";
const debug = debugFactory("collab-hello-action-express:services:dall-e");

/**
 * OpenAI API service used for generating images
 */
class DallEService {
  private static instance: OpenAIApi;
  public static initService() {
    try {
      DallEService.instance = new OpenAIApi(
        new Configuration({
          apiKey: process.env.OPENAI_API_KEY ?? "",
        })
      );
      debug("OpenAI API initiated");
    } catch (err) {
      debug(err);
      process.exit(1);
    }
  }
  public static async getImages(prompt: string) {
    const { data } = await this.instance.createImage({
      prompt: prompt,
      n: 10,
      size: "512x512",
      response_format: "url",
    });
    return data.data;
  }
}

export default DallEService;
