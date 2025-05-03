## @jsx-tree/core

A tool for analyzing JSX/TSX files. It parses JSX/TSX files to generate a tree structure.

### Installation

```bash
npm install @jsx-tree/core
```

### Usage

```js
import { analyzeFile, buildHierarchy } from '@jsx-tree/core';

// Parse JSX/TSX file
const context = analyzeFile(entry);

// Generate component tree
const tree = buildHierarchy(entry, context);

// Use the results
console.log(tree);
```

### API

#### analyzeFile(entry: Path): Context

Parses JSX/TSX files and returns a Context.

The Context consists of `allImports` which maps `Imported Path::Component Name` to `Path`, and `allDefinitions` which maps `Defined Path::Component Name` to `node definitions`.

```ts
type Context = {
  allImports: Map<Key, Path>;
  allDefinitions: Map<Key, Definition>;
};

type Key = `${Path}::${Name}`;

type Definition = {
  name: Name;
  path: Path;
  node: Node;
};
```

#### buildHierarchy(entry: Path, context: Context): Root

Analyzes the Context to generate a tree structure.

```ts
type Root = {
  type: string;
  components: Record<Name, Component>;
};

type Component = HtmlNode | ComponentNode | TextNode | PlaceholderNode | ExpressionNode;

type HtmlNode = {
  type: 'HTML';
  name: Name;
  children: Component[];
};

type ComponentNode = {
  type: 'COMPONENT';
  name: Name;
  path: Path;
  render: Component | null;
};

type TextNode = {
  type: 'TEXT';
  value: string;
};

type PlaceholderNode = {
  type: 'CHILDREN_PLACEHOLDER';
  value: 'children';
};

type ExpressionNode = {
  type: 'EXPRESSION';
  value: string;
};
```
