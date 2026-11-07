import ButtonPreview from './ButtonPreview.astro';

export default {
    title: 'Atoms/Button',
    component: ButtonPreview,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            story: {
                height: '6rem',
            },
        },
    },
    args: {
        disabled: false,
        hrefPreset: 'none',
        href: '',
    },
    argTypes: {
        label: {
            control: 'text',
            description: 'Visible text inside the button.',
        },
        variant: {
            control: 'select',
            options: [
                'primary',
                'secondary',
                'accent',
                'neutral',
                'info',
                'success',
                'warning',
                'error',
            ],
        },
        style: {
            control: 'select',
            options: ['solid', 'outline', 'soft', 'ghost', 'link'],
        },
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
        },
        hrefPreset: {
            name: 'Link example',
            control: {
                type: 'select',
                labels: {
                    none: 'No link',
                    showcase: 'Showcase (/showcase/)',
                    documentation: 'Documentation (/dokumentation/)',
                    astro: 'Astro website (https://astro.build/)',
                },
            },
            options: ['none', 'showcase', 'documentation', 'astro'],
            description:
                'Example target. A custom href overrides this selection.',
        },
        href: {
            name: 'Custom href',
            control: 'text',
            description:
                'Optional custom link target. Overrides the selected link example.',
        },
        type: {
            control: 'select',
            options: ['button', 'submit', 'reset'],
        },
        disabled: {
            control: 'inline-radio',
            options: [false, true],
        },
    },
};

export const Primary = {
    args: {
        label: 'Primary action',
    },
};

export const Outline = {
    args: {
        variant: 'secondary',
        style: 'outline',
        label: 'Secondary action',
    },
};

export const Link = {
    args: {
        hrefPreset: 'showcase',
        label: 'Open showcase',
    },
};

export const Disabled = {
    args: {
        disabled: true,
        label: 'Currently unavailable',
    },
};
