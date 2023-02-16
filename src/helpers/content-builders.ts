import {
  APIActionRowComponent,
  APIButtonComponent,
  APIInteractionResponse,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionResponseType,
  RESTPostAPIWebhookWithTokenJSONBody,
} from "discord.js";
import { ShuffleResponse } from "../services/cache.service";
import { ButtonBuilder } from "discord.js";

export const createImageResultResponse = (
  data: ShuffleResponse
): RESTPostAPIWebhookWithTokenJSONBody => {
  const embed = new EmbedBuilder()
    .setColor("#FFD749")
    .setAuthor({ name: "DALL·E 2 by Collab.Land" })
    .setDescription(
      `Your DALL·E 2 search results **(${data.counter + 1}/10)** :`
    )
    .setImage(data.url)
    .setFooter({
      text: `Powered by OpenAI`,
      iconURL: "https://github.com/openai.png",
    });
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("dall-e-action:cancel-button")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("dall-e-action:shuffle-button")
        .setLabel("Shuffle")
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("dall-e-action:send-button")
        .setLabel("Send")
        .setStyle(ButtonStyle.Success)
    );
  return {
    components: [row.toJSON() as APIActionRowComponent<APIButtonComponent>],
    embeds: [embed.toJSON()],
  };
};