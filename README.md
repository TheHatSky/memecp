# MemECP - Simple MCP Server

A simple Model Context Protocol (MCP) server built with TypeScript that provides basic utility tools.

## Features

The server provides three tools:

1. **Calculator** - Perform basic arithmetic calculations
2. **Text Transform** - Transform text (uppercase, lowercase, reverse)
3. **Word Count** - Analyze text for word, character, and line counts

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

### Calculator

Evaluates mathematical expressions safely.

**Input:**

- `expression` (string): Mathematical expression (e.g., "2 + 3 \* 4")

**Example:**

```json
{
  "name": "calculator",
  "arguments": {
    "expression": "10 + 5 * 2"
  }
}
```

### Text Transform

Transforms text using various operations.

**Input:**

- `text` (string): Text to transform
- `operation` (string): One of "uppercase", "lowercase", "reverse"

**Example:**

```json
{
  "name": "text_transform",
  "arguments": {
    "text": "Hello World",
    "operation": "uppercase"
  }
}
```

### Word Count

Analyzes text and provides statistics.

**Input:**

- `text` (string): Text to analyze

**Example:**

```json
{
  "name": "word_count",
  "arguments": {
    "text": "Hello world!\nThis is a test."
  }
}
```

## Development

- `pnpm run clean` - Remove build artifacts
- `pnpm run build` - Build TypeScript to JavaScript
- `pnpm run dev` - Run in development mode
- `pnpm run watch` - Run with file watching

## License

MIT
