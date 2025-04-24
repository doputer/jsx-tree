import * as type from '@babel/types';

import { getDefinedComponents, getJSXMemberComponent, getUsedComponents } from '@/core/parser';
import { parseFile } from '@/utils/file';

describe('getJSXMemberComponent', () => {
  it('JSXMemberExpression을 문자열로 반환한다', () => {
    const node = type.jsxMemberExpression(type.jsxIdentifier('UI'), type.jsxIdentifier('Button'));
    const result = getJSXMemberComponent(node);

    expect(result).toBe('UI.Button');
  });

  it('중첩된 JSXMemberExpression도 올바르게 처리한다', () => {
    const node = type.jsxMemberExpression(
      type.jsxMemberExpression(type.jsxIdentifier('App'), type.jsxIdentifier('UI')),
      type.jsxIdentifier('Card'),
    );
    const result = getJSXMemberComponent(node);

    expect(result).toBe('App.UI.Card');
  });
});

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

describe('getDefinedComponents', () => {
  it('FunctionDeclaration에서 컴포넌트를 추출한다', () => {
    const code = `
      function App() {
        return <Header />;
      }
    `;
    const ast = parseFile(code);
    const result = getDefinedComponents(ast);

    expect(result).toEqual([
      {
        name: 'App',
        components: ['Header'],
      },
    ]);
  });

  it('VariableDeclaration에서 컴포넌트를 추출한다', () => {
    const code = `
      const Main = () => {
        return <Footer />;
      };
    `;
    const ast = parseFile(code);
    const result = getDefinedComponents(ast);

    expect(result).toEqual([
      {
        name: 'Main',
        components: ['Footer'],
      },
    ]);
  });
});
