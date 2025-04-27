import printTree from '@/core/console';
import { analyzeFile, buildHierarchy } from '@/core/parser';
import { FilterOptions, Path } from '@/types';

const analyzer = (entry: Path, options: FilterOptions = {}) => {
  const allDefinitions = analyzeFile(entry);
  const tree = buildHierarchy(entry, allDefinitions);

  const components = Object.values(tree.components);
  const component = components.find(component => component !== null);

  if (component) printTree(component, options);
  else console.error('No valid component found');
};

export default analyzer;
