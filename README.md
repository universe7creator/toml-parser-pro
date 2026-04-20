# TOML Parser Pro

Professional TOML parser with syntax validation and conversion to JSON/YAML.

## Features

- Parse TOML to JSON
- Parse TOML to YAML
- Syntax validation
- Error detection with line numbers
- API access included

## API Usage

```bash
curl -X POST https://toml-parser-pro.vercel.app/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "toml": "name = \"test\"\\nvalue = 123",
    "format": "json"
  }'
```

## Deploy

```bash
vercel --prod
```
