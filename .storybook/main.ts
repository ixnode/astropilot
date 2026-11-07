import type { StorybookConfig } from '@storybook-astro/framework';

const config = {
    stories: ['../stories/**/*.stories.ts'],
    addons: ['@storybook/addon-docs'],
    framework: {
        name: '@storybook-astro/framework',
        options: {},
    },
} satisfies StorybookConfig;

export default config;
