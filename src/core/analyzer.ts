import print from '@/core/console';
import { analyzeFile, buildHierarchy } from '@/core/parser';
import { Path } from '@/types';

const analyzer = (entry: Path) => {
  const allDefinitions = analyzeFile(entry);
  const tree = buildHierarchy(entry, allDefinitions);

  const components = Object.values(tree.components);
  const component = components.find(component => component !== null);

  if (component) print(component);
  else console.error('No valid component found');
};

export default analyzer;
