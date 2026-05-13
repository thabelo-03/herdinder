module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      /**
       * Fix "Cannot use 'import.meta' outside a module" on web.
       *
       * Some npm packages (e.g. zustand's devtools middleware, mqtt) ship
       * ESM-only code that references `import.meta.env`. Metro bundles for
       * web as CommonJS, so `import.meta` is a SyntaxError at parse time —
       * it crashes the entire JS bundle before a single line of app code runs.
       *
       * This inline plugin replaces every `import.meta` node with a safe
       * object `{ env: { MODE: 'production', DEV: false } }` so the bundle
       * parses and runs correctly on web.
       */
      function fixImportMeta({ types: t }) {
        return {
          name: 'fix-import-meta',
          visitor: {
            MetaProperty(path) {
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                // Replace `import.meta` with:
                // ({ env: { MODE: "production", DEV: false, PROD: true } })
                path.replaceWith(
                  t.parenthesizedExpression(
                    t.objectExpression([
                      t.objectProperty(
                        t.identifier('env'),
                        t.objectExpression([
                          t.objectProperty(
                            t.identifier('MODE'),
                            t.stringLiteral('production')
                          ),
                          t.objectProperty(
                            t.identifier('DEV'),
                            t.booleanLiteral(false)
                          ),
                          t.objectProperty(
                            t.identifier('PROD'),
                            t.booleanLiteral(true)
                          ),
                        ])
                      ),
                    ])
                  )
                );
              }
            },
          },
        };
      },
    ],
  };
};
