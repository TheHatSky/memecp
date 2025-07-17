import { getMemeTemplates } from "../getMemeTemplates.js";

export const composeMemeToolDefinition = {
  name: "compose_meme",
  description:
    "Generate a meme by selecting an appropriate template and adding text using Memegen.link API",
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

// Optional API key for authenticated requests (removes watermark)
const MEMEGEN_API_KEY = process.env.MEMEGEN_API_KEY;

function encodeText(text: string): string {
  // Handle special characters for memegen.link URL encoding
  return text
    .replace(/_/g, "__") // underscore → double underscore
    .replace(/-/g, "--") // dash → double dash
    .replace(/ /g, "_") // space → underscore
    .replace(/\?/g, "~q") // question mark → ~q
    .replace(/&/g, "~a") // ampersand → ~a
    .replace(/%/g, "~p") // percentage → ~p
    .replace(/#/g, "~h") // hashtag → ~h
    .replace(/\//g, "~s") // slash → ~s
    .replace(/\\/g, "~b") // backslash → ~b
    .replace(/</g, "~l") // less-than → ~l
    .replace(/>/g, "~g") // greater-than → ~g
    .replace(/"/g, "''") // double quote → two single quotes
    .replace(/\n/g, "~n"); // newline → ~n
}

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
      return exactMatch.id;
    }

    // Find exact ID match
    const idMatch = templates.find(
      (t) => t.id.toLowerCase() === normalizedTemplate.toLowerCase()
    );
    if (idMatch) {
      return idMatch.id;
    }

    // Find partial name match
    const partialMatch = templates.find(
      (t) =>
        t.name.toLowerCase().includes(normalizedTemplate.toLowerCase()) ||
        normalizedTemplate.toLowerCase().includes(t.name.toLowerCase())
    );
    if (partialMatch) {
      return partialMatch.id;
    }

    // Find match in keywords
    const keywordMatch = templates.find(
      (t) =>
        t.keywords &&
        t.keywords.some((keyword) =>
          keyword.toLowerCase().includes(normalizedTemplate.toLowerCase())
        )
    );
    if (keywordMatch) {
      return keywordMatch.id;
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
        t.id.includes("button") ||
        (t.keywords && t.keywords.some((k) => k.includes("choice")))
    );
    if (twoButtons) return twoButtons.id;
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
        t.id.includes("brain") ||
        (t.keywords && t.keywords.some((k) => k.includes("brain")))
    );
    if (expandingBrain) return expandingBrain.id;
  }

  // Find "Drake" template for preferences
  if (
    (lowerText.includes("like") && lowerText.includes("dislike")) ||
    lowerText.includes("prefer")
  ) {
    const drake = templates.find(
      (t) => t.name.toLowerCase().includes("drake") || t.id.includes("drake")
    );
    if (drake) return drake.id;
  }

  // Find "This is Fine" template
  if (
    lowerText.includes("fine") ||
    lowerText.includes("ok") ||
    lowerText.includes("disaster")
  ) {
    const thisIsFine = templates.find(
      (t) => t.name.toLowerCase().includes("fine") || t.id.includes("fine")
    );
    if (thisIsFine) return thisIsFine.id;
  }

  // Find "Change My Mind" template
  if (lowerText.includes("change") && lowerText.includes("mind")) {
    const changeMind = templates.find(
      (t) =>
        (t.name.toLowerCase().includes("change") &&
          t.name.toLowerCase().includes("mind")) ||
        t.id.includes("cmm") ||
        t.id.includes("change")
    );
    if (changeMind) return changeMind.id;
  }

  // Find "Distracted Boyfriend" template for comparisons
  if (
    lowerText.includes("distract") ||
    (lowerText.includes("look") && lowerText.includes("at"))
  ) {
    const distractedBf = templates.find(
      (t) =>
        t.name.toLowerCase().includes("distracted") ||
        t.id.includes("boyfriend") ||
        t.id.includes("distracted")
    );
    if (distractedBf) return distractedBf.id;
  }

  // Default to Drake template if available (popular and versatile)
  const drake = templates.find(
    (t) => t.name.toLowerCase().includes("drake") || t.id.includes("drake")
  );
  if (drake) return drake.id;

  // Default to a common meme template (Fry is usually available)
  const fry = templates.find(
    (t) => t.name.toLowerCase().includes("fry") || t.id.includes("fry")
  );
  if (fry) return fry.id;

  // Ultimate fallback - first template
  return templates[0].id;
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

  if (template.includes("brain")) {
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

    // Encode text for URL
    const encodedTopText = encodeText(topText);
    const encodedBottomText = encodeText(bottomText);

    // Build meme URL
    let memeUrl = `https://api.memegen.link/images/${templateId}`;

    if (encodedTopText || encodedBottomText) {
      memeUrl += `/${encodedTopText || "_"}/${encodedBottomText || "_"}.png`;
    } else {
      memeUrl += ".png";
    }

    // Add API key if available
    if (MEMEGEN_API_KEY) {
      memeUrl += `?api_key=${MEMEGEN_API_KEY}`;
    }

    // Fetch the generated meme image
    const headers: Record<string, string> = {};
    if (MEMEGEN_API_KEY) {
      headers["X-API-KEY"] = MEMEGEN_API_KEY;
    }

    const imageResponse = await fetch(memeUrl, { headers });
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch generated meme: ${imageResponse.status} ${imageResponse.statusText}`
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
        // {
        //   type: "image",
        //   data: base64Data,
        //   mimeType: "image/png",
        // },
        {
          type: "text",
          text: `Generated meme using ${templateName}\nTop text: "${topText}"\nBottom text: "${bottomText}"\nMemegen.link URL: ${memeUrl}`,
        },
        {
          type: "text",
          text: `Now you have to open it in browser: ${memeUrl}`,
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
