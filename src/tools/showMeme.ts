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

  const template = templates.find(
    (t) => t.name.toLowerCase() === memeName.toLowerCase()
  );

  if (!template) {
    const availableNames = templates.map((t) => t.name).join(", ");
    throw new Error(
      `Meme template "${memeName}" not found. Available templates: ${availableNames}`
    );
  }

  // Download the image and convert to base64
  const imageResponse = await fetch(template.url);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Data = Buffer.from(imageBuffer).toString("base64");

  return {
    content: [
      {
        type: "image",
        data: base64Data,
        mimeType: "image/jpeg",
      },
      // ,
      // {
      //   type: "text",
      //   text: `${template.name} (${template.width}x${template.height}, ${template.box_count} text boxes)`,
      // },
    ],
  };
}
