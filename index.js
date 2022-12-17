import * as acorn from 'acorn'
import { visit as estreeVisit } from 'estree-util-visit'
import { visit as unistVisit } from 'unist-util-visit'

const PROP_NAME = 'annotation'

function setAnnotation(node, annotation) {
  let data = node.data || (node.data = {})
  let props = data.hProperties || (data.hProperties = {})
  props[PROP_NAME] = annotation
}

export const mdxAnnotations = {
  remark() {
    return (tree) => {
      unistVisit(tree, (node, nodeIndex, parentNode) => {
        if (node.type === 'code' && /^{\s*{.*?}\s*}$/.test(node.meta)) {
          setAnnotation(node, node.meta.slice(1, -1))
          node.meta = null
          return
        }

        if (node.type === 'tableRow') {
          if (
            node.children.length === 1 &&
            node.children[0].type === 'tableCell' &&
            node.children[0].children.length === 1 &&
            node.children[0].children[0].type === 'mdxTextExpression'
          ) {
            setAnnotation(parentNode, node.children[0].children[0].value)
            parentNode.children.splice(nodeIndex, 1)
          }
          return
        }

        if (!('children' in node) || node.children.length === 0) return

        for (let i = 0; i < node.children.length; i++) {
          let child = node.children[i]
          if (
            child.type === 'mdxTextExpression' &&
            child.value.startsWith('{') &&
            child.value.endsWith('}')
          ) {
            let prev = node.children[i - 1]
            if (!prev) {
              continue
            }
            let refNode
            if (prev.type === 'text' && i === node.children.length - 1) {
              refNode = node
              if (
                node.type === 'paragraph' &&
                parentNode.type === 'listItem' &&
                parentNode.children.length === 1
              ) {
                refNode = parentNode
              }

              prev.value = prev.value.trimEnd()
            } else {
              refNode = prev
            }
            setAnnotation(refNode, child.value)
            node.children.splice(i, 1)
          }
        }
      })
    }
  },
  rehype() {
    return (tree) => {
      unistVisit(tree, 'element', (node, _nodeIndex, parentNode) => {
        if (
          node.tagName === 'code' &&
          PROP_NAME in node.properties &&
          parentNode.type === 'element' &&
          parentNode.tagName === 'pre'
        ) {
          parentNode.properties[PROP_NAME] = node.properties[PROP_NAME]
          delete node.properties[PROP_NAME]
        }
      })
    }
  },
  recma() {
    return (tree) => {
      estreeVisit(tree, (node) => {
        if (node.type !== 'CallExpression') return
        if (
          node.callee.name !== '_jsxs' &&
          node.callee.name !== '_jsx' &&
          node.callee.name !== '_jsxDEV'
        )
          return

        let propsNode = node.arguments[1]
        if (propsNode?.type !== 'ObjectExpression') return

        let propNode = propsNode.properties.find((property) => property.key.name === PROP_NAME)

        if (propNode) {
          let annotationNode = acorn.parse('(' + propNode.value.value.trim() + ')', {
            ecmaVersion: 'latest',
          }).body[0].expression
          propsNode.properties.splice(propsNode.properties.indexOf(propNode), 1)
          propsNode.properties.push({ type: 'SpreadElement', argument: annotationNode })
        }
      })
    }
  },
}
