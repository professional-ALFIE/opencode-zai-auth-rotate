# Configuration

This document describes how to configure the ZAI auth plugin.

## Config File

The configuration file is located at `~/.config/opencode/zai.json`.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| debug | boolean | false | Enable debug logging |

## Environment Variables

| Variable | Override | Description |
|----------|----------|-------------|
| ZAI_DEBUG | debug | Overrides the `debug` setting in the config file. |
| ZAI_API_KEY_0~N | - | Dynamic key detection for rotation. |

## Priority

The configuration is loaded in the following order of priority (highest priority overrides lower):

1. Environment variables
2. Config file (`~/.config/opencode/zai.json`)
3. Defaults

## Example Config

```json
{
  "debug": false
}
```
