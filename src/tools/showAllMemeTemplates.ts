import { getMemeTemplates } from "../getMemeTemplates.js";

export const showAllMemeTemplatesToolDefinition = {
  name: "show_all_meme_templates",
  description: "Show all available meme templates",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

export async function showAllMemeTemplates() {
  const templates = await getMemeTemplates();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(templates),
      },
    ],
  };
}
