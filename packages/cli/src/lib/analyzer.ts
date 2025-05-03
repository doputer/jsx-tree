import { analyzeFile } from '@/core/collector';
import printTree from '@/core/console';
import { buildHierarchy } from '@/core/parser';
import { FilterOptions, Path } from '@/types';

const analyzer = (entry: Path, options: FilterOptions = {}) => {
  const context = analyzeFile(entry);
  const tree = buildHierarchy(entry, context);

  const components = Object.values(tree.components);
  const component = components.find(component => component !== null);

  if (component) printTree(component, options);
  else console.error('No valid component found');
};

export default analyzer;
