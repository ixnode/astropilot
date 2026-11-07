import CardPreview from './CardPreview.astro';

export default {
    title: 'Molecules/Card',
    component: CardPreview,
    tags: ['autodocs'],
    argTypes: {
        image: {
            control: {
                type: 'select',
                labels: {
                    none: 'No image',
                    landscape: 'Landscape image',
                    portrait: 'Portrait image',
                },
            },
            options: ['none', 'landscape', 'portrait'],
        },
        imageAlt: {
            name: 'Custom image alt text',
            control: 'text',
            description:
                'Optional custom alternative text. Overrides the selected example.',
        },
        imageAltPreset: {
            name: 'Image alt text example',
            control: {
                type: 'select',
                labels: {
                    layout: 'Website layout illustration',
                    editorial: 'Editorial content blocks',
                    content: 'Structured website content',
                },
            },
            options: ['layout', 'editorial', 'content'],
            description:
                'Suggested alternative text. A custom alternative text overrides this selection.',
        },
        title: {
            control: 'text',
            description: 'Card heading.',
        },
        content: {
            control: 'text',
            description: 'Card body copy.',
        },
    },
};

export const TextOnly = {
    args: {
        image: 'none',
        title: 'Simple content card',
        content: 'A reusable card with standard body content and no image.',
    },
};

export const WithImage = {
    args: {
        image: 'landscape',
        imageAltPreset: 'layout',
        imageAlt: '',
        title: 'Card with image',
        content: 'Local Astro assets work directly in Storybook stories.',
    },
};

export const ResponsiveWithImage = {
    name: 'Responsive image and content',
    args: {
        image: 'landscape',
        imageAltPreset: 'content',
        imageAlt: '',
        title: 'A card that remains readable on small screens',
        content:
            'This longer text makes line wrapping, image cropping, and the available content width easy to review with the Storybook viewport toolbar.',
    },
};
