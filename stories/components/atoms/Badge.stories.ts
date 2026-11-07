import Badge from '../../../src/themes/default/components/atoms/Badge/Badge.astro';

export default {
    title: 'Atoms/Badge',
    component: Badge,
    tags: ['autodocs'],
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
