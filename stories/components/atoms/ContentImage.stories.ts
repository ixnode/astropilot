import ContentImagePreview from './ContentImagePreview.astro';

export default {
    title: 'Atoms/ContentImage',
    component: ContentImagePreview,
    tags: ['autodocs'],
    args: {
        image: 'landscape',
        alt: 'Abstract blue representation of a modular website layout',
        width: 'auto',
        height: 'auto',
        fullWidth: false,
        shape: 'rounded',
        border: 'none',
    },
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
                type: 'select',
                labels: {
                    auto: 'Automatic',
                    160: '160 px',
                    220: '220 px',
                    240: '240 px',
                    320: '320 px',
                    480: '480 px',
                    520: '520 px',
                    640: '640 px',
                    768: '768 px',
                    960: '960 px',
                    1280: '1280 px',
                },
            },
            options: [
                'auto',
                '160',
                '220',
                '240',
                '320',
                '480',
                '520',
                '640',
                '768',
                '960',
                '1280',
            ],
        },
        height: {
            control: {
                type: 'select',
                labels: {
                    auto: 'Automatic',
                    160: '160 px',
                    220: '220 px',
                    240: '240 px',
                    320: '320 px',
                    480: '480 px',
                    520: '520 px',
                    640: '640 px',
                    768: '768 px',
                    960: '960 px',
                    1280: '1280 px',
                },
            },
            options: [
                'auto',
                '160',
                '220',
                '240',
                '320',
                '480',
                '520',
                '640',
                '768',
                '960',
                '1280',
            ],
        },
        fullWidth: {
            control: 'inline-radio',
            options: [false, true],
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
        width: '640',
    },
};

export const CoverCrop = {
    args: {
        image: 'landscape',
        alt: 'Abstract blue representation of a modular website layout',
        width: '520',
        height: '220',
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
        width: '320',
        height: '320',
        shape: 'square',
        border: 'none',
    },
};
