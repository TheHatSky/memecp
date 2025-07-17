#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

// Create the MCP server
const server = new Server(
  {
    name: "memecp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Calculator tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calculator",
        description: "Perform basic arithmetic calculations",
        inputSchema: {
          type: "object",
          properties: {
            expression: {
              type: "string",
              description:
                'Mathematical expression to evaluate (e.g., "2 + 3 * 4")',
            },
          },
          required: ["expression"],
        },
      },
      {
        name: "text_transform",
        description: "Transform text (uppercase, lowercase, reverse)",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Text to transform",
            },
            operation: {
              type: "string",
              enum: ["uppercase", "lowercase", "reverse"],
              description: "Type of transformation to apply",
            },
          },
          required: ["text", "operation"],
        },
      },
      {
        name: "word_count",
        description: "Count words, characters, and lines in text",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Text to analyze",
            },
          },
          required: ["text"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "calculator": {
          const { expression } = args as { expression: string };

          // Simple and safe expression evaluation
          const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");
          if (sanitized !== expression) {
            throw new Error("Invalid characters in expression");
          }

          const result = Function(`"use strict"; return (${sanitized})`)();

          return {
            content: [
              {
                type: "text",
                text: `Result: ${result}`,
              },
            ],
          };
        }

        case "text_transform": {
          const { text, operation } = args as {
            text: string;
            operation: string;
          };

          let result: string;
          switch (operation) {
            case "uppercase":
              result = text.toUpperCase();
              break;
            case "lowercase":
              result = text.toLowerCase();
              break;
            case "reverse":
              result = text.split("").reverse().join("");
              break;
            default:
              throw new Error(`Unknown operation: ${operation}`);
          }

          return {
            content: [
              {
                type: "text",
                text: `Transformed text: ${result}`,
              },
            ],
          };
        }

        case "word_count": {
          const { text } = args as { text: string };

          const words = text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0);
          const characters = text.length;
          const charactersNoSpaces = text.replace(/\s/g, "").length;
          const lines = text.split("\n").length;

          return {
            content: [
              {
                type: "text",
                text: `Text Analysis:
- Words: ${words.length}
- Characters: ${characters}
- Characters (no spaces): ${charactersNoSpaces}
- Lines: ${lines}`,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
