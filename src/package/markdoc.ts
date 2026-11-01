import { component, defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';
import type { ValidationError } from '@markdoc/markdoc';

export function validateColumnSpan(value: unknown): ValidationError[] {
  if (value === 4 || value === 8) return [];
  return [{
    id: 'astropilot-column-span-invalid',
    level: 'error',
    message: 'The column span must be 4 or 8.',
  }];
}

/** Creates the restricted Markdoc tag set provided by the AstroPilot default theme. */
export function createAstroPilotMarkdocConfig() {
  return defineMarkdocConfig({
    nodes: {
      document: {
        ...nodes.document,
        render: 'div',
      },
    },
    tags: {
      columns: {
        render: component('astropilot/markdoc/components', 'Columns'),
      },
      column: {
        render: component('astropilot/markdoc/components', 'Column'),
        attributes: {
          span: {
            type: Number,
            required: true,
            validate: validateColumnSpan,
          },
        },
      },
    },
  });
}
