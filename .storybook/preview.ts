import type { Preview } from '@storybook-astro/framework';
import './preview.css';

const preview = {
    parameters: {
        layout: 'padded',
        controls: {
            expanded: true,
        },
        docs: {
            codePanel: true,
        },
    },
} satisfies Preview;

export default preview;
