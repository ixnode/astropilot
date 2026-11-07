import type { Preview } from '@storybook-astro/framework';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
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
        viewport: {
            options: MINIMAL_VIEWPORTS,
        },
    },
} satisfies Preview;

export default preview;
