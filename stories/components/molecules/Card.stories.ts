import layoutImage from '../../../src/content/pages/showcase/_assets/layout-landscape.png';
import Card from '../../../src/themes/default/components/molecules/Card/Card.astro';

export default {
    title: 'Molecules/Card',
    component: Card,
    tags: ['autodocs'],
};

export const TextOnly = {
    args: {
        slots: {
            default:
                '<h3>Simple content card</h3><p>A reusable card with standard body content and no image.</p>',
        },
    },
};

export const WithImage = {
    args: {
        image: layoutImage,
        imageAlt: 'Abstract blue representation of a modular website layout',
        slots: {
            default:
                '<h3>Card with image</h3><p>Local Astro assets work directly in Storybook stories.</p>',
        },
    },
};

export const ResponsiveWithImage = {
    name: 'Responsive image and content',
    args: {
        image: layoutImage,
        imageAlt: 'Abstract blue representation of a modular website layout',
        slots: {
            default:
                '<h3>A card that remains readable on small screens</h3><p>This longer text makes line wrapping, image cropping, and the available content width easy to review with the Storybook viewport toolbar.</p>',
        },
    },
};
