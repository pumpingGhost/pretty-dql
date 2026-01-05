# Pretty DQL Monorepo

A simple and efficient DQL (Dynatrace Query Language) formatter.

This repository is a monorepo containing the following packages:

- **[@pretty-dql/format-dql](./packages/format-dql)**: The core formatting logic.
- **[@pretty-dql/cli](./packages/cli)**: A CLI tool to format DQL in files.
- **[@pretty-dql/prettier-plugin-dql](./packages/prettier-plugin-dql)**: A Prettier plugin for DQL (Coming soon).
- **[pretty-dql](./packages/pretty-dql)**: A wrapper package for backward compatibility.

## Development

### Install Dependencies

```bash
pnpm install
```

### Build

```bash
pnpm run build
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

