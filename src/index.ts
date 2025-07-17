#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import {
  showMemeTemplate,
  showMemeTemplateToolDefinition,
} from "./tools/showMemeTemplate.js";
import {
  showAllMemeTemplates,
  showAllMemeTemplatesToolDefinition,
} from "./tools/showAllMemeTemplates.js";
import { composeMeme, composeMemeToolDefinition } from "./tools/composeMeme.js";

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

// Meme tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      showAllMemeTemplatesToolDefinition,
      showMemeTemplateToolDefinition,
      composeMemeToolDefinition,
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
        case showAllMemeTemplatesToolDefinition.name: {
          return await showAllMemeTemplates(
            args as Parameters<typeof showAllMemeTemplates>[0]
          );
        }

        case showMemeTemplateToolDefinition.name: {
          return await showMemeTemplate(
            args as Parameters<typeof showMemeTemplate>[0]
          );
        }

        case composeMemeToolDefinition.name: {
          return await composeMeme(args as Parameters<typeof composeMeme>[0]);
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
  // console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
