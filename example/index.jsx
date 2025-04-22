import Foo from './foo';
import { Bar } from './bar';
import Baz from './baz';

import GroupedBaz, { GroupedFoo, GroupedBar } from './grouped-components';
import * as ReExport from './re-export';
import DynamicComponents from './dynamic-components';

function App() {
  const DynamicFoo = DynamicComponents.foo;

  return (
    <main>
      <section>
        <h2>Basic Components</h2>
        <Foo />
        <Bar />
        <Baz />
      </section>

      <section>
        <h2>Grouped Components</h2>
        <GroupedFoo />
        <GroupedBar />
        <GroupedBaz />
      </section>

      <section>
        <h2>Re-Exported Components</h2>
        <ReExport.Foo />
        <ReExport.Bar />
      </section>

      <section>
        <h2>Dynamic Components</h2>
        <DynamicFoo />
      </section>
    </main>
  );
}

export default App;
