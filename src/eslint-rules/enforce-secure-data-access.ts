/**
 * ESLint Rule: enforce-secure-data-access
 * 
 * Enforces the use of SecureDataAccess wrapper for protected collections.
 * Prevents direct BaseCrudService calls on sensitive collections that require scoping.
 * 
 * This rule helps prevent security vulnerabilities by ensuring all access to
 * protected collections goes through the secure wrapper that enforces role-based scoping.
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const PROTECTED_COLLECTIONS = [
  'clientassignedworkouts',
  'programassignments',
  'clientprofiles',
  'trainerclientassignments',
  'trainerclientnotes',
  'weeklycheckins',
  'weeklysummaries',
  'weeklycoachesnotes',
  'trainernotifications',
];

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/your-org/eslint-rules/${name}`
);

export const enforceSecureDataAccess = createRule({
  name: 'enforce-secure-data-access',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce use of SecureDataAccess wrapper for protected collections instead of direct BaseCrudService calls',
      recommended: 'error',
    },
    messages: {
      useSecureWrapper:
        'Use SecureDataAccess.getScoped() instead of BaseCrudService.getAll() for protected collection "{{collection}}". This ensures proper role-based scoping and prevents unauthorized data access.',
      useSecureWrapperById:
        'Use SecureDataAccess.getByIdScoped() instead of BaseCrudService.getById() for protected collection "{{collection}}". This ensures proper access validation.',
      adminRouteException:
        'Direct BaseCrudService access to protected collection "{{collection}}" is only allowed in admin routes. Add a comment explaining why admin access is needed.',
    },
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const filename = context.getFilename();
    const isAdminRoute = filename.includes('/AdminDashboard') || filename.includes('/admin/');

    return {
      CallExpression(node) {
        // Check for BaseCrudService.getAll() calls
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'BaseCrudService' &&
          node.callee.property.type === 'Identifier' &&
          (node.callee.property.name === 'getAll' || node.callee.property.name === 'getById')
        ) {
          const firstArg = node.arguments[0];
          
          // Check if first argument is a string literal (collection ID)
          if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            const collectionId = firstArg.value;

            // Check if this is a protected collection
            if (PROTECTED_COLLECTIONS.includes(collectionId)) {
              // Check if there's a comment explaining admin access
              const hasAdminComment = context
                .getSourceCode()
                .getCommentsBefore(node)
                .some((comment) =>
                  comment.value.toLowerCase().includes('admin') ||
                  comment.value.toLowerCase().includes('security:')
                );

              if (isAdminRoute && hasAdminComment) {
                // Allow in admin routes with proper documentation
                return;
              }

              const methodName = node.callee.property.name;
              const messageId = methodName === 'getAll' ? 'useSecureWrapper' : 'useSecureWrapperById';

              context.report({
                node,
                messageId: isAdminRoute ? 'adminRouteException' : messageId,
                data: {
                  collection: collectionId,
                },
                fix(fixer) {
                  if (isAdminRoute) {
                    // Don't auto-fix in admin routes, require manual review
                    return null;
                  }

                  // Auto-fix: suggest SecureDataAccess usage
                  const sourceCode = context.getSourceCode();
                  const callText = sourceCode.getText(node);
                  
                  if (methodName === 'getAll') {
                    const replacement = callText.replace(
                      'BaseCrudService.getAll',
                      'SecureDataAccess.getScoped'
                    );
                    return fixer.replaceText(node, replacement);
                  } else if (methodName === 'getById') {
                    const replacement = callText.replace(
                      'BaseCrudService.getById',
                      'SecureDataAccess.getByIdScoped'
                    );
                    return fixer.replaceText(node, replacement);
                  }

                  return null;
                },
              });
            }
          }
        }
      },
    };
  },
});

export default enforceSecureDataAccess;
