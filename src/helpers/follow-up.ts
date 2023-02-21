import { getFetch, handleFetchResponse } from "@collabland/common";
import {
  APIMessage,
  DiscordActionRequest,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
  RESTPostAPIWebhookWithTokenJSONBody,
  InteractionResponseType,
} from "@collabland/discord";

const fetch = getFetch();

export class FollowUp {
  /**
   *Follow-up a message sent on Discord
   * @param request The Discord request object
   * @param message The message to be sent as the followed-up response
   * @returns The followed-up message as API response
   */
  async followupMessage(
    request: DiscordActionRequest,
    message: RESTPostAPIWebhookWithTokenJSONBody
  ) {
    const callback = request.actionContext?.callbackUrl;
    if (callback) {
      const res = await fetch(callback, {
        method: "post",
        body: JSON.stringify({
          ...message,
          type: InteractionResponseType.UpdateMessage,
        }),
      });
      return await handleFetchResponse<APIMessage>(res);
    }
  }
  /**
   * Edit a message on Discord by its ID
   * @param request The Discord request object
   * @param message The message to be sent as the edited response
   * @param messageId The message to be edited
   * @returns The edited message as API response
   */
  async editMessage(
    request: DiscordActionRequest,
    message: RESTPatchAPIWebhookWithTokenMessageJSONBody,
    messageId = "@original"
  ) {
    const callback = request.actionContext?.callbackUrl;
    if (callback) {
      const res = await fetch(
        callback + `/messages/${encodeURIComponent(messageId)}`,
        {
          method: "patch",
          body: JSON.stringify(message),
        }
      );
      return await handleFetchResponse<APIMessage>(res);
    }
  }
  /**
   *Deletes a message on Discord
   * @param request The API request sent by Discord
   * @param messageId The message ID to be deleted
   */
  async deleteMessage(request: DiscordActionRequest, messageId = "@original") {
    const callback = request.actionContext?.callbackUrl;
    if (callback) {
      const res = await fetch(
        callback + `/messages/${encodeURIComponent(messageId)}`,
        {
          method: "delete",
        }
      );
      await handleFetchResponse(res);
    }
  }
}
