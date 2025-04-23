import print from '@/core/console';
import { getDefinedComponents, getImportMap } from '@/core/parser';
import type { Component, Key, Link, Node, Path } from '@/types';
import { parseFile, readFileSync } from '@/utils/file';

const analyzer = (entryPath: Path) => {
  const queue = [entryPath];
  const visited = new Set<Key>();
  const compTree = new Map<Key, Node>();
  const pathImportMap = new Map<Path, Map<Component, Path>>();
  const pendingLinks: Link[] = [];

  while (queue.length > 0) {
    const parentPath = queue.shift()!;
    const code = readFileSync(parentPath);
    const ast = parseFile(code);

    const definedComponents = getDefinedComponents(ast);
    const importMap = getImportMap(ast, parentPath);

    pathImportMap.set(parentPath, importMap);

    for (const { name: parentName, components } of definedComponents) {
      const parentKey = `${parentPath}::${parentName}` as const;

      if (visited.has(parentKey)) continue;
      visited.add(parentKey);

      const node: Node = {
        name: parentName,
        path: parentPath,
        children: {},
      } satisfies Node;

      compTree.set(parentKey, node);

      for (const childName of components) {
        pendingLinks.push([parentKey, parentPath, childName]);

        const childPath = importMap.get(childName);
        if (childPath) {
          const childKey = `${childPath}::${childName}` as const;
          if (!visited.has(childKey)) {
            queue.push(childPath);
          }
        }
      }
    }
  }

  for (const [parentKey, parentPath, childName] of pendingLinks) {
    const parentNode = compTree.get(parentKey);
    if (!parentNode) continue;

    const directKey = `${parentPath}::${childName}` as const;
    const importMap = pathImportMap.get(parentPath);
    const importPath = importMap?.get(childName);
    const importKey = importPath ? (`${importPath}::${childName}` as const) : null;

    const childNode = compTree.get(directKey) ?? (importKey ? compTree.get(importKey) : undefined);
    if (compTree.has(directKey) && childNode) childNode.internal = true;

    if (childNode) {
      parentNode.children[childName] = childNode;
    }
  }

  const root = compTree.values().next().value;

  if (root) {
    print(root);
  }
};

export default analyzer;
