import Badge from '../../../src/themes/default/components/atoms/Badge/Badge.astro';

export default {
    title: 'Atoms/Badge',
    component: Badge,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            story: {
                height: '6rem',
            },
        },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'default',
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
            options: ['solid', 'outline', 'soft', 'dash'],
        },
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
        },
    },
};

export const Default = {
    args: {
        slots: {
            default: 'Default',
        },
    },
};

export const Success = {
    args: {
        variant: 'success',
        style: 'soft',
        slots: {
            default: 'Build successful',
        },
    },
};

export const Warning = {
    args: {
        variant: 'warning',
        style: 'outline',
        size: 'lg',
        slots: {
            default: 'Review required',
        },
    },
};
