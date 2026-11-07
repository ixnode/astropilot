import BadgePreview from './BadgePreview.astro';

export default {
    title: 'Atoms/Badge',
    component: BadgePreview,
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
        label: {
            control: 'text',
            description: 'Visible text inside the badge.',
        },
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
        label: 'Default',
    },
};

export const Success = {
    args: {
        variant: 'success',
        style: 'soft',
        label: 'Build successful',
    },
};

export const Warning = {
    args: {
        variant: 'warning',
        style: 'outline',
        size: 'lg',
        label: 'Review required',
    },
};
