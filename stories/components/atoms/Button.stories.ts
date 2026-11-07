import Button from '../../../src/themes/default/components/atoms/Button/Button.astro';

export default {
    title: 'Atoms/Button',
    component: Button,
    tags: ['autodocs'],
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
