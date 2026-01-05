# @pretty-dql/prettier-plugin-dql

A Prettier plugin to format DQL (Dynatrace Query Language) strings using a custom formatter.

## Installation

```bash
npm install --save-dev prettier @pretty-dql/prettier-plugin-dql
# or
pnpm add -D prettier @pretty-dql/prettier-plugin-dql
# or
yarn add -D prettier @pretty-dql/prettier-plugin-dql
```

## Usage

Add the plugin to your `.prettierrc`:

```json
{
  "plugins": ["@pretty-dql/prettier-plugin-dql"]
}
```

### Importing the `dql` tag

To avoid TypeScript errors and enable syntax highlighting (if supported by your editor), you can import the `dql` tag from the plugin:

```typescript
import { dql } from '@pretty-dql/prettier-plugin-dql';

const query = dql`fetch logs | filter level == "ERROR"`;
```

### Formatting DQL

This plugin supports formatting DQL in:

1. `.dql` files.
2. Tagged template literals with `dql` tag.
3. Template literals with `/* dql */` comment.

#### Examples

**Tagged Template Literal:**

```typescript
const query = dql`fetch logs | filter level == "ERROR"`;
```

**Template Literal with Comment:**

```typescript
const query = /* dql */ `fetch logs | filter level == "ERROR"`;
```

**DQL File:**

```dql
fetch logs
| filter level == "ERROR"
```

## Development

1. Install dependencies: `pnpm install`
2. Build the plugin: `pnpm build`
3. Run tests/lint: `pnpm lint`

## License

MIT
