import Alert from '../../../src/themes/default/components/molecules/Alert/Alert.astro';

export default {
    title: 'Molecules/Alert',
    component: Alert,
    tags: ['autodocs'],
};

export const Information = {
    args: {
        variant: 'info',
        slots: {
            default:
                '<strong>Information:</strong> This component is rendered from an Astro story.',
        },
    },
};

export const Success = {
    args: {
        variant: 'success',
        style: 'soft',
        slots: {
            default: '<strong>Success:</strong> The static build completed.',
        },
    },
};

export const Warning = {
    args: {
        variant: 'warning',
        style: 'outline',
        slots: {
            default:
                '<strong>Warning:</strong> Review content and links before publishing.',
        },
    },
};
