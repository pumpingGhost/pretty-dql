# Pretty DQL

A simple and efficient DQL (Dynatrace Query Language) formatter.

## Features

- Formats DQL queries with proper indentation and line breaks.
- Handles quoted strings correctly.
- Enforces spacing rules for brackets `[]`, `{}` and colons `:`.
- Splits commands starting with `|` into new lines.
- Aligns arguments for better readability.

## Usage

```typescript
import { formatDql } from './src/format-dql';

const dql = '| fields entity, queryCount = toLong(queryCount), errorCount = toLong(errorCount)';
const formatted = formatDql(dql);
console.log(formatted);
```

## Development

### Install Dependencies

```bash
pnpm install
```

### Run Tests

```bash
pnpm test
```

### Linting

```bash
pnpm run lint
```

### Formatting

```bash
pnpm run format
```

