## JSX-Tree

A powerful tool to parse and visualize JSX/TSX files in a tree structure.

### Features

- Parse JSX/TSX files and display them in a readable tree structure
- Filter by components only
- Filter by HTML elements only
- Include or exclude text nodes
- Show file paths for components
- Include or exclude specific tags
- Control the displayed tree depth

### Installation

```bash
# Install globally
npm install -g jsx-tree

# Or use npx directly
npx jsx-tree [options] [file]
```

### Usage

```bash
# Basic usage
jsx-tree path/to/your-component.jsx

# Alternative command
jt path/to/your-component.jsx
```

### Options

```bash
Arguments:
  file                          Path to the entry file (optional if using -e or default file exists)

Options:
  -V, --version                 output the version number
  -f, --entry <file>            Path to the entry file (default: ./index.jsx or ./index.tsx)
  -c, --components-only         Display only component nodes (default: false)
  -H, --html-only               Display only HTML tag nodes (default: false)
  -t, --show-text               Display text nodes (default: false)
  -p, --show-path               Display the file path for each node (default: false)
  -i, --include-tags <tags...>  Include only specified tags or components
  -e, --exclude-tags <tags...>  Exclude specified tags or components
  -d, --depth <depth>           Limit the display depth of the tree
  -h, --help                    display help for command
```

### Examples

Show only components with file paths:

```bash
jsx-tree --components-only --show-path src/App.jsx
```

Show HTML elements:

```bash
jsx-tree --html-only src/components/Header.tsx
```

Include text nodes and limit depth to 3:

```bash
jsx-tree --show-text --depth 3 src/pages/Home.jsx
```

Show only Button and Card components:

```bash
jsx-tree --include-tags Button Card src/ui/Components.jsx
```

Exclude div and span tags:

```bash
jsx-tree --exclude-tags div span src/layout/Main.jsx
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
