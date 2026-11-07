import ButtonPreview from './ButtonPreview.astro';

export default {
    title: 'Atoms/Button',
    component: ButtonPreview,
    tags: ['autodocs'],
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
        href: {
            control: 'text',
        },
        type: {
            control: 'select',
            options: ['button', 'submit', 'reset'],
        },
        disabled: {
            control: 'boolean',
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
        href: '/showcase/',
        label: 'Open showcase',
    },
};

export const Disabled = {
    args: {
        disabled: true,
        label: 'Currently unavailable',
    },
};
