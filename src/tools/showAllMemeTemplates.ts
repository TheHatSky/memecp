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

  const templateList = templates
    .map(
      (template, index) => `${index + 1}. ${template.name} (ID: ${template.id})`
    )
    .join("\n");

  return {
    content: [
      {
        type: "text",
        text: `Available Meme Templates:\n\n${templateList}`,
      },
    ],
  };
}
