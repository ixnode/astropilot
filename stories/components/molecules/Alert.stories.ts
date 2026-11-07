import AlertPreview from './AlertPreview.astro';

export default {
    title: 'Molecules/Alert',
    component: AlertPreview,
    tags: ['autodocs'],
    argTypes: {
        heading: {
            control: 'text',
            description: 'Optional emphasized lead-in for the message.',
        },
        label: {
            control: 'text',
            description: 'Concise alert message.',
        },
        variant: {
            control: 'select',
            options: ['default', 'info', 'success', 'warning', 'error'],
        },
        style: {
            control: 'select',
            options: ['normal', 'soft', 'outline', 'dash'],
        },
    },
};

export const Information = {
    args: {
        variant: 'info',
        heading: 'Information',
        label: 'This component is rendered from an Astro story.',
    },
};

export const Success = {
    args: {
        variant: 'success',
        style: 'soft',
        heading: 'Success',
        label: 'The static build completed.',
    },
};

export const Warning = {
    args: {
        variant: 'warning',
        style: 'outline',
        heading: 'Warning',
        label: 'Review content and links before publishing.',
    },
};
