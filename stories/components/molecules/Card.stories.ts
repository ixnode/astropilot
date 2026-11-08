import layoutLandscape from '../../../src/content/pages/showcase/_assets/layout-landscape.png';
import Card from '../../../src/themes/default/components/molecules/Card/Card.astro';

export default {
    title: 'Molecules/Card',
    component: Card,
    tags: ['autodocs'],
    argTypes: {
        imageAlt: {
            control: 'text',
            description: 'Meaningful alternative text for the optional image.',
        },
        shadow: {
            control: {
                type: 'select',
                labels: {
                    none: 'No shadow',
                    sm: 'Small shadow',
                    md: 'Medium shadow',
                    lg: 'Large shadow',
                    xl: 'Extra large shadow',
                },
            },
            options: ['none', 'sm', 'md', 'lg', 'xl'],
            description: 'Card elevation. The default is a small shadow.',
        },
    },
};

export const TextOnly = {
    args: {
        shadow: 'sm',
        slots: {
            default:
                '<h3>Simple content card</h3><p>A reusable card with standard body content and no image.</p>',
        },
    },
};

export const WithImage = {
    args: {
        image: layoutLandscape,
        imageAlt: 'Abstract blue representation of a modular website layout',
        shadow: 'md',
        slots: {
            default:
                '<h3>Card with image</h3><p>Local Astro assets work directly in Storybook stories.</p>',
        },
    },
};

export const ResponsiveWithImage = {
    name: 'Responsive image and content',
    args: {
        image: layoutLandscape,
        imageAlt: 'Abstract blue representation of structured website content',
        shadow: 'lg',
        slots: {
            default:
                '<h3>A card that remains readable on small screens</h3><p>This longer text makes line wrapping, image cropping, and the available content width easy to review with the Storybook viewport toolbar.</p>',
        },
    },
};
