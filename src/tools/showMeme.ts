import { getMemeTemplates } from "../getMemeTemplates.js";

export const showMemeToolDefinition = {
  name: "show_meme",
  description: "Show details for a specific meme template by name",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the meme template to show",
      },
    },
    required: ["name"],
  },
};

export async function showMeme(args: { name: string }) {
  const { name: memeName } = args;
  const templates = await getMemeTemplates();

  // Find template by name or ID
  let template = templates.find(
    (t) => t.name.toLowerCase() === memeName.toLowerCase()
  );

  if (!template) {
    // Try to find by ID
    template = templates.find(
      (t) => t.id.toLowerCase() === memeName.toLowerCase()
    );
  }

  if (!template) {
    // Try partial match
    template = templates.find(
      (t) =>
        t.name.toLowerCase().includes(memeName.toLowerCase()) ||
        memeName.toLowerCase().includes(t.name.toLowerCase())
    );
  }

  if (!template) {
    // Try keyword match
    template = templates.find(
      (t) =>
        t.keywords &&
        t.keywords.some((keyword) =>
          keyword.toLowerCase().includes(memeName.toLowerCase())
        )
    );
  }

  if (!template) {
    const availableNames = templates.map((t) => t.name).join(", ");
    throw new Error(
      `Meme template "${memeName}" not found. Available templates: ${availableNames.substring(
        0,
        200
      )}...`
    );
  }

  // Use the blank template URL if available, otherwise use example
  const imageUrl = template.blank || template.example;

  // Download the image and convert to base64
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Data = Buffer.from(imageBuffer).toString("base64");

  // Build description
  let description = `**${template.name}** (ID: ${template.id})`;
  if (template.keywords && template.keywords.length > 0) {
    description += `\nKeywords: ${template.keywords.join(", ")}`;
  }
  if (template.styles && template.styles.length > 0) {
    description += `\nStyles: ${template.styles.join(", ")}`;
  }

  return {
    content: [
      {
        type: "image",
        data: base64Data,
        mimeType: "image/png",
      },
      {
        type: "text",
        text: description,
      },
    ],
  };
}
