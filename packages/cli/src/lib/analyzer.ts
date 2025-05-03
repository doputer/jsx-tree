import { analyzeFile, buildHierarchy, FilterOptions, Path } from '@jsx-tree/core';

import printTree from '@/lib/console';

const analyzer = (entry: Path, options: FilterOptions = {}) => {
  const context = analyzeFile(entry);
  const tree = buildHierarchy(entry, context);

  const components = Object.values(tree.components);
  const component = components.find(component => component !== null);

  if (component) printTree(component, options);
  else console.error('No valid component found');
};

export default analyzer;
