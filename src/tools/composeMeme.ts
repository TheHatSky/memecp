import { getMemeTemplates } from "../getMemeTemplates.js";

export const composeMemeToolDefinition = {
  name: "compose_meme",
  description:
    "Generate a meme by selecting an appropriate template and adding text using Imgflip API",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description:
          "The text content for the meme (will be split appropriately based on template)",
      },
      template: {
        type: "string",
        description:
          "Optional: Specific template name to use. If not provided, an appropriate template will be selected automatically",
      },
      topText: {
        type: "string",
        description: "Optional: Specific text for the top of the meme",
      },
      bottomText: {
        type: "string",
        description: "Optional: Specific text for the bottom of the meme",
      },
    },
    required: ["text"],
  },
};

// Imgflip API credentials - should be set via environment variables
const IMGFLIP_USERNAME = process.env.IMGFLIP_USERNAME || "imgflip_hubot";
const IMGFLIP_PASSWORD = process.env.IMGFLIP_PASSWORD || "imgflip_hubot";

async function selectTemplate(
  text: string,
  userTemplate?: string
): Promise<string> {
  const templates = await getMemeTemplates();

  // If user specified a template, try to use it
  if (userTemplate) {
    const normalizedTemplate = userTemplate.trim();

    // Find exact name match first
    const exactMatch = templates.find(
      (t) => t.name.toLowerCase() === normalizedTemplate.toLowerCase()
    );
    if (exactMatch) {
      return exactMatch.id.toString();
    }

    // Find partial name match
    const partialMatch = templates.find(
      (t) =>
        t.name.toLowerCase().includes(normalizedTemplate.toLowerCase()) ||
        normalizedTemplate.toLowerCase().includes(t.name.toLowerCase())
    );
    if (partialMatch) {
      return partialMatch.id.toString();
    }

    // If numeric ID provided, validate it exists
    const numericId = parseInt(normalizedTemplate);
    if (!isNaN(numericId)) {
      const idMatch = templates.find((t) => t.id === numericId.toString());
      if (idMatch) {
        return numericId.toString();
      }
    }
  }

  // Auto-select template based on text content and common patterns
  const lowerText = text.toLowerCase();

  // Find "Two Buttons" template for choices
  if (
    lowerText.includes("vs") ||
    lowerText.includes("or") ||
    lowerText.includes("choose")
  ) {
    const twoButtons = templates.find(
      (t) =>
        t.name.toLowerCase().includes("two buttons") ||
        t.name.toLowerCase().includes("button")
    );
    if (twoButtons) return twoButtons.id.toString();
  }

  // Find "Expanding Brain" template for intelligence
  if (
    lowerText.includes("brain") ||
    lowerText.includes("smart") ||
    lowerText.includes("intelligence")
  ) {
    const expandingBrain = templates.find(
      (t) =>
        t.name.toLowerCase().includes("brain") ||
        t.name.toLowerCase().includes("expanding")
    );
    if (expandingBrain) return expandingBrain.id.toString();
  }

  // Find "Drake" template for preferences
  if (lowerText.includes("like") && lowerText.includes("dislike")) {
    const drake = templates.find((t) => t.name.toLowerCase().includes("drake"));
    if (drake) return drake.id.toString();
  }

  // Find "This is Fine" template
  if (
    lowerText.includes("fine") ||
    lowerText.includes("ok") ||
    lowerText.includes("disaster")
  ) {
    const thisIsFine = templates.find((t) =>
      t.name.toLowerCase().includes("fine")
    );
    if (thisIsFine) return thisIsFine.id.toString();
  }

  // Find "Change My Mind" template
  if (lowerText.includes("change") && lowerText.includes("mind")) {
    const changeMind = templates.find(
      (t) =>
        t.name.toLowerCase().includes("change") &&
        t.name.toLowerCase().includes("mind")
    );
    if (changeMind) return changeMind.id.toString();
  }

  // Find "Is This a Pigeon" template for questions
  if (
    lowerText.includes("?") ||
    lowerText.includes("question") ||
    lowerText.includes("is this")
  ) {
    const pigeon = templates.find((t) =>
      t.name.toLowerCase().includes("pigeon")
    );
    if (pigeon) return pigeon.id.toString();
  }

  // Default to Drake Hotline Bling (most popular and versatile)
  const drake = templates.find((t) => t.name.toLowerCase().includes("drake"));
  if (drake) return drake.id.toString();

  // Ultimate fallback - first template
  return templates[0].id.toString();
}

function splitText(
  text: string,
  template: string
): { topText: string; bottomText: string } {
  // If text contains common separators, split on them
  const separators = [" vs ", " or ", "\n", " | ", " / "];

  for (const separator of separators) {
    if (text.includes(separator)) {
      const parts = text.split(separator);
      return {
        topText: parts[0].trim(),
        bottomText: parts.slice(1).join(separator).trim(),
      };
    }
  }

  // If no separator found, try to split intelligently based on template
  const words = text.split(" ");

  if (template === "brain") {
    // For expanding brain, use all text in bottom
    return {
      topText: "",
      bottomText: text,
    };
  }

  // Default split in half
  const midPoint = Math.ceil(words.length / 2);
  return {
    topText: words.slice(0, midPoint).join(" "),
    bottomText: words.slice(midPoint).join(" "),
  };
}

export async function composeMeme(args: {
  text: string;
  template?: string;
  topText?: string;
  bottomText?: string;
}) {
  const {
    text,
    template: userTemplate,
    topText: userTopText,
    bottomText: userBottomText,
  } = args;

  try {
    // Select appropriate template
    const templateId = await selectTemplate(text, userTemplate);

    // Determine text placement
    let topText: string;
    let bottomText: string;

    if (userTopText || userBottomText) {
      // Use user-specified text
      topText = userTopText || "";
      bottomText = userBottomText || "";
    } else {
      // Auto-split the text
      const split = splitText(text, templateId);
      topText = split.topText;
      bottomText = split.bottomText;
    }

    // Prepare form data for Imgflip API
    const formData = new URLSearchParams();
    formData.append("template_id", templateId);
    formData.append("username", IMGFLIP_USERNAME);
    formData.append("password", IMGFLIP_PASSWORD);
    formData.append("text0", topText);
    formData.append("text1", bottomText);

    // Call Imgflip caption_image API
    const response = await fetch("https://api.imgflip.com/caption_image", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(
        `Imgflip API request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        `Imgflip API error: ${result.error_message || "Unknown error"}`
      );
    }

    // Fetch the generated meme image
    const imageResponse = await fetch(result.data.url);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch generated meme: ${imageResponse.status}`
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Data = Buffer.from(imageBuffer).toString("base64");

    // Get template name for display
    const templates = await getMemeTemplates();
    const template = templates.find((t) => t.id === templateId);
    const templateName = template?.name || `Template ID: ${templateId}`;

    return {
      content: [
        {
          type: "image",
          data: base64Data,
          mimeType: "image/jpeg",
        },
        {
          type: "text",
          text: `Generated meme using ${templateName}\nTop text: "${topText}"\nBottom text: "${bottomText}"\nImgflip URL: ${result.data.page_url}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Meme generation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
