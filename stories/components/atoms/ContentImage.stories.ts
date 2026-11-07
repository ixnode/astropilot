import ContentImagePreview from './ContentImagePreview.astro';

export default {
    title: 'Atoms/ContentImage',
    component: ContentImagePreview,
    tags: ['autodocs'],
    argTypes: {
        image: {
            control: {
                type: 'select',
                labels: {
                    landscape: 'Landscape image',
                    portrait: 'Portrait image',
                },
            },
            options: ['landscape', 'portrait'],
        },
        alt: {
            control: 'text',
        },
        width: {
            control: {
                type: 'number',
                min: 1,
                max: 1600,
                step: 1,
            },
        },
        height: {
            control: {
                type: 'number',
                min: 1,
                max: 1600,
                step: 1,
            },
        },
        fullWidth: {
            control: 'boolean',
        },
        shape: {
            control: 'select',
            options: ['rounded', 'square'],
        },
        border: {
            control: 'select',
            options: ['default', 'none'],
        },
    },
};

export const Standard = {
    args: {
        image: 'landscape',
        alt: 'Abstract blue representation of a modular website layout',
        width: 640,
    },
};

export const CoverCrop = {
    args: {
        image: 'landscape',
        alt: 'Abstract blue representation of a modular website layout',
        width: 520,
        height: 220,
        border: 'default',
    },
};

export const FullWidth = {
    args: {
        image: 'landscape',
        alt: 'Abstract blue representation of a modular website layout',
        fullWidth: true,
        border: 'default',
    },
};

export const SquareWithoutBorder = {
    args: {
        image: 'portrait',
        alt: 'Editorial representation of modular content blocks',
        width: 320,
        height: 320,
        shape: 'square',
        border: 'none',
    },
};
