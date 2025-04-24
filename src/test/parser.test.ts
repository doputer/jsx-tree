import { getUsedComponents } from '@/core/parser';
import { parseFile } from '@/utils/file';

describe('getUsedComponents', () => {
  it('JSXIdentifier 컴포넌트를 추출한다', () => {
    const code = `
      function Sample() {
        return <MyComponent />;
      }
    `;
    const ast = parseFile(code);
    const result = getUsedComponents(ast);

    expect(result).toContain('MyComponent');
  });

  it('JSXMemberExpression 컴포넌트를 추출한다', () => {
    const code = `
      function Sample() {
        return <UI.Button />;
      }
    `;
    const ast = parseFile(code);
    const result = getUsedComponents(ast);

    expect(result).toContain('UI.Button');
  });

  it('중복된 컴포넌트는 한 번만 추출한다', () => {
    const code = `
      function Sample() {
        return (
          <>
            <Header />
            <Header />
            <Footer />
          </>
        );
      }
    `;
    const ast = parseFile(code);
    const result = getUsedComponents(ast);

    expect(result).toEqual(expect.arrayContaining(['Header', 'Footer']));
    expect(result.length).toBe(2);
  });

  it('JSX가 없는 경우 빈 배열을 반환한다', () => {
    const code = `
      function Sample() {
        const x = 42;
        return x;
      }
    `;
    const ast = parseFile(code);
    const result = getUsedComponents(ast);

    expect(result).toEqual([]);
  });
});
