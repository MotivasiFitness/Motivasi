/**
 * ESLint Rule: no-hardcoded-functions-path
 * 
 * Prevents hardcoding of /_functions* paths outside of backend-config.ts
 * Ensures all backend function calls use the centralized configuration
 * 
 * USAGE:
 * Add to eslint.config.ts:
 * ```typescript
 * import noHardcodedFunctionsPath from './src/eslint-rules/no-hardcoded-functions-path';
 * 
 * export default [
 *   {
 *     plugins: {
 *       'custom': {
 *         rules: {
 *           'no-hardcoded-functions-path': noHardcodedFunctionsPath,
 *         }
 *       }
 *     },
 *     rules: {
 *       'custom/no-hardcoded-functions-path': 'error',
 *     }
 *   }
 * ];
 * ```
 */

import type { Rule } from 'eslint';
import type { Node, Literal } from 'estree';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent hardcoded /_functions* paths outside of backend-config.ts',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      hardcodedPath: 
        'Hardcoded backend function path detected. Use getBackendEndpoint() from @/lib/backend-config instead.',
      hardcodedDevPath:
        'Hardcoded /_functions-dev/ path detected. Use getBackendEndpoint() from @/lib/backend-config instead.',
      hardcodedProdPath:
        'Hardcoded /_functions/ path detected. Use getBackendEndpoint() from @/lib/backend-config instead.',
    },
    schema: [],
    fixable: undefined,
  },

  create(context) {
    const filename = context.getFilename();
    
    // Allow hardcoded paths only in backend-config.ts
    if (filename.endsWith('backend-config.ts') || filename.endsWith('backend-config.js')) {
      return {};
    }

    // Also allow in test files for backend-config
    if (
      filename.includes('backend-config.test') || 
      filename.includes('backend-config.spec')
    ) {
      return {};
    }

    /**
     * Check if a string value contains hardcoded function paths
     */
    function checkStringValue(node: Literal, value: string) {
      // Check for /_functions-dev/ pattern
      if (value.includes('/_functions-dev/')) {
        context.report({
          node: node as any,
          messageId: 'hardcodedDevPath',
        });
        return;
      }

      // Check for /_functions/ pattern (but not /_functions-dev/)
      if (value.includes('/_functions/') && !value.includes('/_functions-dev/')) {
        context.report({
          node: node as any,
          messageId: 'hardcodedProdPath',
        });
        return;
      }

      // Check for generic /_functions pattern in template literals
      if (value.match(/\/_functions[-/]/)) {
        context.report({
          node: node as any,
          messageId: 'hardcodedPath',
        });
      }
    }

    return {
      // Check string literals
      Literal(node: Literal) {
        if (typeof node.value === 'string') {
          checkStringValue(node, node.value);
        }
      },

      // Check template literals
      TemplateLiteral(node: any) {
        // Reconstruct the template string to check for patterns
        const quasis = node.quasis || [];
        const templateString = quasis.map((q: any) => q.value.raw).join('${...}');
        
        if (templateString.includes('/_functions')) {
          context.report({
            node: node as any,
            messageId: 'hardcodedPath',
          });
        }
      },

      // Check JSX attributes (for URLs in components)
      JSXAttribute(node: any) {
        if (node.value && node.value.type === 'Literal') {
          const value = node.value.value;
          if (typeof value === 'string' && value.includes('/_functions')) {
            context.report({
              node: node.value,
              messageId: 'hardcodedPath',
            });
          }
        }
      },
    };
  },
};

export default rule;
