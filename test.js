import { test } from 'uvu'
import * as assert from 'uvu/assert'
import * as mdx from '@mdx-js/mdx'
import { mdxAnnotations } from './index.js'
import remarkGfm from 'remark-gfm'

async function compile(string, options = {}) {
  let compiled = await mdx.compile(string, {
    ...options,
    remarkPlugins: [mdxAnnotations.remark, ...(options.remarkPlugins ?? [])],
    rehypePlugins: [mdxAnnotations.rehype, ...(options.rehypePlugins ?? [])],
    recmaPlugins: [mdxAnnotations.recma, ...(options.recmaPlugins ?? [])],
  })
  return compiled.value.trim()
}

test('it works', async () => {
  let compiled = await compile(
    [
      "# Hello {{ foo: 'bar' }}",
      "- Hello {{ foo: 'bar' }}",
      "- Hello {{ foo: 'bar' }}\n\n  World",
      "```php {{ foo: 'bar' }}\necho '';\n```",
      "Hello **world**{{ foo: 'bar' }}",
      "Hello _world_{{ foo: 'bar' }}",
      "Hello `world`{{ foo: 'bar' }}",
      "Hello [world](#){{ foo: 'bar' }}",
      "![](/img.png){{ foo: 'bar' }}",
    ].join('\n\n')
  )

  assert.equal(
    compiled,
    `/*@jsxRuntime automatic @jsxImportSource react*/
import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
function _createMdxContent(props) {
  const _components = Object.assign({
    h1: "h1",
    ul: "ul",
    li: "li",
    p: "p",
    pre: "pre",
    code: "code",
    strong: "strong",
    em: "em",
    a: "a",
    img: "img"
  }, props.components);
  return _jsxs(_Fragment, {
    children: [_jsx(_components.h1, {
      children: "Hello",
      ...{
        foo: 'bar'
      }
    }), "\\n", _jsxs(_components.ul, {
      children: ["\\n", _jsxs(_components.li, {
        children: ["\\n", _jsx(_components.p, {
          children: "Hello"
        }), "\\n"],
        ...{
          foo: 'bar'
        }
      }), "\\n", _jsxs(_components.li, {
        children: ["\\n", _jsx(_components.p, {
          children: "Hello",
          ...{
            foo: 'bar'
          }
        }), "\\n", _jsx(_components.p, {
          children: "World"
        }), "\\n"]
      }), "\\n"]
    }), "\\n", _jsx(_components.pre, {
      children: _jsx(_components.code, {
        className: "language-php",
        children: "echo '';\\n"
      }),
      ...{
        foo: 'bar'
      }
    }), "\\n", _jsxs(_components.p, {
      children: ["Hello ", _jsx(_components.strong, {
        children: "world",
        ...{
          foo: 'bar'
        }
      })]
    }), "\\n", _jsxs(_components.p, {
      children: ["Hello ", _jsx(_components.em, {
        children: "world",
        ...{
          foo: 'bar'
        }
      })]
    }), "\\n", _jsxs(_components.p, {
      children: ["Hello ", _jsx(_components.code, {
        children: "world",
        ...{
          foo: 'bar'
        }
      })]
    }), "\\n", _jsxs(_components.p, {
      children: ["Hello ", _jsx(_components.a, {
        href: "#",
        children: "world",
        ...{
          foo: 'bar'
        }
      })]
    }), "\\n", _jsx(_components.p, {
      children: _jsx(_components.img, {
        src: "/img.png",
        alt: "",
        ...{
          foo: 'bar'
        }
      })
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? _jsx(MDXLayout, Object.assign({}, props, {
    children: _jsx(_createMdxContent, props)
  })) : _createMdxContent(props);
}
export default MDXContent;`
  )
})

test('dev runtime', async () => {
  let compiled = await compile("# Hello {{ foo: 'bar' }}", { development: true })

  assert.equal(
    compiled,
    `/*@jsxRuntime automatic @jsxImportSource react*/
import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";
function _createMdxContent(props) {
  const _components = Object.assign({
    h1: "h1"
  }, props.components);
  return _jsxDEV(_components.h1, {
    children: "Hello",
    ...{
      foo: 'bar'
    }
  }, undefined, false, {
    fileName: "<source.js>",
    lineNumber: 1,
    columnNumber: 1
  }, this);
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? _jsxDEV(MDXLayout, Object.assign({}, props, {
    children: _jsxDEV(_createMdxContent, props, undefined, false, {
      fileName: "<source.js>"
    }, this)
  }), undefined, false, {
    fileName: "<source.js>"
  }, this) : _createMdxContent(props);
}
export default MDXContent;`
  )
})

test('gfm', async () => {
  let compiled = await compile(
    [
      'Hello ~~world~~{{ foo: "bar" }}',
      ['| foo | bar |', '| --- | --- |', '| baz | bim |', '| {{ foo: "bar" }} |'].join('\n'),
      ['| foo | bar |', '| --- | --- |', '| baz | bim {{ foo: "bar" }} |'].join('\n'),
    ].join('\n\n'),
    {
      remarkPlugins: [remarkGfm],
    }
  )

  assert.equal(
    compiled,
    `/*@jsxRuntime automatic @jsxImportSource react*/
import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
function _createMdxContent(props) {
  const _components = Object.assign({
    p: "p",
    del: "del",
    table: "table",
    thead: "thead",
    tr: "tr",
    th: "th",
    tbody: "tbody",
    td: "td"
  }, props.components);
  return _jsxs(_Fragment, {
    children: [_jsxs(_components.p, {
      children: ["Hello ", _jsx(_components.del, {
        children: "world",
        ...{
          foo: "bar"
        }
      })]
    }), "\\n", _jsxs(_components.table, {
      children: [_jsx(_components.thead, {
        children: _jsxs(_components.tr, {
          children: [_jsx(_components.th, {
            children: "foo"
          }), _jsx(_components.th, {
            children: "bar"
          })]
        })
      }), _jsx(_components.tbody, {
        children: _jsxs(_components.tr, {
          children: [_jsx(_components.td, {
            children: "baz"
          }), _jsx(_components.td, {
            children: "bim"
          })]
        })
      })],
      ...{
        foo: "bar"
      }
    }), "\\n", _jsxs(_components.table, {
      children: [_jsx(_components.thead, {
        children: _jsxs(_components.tr, {
          children: [_jsx(_components.th, {
            children: "foo"
          }), _jsx(_components.th, {
            children: "bar"
          })]
        })
      }), _jsx(_components.tbody, {
        children: _jsxs(_components.tr, {
          children: [_jsx(_components.td, {
            children: "baz"
          }), _jsx(_components.td, {
            children: "bim",
            ...{
              foo: "bar"
            }
          })]
        })
      })]
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? _jsx(MDXLayout, Object.assign({}, props, {
    children: _jsx(_createMdxContent, props)
  })) : _createMdxContent(props);
}
export default MDXContent;`
  )
})

test.run()
