# Architecture

This document describes the architecture of the ZAI auth plugin.

## Overview

The ZAI auth plugin is an OpenCode authentication plugin designed for the ZAI API. It supports dynamic API key rotation using a round-robin strategy to ensure efficient usage across multiple API keys.

- **Provider ID**: `"zai-coding-plan"` (This ID overrides the built-in provider).

## Key Components

1.  **Config Loader** (`src/plugin/config/loader.ts`): Responsible for merging configurations from the default values, the JSON config file, and environment variables.
2.  **Config Schema** (`src/plugin/config/schema.ts`): Defines the validation schema for the configuration options.
3.  **Main Plugin** (`index.ts`): The entry point that integrates the configuration and rotation logic to handle authentication requests.

## Flow

1.  **Initialization**: The plugin initializes and loads the configuration from the config file and environment variables.
2.  **Dynamic Key Loading**: API keys are loaded dynamically from environment variables matching the pattern `ZAI_API_KEY_0~N`.
3.  **Round-Robin Rotation**: For each request, the plugin selects the next available key in a round-robin fashion.
4.  **Error Handling**: If a request fails with a 429 (Rate Limit), 401 (Unauthorized), or 5xx (Server Error), the current key is marked as limited or invalid.
5.  **Retry Logic**: The plugin automatically retries the request with the next available key. The maximum number of attempts is equal to the number of loaded keys.
6.  **Cooldown**: A key remains unavailable during its cooldown period. The cooldown defaults to 60 seconds unless specified otherwise by the `Retry-After` header. Once the cooldown expires, the key becomes available again.
