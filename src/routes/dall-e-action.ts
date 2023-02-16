import express from "express";
import {
  FollowUp,
  SignatureVerifier,
  createImageResultResponse,
} from "../helpers";
import { debugFactory, sleep } from "@collabland/common";
import {
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponse,
  APIMessageComponentBaseInteractionData,
  APIMessageComponentButtonInteraction,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  DiscordActionMetadata,
  DiscordActionRequest,
  DiscordActionResponse,
  getCommandOptionValue,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
  RESTPostAPIWebhookWithTokenJSONBody,
} from "@collabland/discord";
import { MiniAppManifest } from "@collabland/models";
import { CacheService, DallEService } from "../services";
import { EmbedBuilder } from "discord.js";
const debug = debugFactory("collab-hello-action-express:action:dall-e");

const router = express.Router();

async function handle(
  interaction: DiscordActionRequest
): Promise<DiscordActionResponse> {
  debug(JSON.stringify(interaction));
  switch (interaction.type) {
    case InteractionType.ApplicationCommand: {
      /**
       * Build a defer response message private to the user
       */
      const response: APIInteractionResponse = {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: {
          flags: MessageFlags.Ephemeral,
        },
      };
      /**
       * Allow advanced followup messages
       */
      followup(
        interaction as unknown as DiscordActionRequest<APIChatInputApplicationCommandInteraction>
      ).catch((err) => {
        console.error(
          "Fail to send followup message to interaction %s: %O",
          interaction.id,
          err
        );
      });
      // Return the 1st response to Discord
      return response;
    }
    case InteractionType.MessageComponent: {
      return handleButtonInteraction(
        interaction as DiscordActionRequest<APIMessageComponentButtonInteraction>
      );
    }
    default: {
      const response: APIInteractionResponse = {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "Unsupported Interaction Type.",
          flags: MessageFlags.Ephemeral,
        },
      };
      return response;
    }
  }
}

async function handleButtonInteraction(
  interaction: DiscordActionRequest<APIMessageComponentButtonInteraction>
): Promise<DiscordActionResponse> {
  debug("MessageComponent interaction received");
  const originalMsgId = interaction?.message?.id;
  debug("originalMsgId:", originalMsgId);
  const buttonId = interaction?.data?.custom_id;
  debug("buttonId:", buttonId);
  switch (buttonId) {
    case "dall-e-action:send-button": {
      const userId = interaction.member?.user.id ?? "";
      const imageUrl = interaction.message.embeds[0]?.image?.url ?? "";
      const response: APIInteractionResponse = {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `<@${userId}>`,
          embeds: [
            new EmbedBuilder()
              .setColor("#FFD749")
              .setImage(imageUrl)
              .setAuthor({ name: "DALL·E 2 by Collab.Land" })
              .setDescription(`Your DALL·E 2 search result:`)
              .setFooter({
                text: `Powered by OpenAI`,
                iconURL: "https://github.com/openai.png",
              })
              .toJSON(),
          ],
        },
      };
      return response;
    }
    case "dall-e-action:shuffle-button": {
      const response: APIInteractionResponse = {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `OK. Button: ${buttonId} Message ID: ${originalMsgId}`,
          flags: MessageFlags.Ephemeral,
        },
      };
      return response;
    }
    case "dall-e-action:cancel-button": {
      const followup = new FollowUp();
      followup.deleteMessage(interaction, originalMsgId);
      const response: APIInteractionResponse = {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `Operation Cancelled.`,
          flags: MessageFlags.Ephemeral,
        },
      };
      return response;
    }
    default: {
      const response: APIInteractionResponse = {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "Unsupported Interaction Type.",
          flags: MessageFlags.Ephemeral,
        },
      };
      return response;
    }
  }
}

async function followup(
  request: DiscordActionRequest<APIChatInputApplicationCommandInteraction>
) {
  /**
   * Get the value of `prompt` argument for `/dall-e`
   */
  const prompt = getCommandOptionValue(request, "prompt");
  const callback = request.actionContext?.callbackUrl;
  if (callback != null) {
    const interactionId = request.id;
    const images = await DallEService.getImages(prompt ?? "");
    const responseMsg = createImageResultResponse({
      counter: 0,
      url: images[0]?.url ?? "",
    });
    const follow = new FollowUp();
    const msgId = (await follow.followupMessage(request, responseMsg))?.id;
    const displayImage = await CacheService.cacheImages(msgId ?? "", images);
    debug("Follow-up MessageID:", msgId);
    debug(JSON.stringify(displayImage));
  }
}

router.get("/metadata", function (req, res) {
  const manifest = new MiniAppManifest({
    appId: "dall-e-action",
    developer: "collab.land",
    name: "DallEAction",
    platforms: ["discord"],
    shortName: "dall-e-action",
    version: { name: "0.0.1" },
    website: "https://collab.land",
    description: "An example Collab.Land DALL·E 2 action",
  });
  const metadata: DiscordActionMetadata = {
    /**
     * Miniapp manifest
     */
    manifest,
    /**
     * Supported Discord interactions. They allow Collab.Land to route Discord
     * interactions based on the type and name/custom-id.
     */
    supportedInteractions: [
      {
        // Handle `/hello-action` slash command
        type: InteractionType.ApplicationCommand,
        names: ["dall-e-action"],
      },
      {
        type: InteractionType.MessageComponent,
        ids: [
          "dall-e-action:send-button",
          "dall-e-action:shuffle-button",
          "dall-e-action:cancel-button",
        ],
      },
    ],
    /**
     * Supported Discord application commands. They will be registered to a
     * Discord guild upon installation.
     */
    applicationCommands: [
      // `/hello-action <your-name>` slash command
      {
        metadata: {
          name: "DallEAction",
          shortName: "dall-e-action",
        },
        name: "dall-e-action",
        type: ApplicationCommandType.ChatInput,
        description: "/dall-e-action",
        options: [
          {
            name: "prompt",
            description: "Your search prompt for DALL·E 2",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  };
  res.send(metadata);
});

router.post("/interactions", async function (req, res) {
  const verifier = new SignatureVerifier();
  verifier.verify(req, res);
  const result = await handle(req.body);
  res.send(result);
});

export default router;
