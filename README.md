# MemECP - Meme Generation MCP Server

A Model Context Protocol (MCP) server built with TypeScript that provides meme generation tools using the Memegen.link API.

## Features

The server provides three powerful meme tools:

1. **Show All Meme Templates** - Browse all available meme templates from Memegen.link
2. **Show Meme Template** - View details and preview of a specific meme template
3. **Compose Meme** - Generate custom memes with intelligent template selection and text placement

## Prerequisites

- Node.js 18 or higher
- pnpm package manager

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Build the project:

```bash
pnpm run build
```

3. (Optional) Set up API key for watermark-free memes:

```bash
export MEMEGEN_API_KEY=your_api_key_here
```

## Usage

### Development Mode

Run the server in development mode with hot reload:

```bash
pnpm run dev
```

### Production Mode

Build and run the server:

```bash
pnpm run build
pnpm start
```

### Watch Mode

Run with file watching for development:

```bash
pnpm run watch
```

## MCP Client Configuration

To use this server with an MCP client, configure it to run:

```bash
node /path/to/memecp/dist/index.js
```

Or in development:

```bash
pnpm --dir /path/to/memecp run dev
```

## Available Tools

### Show All Meme Templates

Lists all available meme templates from Memegen.link with their names, IDs, and keywords.

**Usage:**

```json
{
  "name": "show_all_meme_templates",
  "arguments": {}
}
```

### Show Meme Template

Shows details and preview image for a specific meme template. Supports search by name, ID, or keywords.

**Input:**

- `name` (string): Name, ID, or keyword of the meme template

**Example:**

```json
{
  "name": "show_meme_template",
  "arguments": {
    "name": "fine"
  }
}
```

### Compose Meme

Generates a custom meme with automatic template selection and intelligent text placement.

**Input:**

- `text` (string): Text content for the meme. Use `|` to split into top/bottom text, or let the AI split it intelligently
- `template` (string, optional): Specific template name/ID to use. If not provided, the best template is selected automatically
- `returnImage` (boolean, optional): Whether to return the image data. Defaults to true

**Examples:**

Auto-selected template:

```json
{
  "name": "compose_meme",
  "arguments": {
    "text": "Updating documentation | Actually reading the code first"
  }
}
```

Specific template:

```json
{
  "name": "compose_meme",
  "arguments": {
    "text": "One does not simply | Write documentation without bugs",
    "template": "mordor"
  }
}
```

Smart text parsing:

```json
{
  "name": "compose_meme",
  "arguments": {
    "text": "When you find out the README describes a completely different project than what the code actually does"
  }
}
```

## Template Selection Intelligence

The compose tool includes smart template selection based on text content:

- **Choice/comparison text** (vs, or, choose) → Two Buttons template
- **Intelligence/brain text** → Expanding Brain template
- **"Fine" or disaster text** → This is Fine template
- **"Change my mind" text** → Change My Mind template
- **Distraction/comparison** → Distracted Boyfriend template
- **And many more patterns...**

## Text Encoding

The server automatically handles special character encoding for URLs:

- Spaces become underscores
- Special characters are properly escaped
- Line breaks and formatting are preserved

## API Integration

This server uses the [Memegen.link API](https://memegen.link) which provides:

- 200+ popular meme templates
- High-quality image generation
- Customizable text styling
- Optional API key for watermark removal

## Development

- `pnpm run clean` - Remove build artifacts
- `pnpm run build` - Build TypeScript to JavaScript
- `pnpm run dev` - Run in development mode
- `pnpm run watch` - Run with file watching

## License

MIT
