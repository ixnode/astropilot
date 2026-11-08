import Button from '../../../src/themes/default/components/atoms/Button/Button.astro';

export default {
    title: 'Atoms/Button',
    component: Button,
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
        href: '',
    },
    argTypes: {
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
            description: 'Optional link target. Renders an anchor when set.',
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
        slots: {
            default: 'Primary action',
        },
    },
};

export const Outline = {
    args: {
        variant: 'secondary',
        style: 'outline',
        slots: {
            default: 'Secondary action',
        },
    },
};

export const Link = {
    args: {
        href: '/showcase/',
        slots: {
            default: 'Open showcase',
        },
    },
};

export const Disabled = {
    args: {
        disabled: true,
        slots: {
            default: 'Currently unavailable',
        },
    },
};
