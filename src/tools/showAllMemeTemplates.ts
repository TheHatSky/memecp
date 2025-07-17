import { getMemeTemplates } from "../getMemeTemplates.js";

export const showAllMemeTemplatesToolDefinition = {
  name: "show_all_meme_templates",
  description: "Show all available meme templates",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "The page number to show",
        default: 1,
      },
      limit: {
        type: "number",
        description: "The number of templates to show per page",
        default: 50,
      },
    },
  },
};

export async function showAllMemeTemplates(args: {
  page: number;
  limit: number;
}) {
  const { page, limit } = args;
  const templates = await getMemeTemplates(page, limit);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(templates),
      },
    ],
  };
}
