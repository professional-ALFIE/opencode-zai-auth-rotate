# opencode-zai-auth

An OpenCode authentication plugin for the ZAI API that supports **multi-key round-robin rotation** and automatic retry mechanisms.

---

## 🚀 Installation

```bash
npm install opencode-zai-auth
```

---

## 🔑 Environment Variables

This plugin requires at least one ZAI API key to be set as an environment variable. Multiple keys are supported for automatic rotation.

### Required Variables

```bash
# Set your API keys (0 to N)
export ZAI_API_KEY_0="your-api-key-0"
export ZAI_API_KEY_1="your-api-key-1"
# ...
export ZAI_API_KEY_N="your-api-key-n"
```

### Optional Variables

```bash
# Enable debug mode
export ZAI_DEBUG=1
```

---

## ⚙️ Configuration

You can configure the plugin using a JSON file.

### Configuration File Path
`~/.config/opencode/zai.json`

### Configuration Example
```json
{
  "debug": false
}
```

*Note: The `keys` field is not supported in the config file. Please use environment variables for API keys.*

### Debug Mode
Debug logs can be enabled via environment variable or the configuration file.

```bash
# Via Environment Variable
export ZAI_DEBUG=1

# Via Configuration File (~/.config/opencode/zai.json)
{
  "debug": true
}
```

---

## 🔌 OpenCode Integration

To use this plugin with OpenCode, add it to your `opencode.json` configuration file.

### opencode.json Example

```json
{
  "plugin": ["opencode-zai-auth"]
}
```
*(Note: Use "plugin" as a singular key, NOT "plugins".)*

### Full Configuration Example

```json
{
  "plugin": ["opencode-zai-auth"],
  "provider": "zai-coding-plan",
  "model": "glm-4-plus"
}
```

> **Important**: The provider ID is `"zai-coding-plan"`. This plugin overrides the built-in `zai-coding-plan` provider.

---

## 🔄 Multi-Key Rotation Strategy

### Round-Robin Rotation
The plugin automatically detects all environment variables following the `ZAI_API_KEY_N` pattern and rotates through them sequentially.

```
Request 1 → ZAI_API_KEY_0
Request 2 → ZAI_API_KEY_1
Request 3 → ZAI_API_KEY_0 (Cycle back)
```

---

## ⚡ Error Handling & Cooldown

The plugin automatically handles various error codes by switching to the next available key:

1. **429 (Rate Limit)**: Marks the current key as 'rate-limited'.
2. **401 (Unauthorized)**: Marks the key as invalid.
3. **5xx (Server Error)**: Automatically retries with the next key.

### Cooldown Mechanism
Keys that encounter rate limits are put on cooldown and skipped until the wait period expires.

| Window | Duration | Behavior |
|--------|----------|----------|
| Minute | 60 seconds | Block key for 1 minute |
| Hour   | 60 minutes | Block key for 1 hour |
| Day    | 24 hours   | Block key for 24 hours |

---

## 🛠 Troubleshooting

1. **"No API keys found"**: Ensure you have exported at least `ZAI_API_KEY_0`.
2. **"All keys are on cooldown"**: You have reached the rate limits for all provided keys. Please wait or add more keys.
3. **Plugin not loading**: Verify that your `opencode.json` uses the singular `"plugin": ["opencode-zai-auth"]` field.

---

## 🧪 Testing

```bash
bun test
```

---

## 📄 License

MIT
