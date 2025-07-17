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
    .map((template, index) => {
      let line = `${index + 1}. **${template.name}** (ID: ${template.id})`;
      if (template.keywords && template.keywords.length > 0) {
        line += ` - Keywords: ${template.keywords.slice(0, 3).join(", ")}${
          template.keywords.length > 3 ? "..." : ""
        }`;
      }
      return line;
    })
    .join("\n");

  return {
    content: [
      {
        type: "text",
        text: `Available Meme Templates (${templates.length} total):\n\n${templateList}`,
      },
    ],
  };
}
