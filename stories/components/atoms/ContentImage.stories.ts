import layoutLandscape from '../../../src/content/pages/showcase/_assets/layout-landscape.png';
import layoutPortrait from '../../../src/content/pages/showcase/_assets/layout-portrait.png';
import ContentImage from '../../../src/themes/default/components/atoms/ContentImage/ContentImage.astro';

export default {
    title: 'Atoms/ContentImage',
    component: ContentImage,
    tags: ['autodocs'],
};

export const Standard = {
    args: {
        src: layoutLandscape,
        alt: 'Abstract blue representation of a modular website layout',
        width: 640,
    },
};

export const CoverCrop = {
    args: {
        src: layoutLandscape,
        alt: 'Abstract blue representation of a modular website layout',
        width: 520,
        height: 220,
        border: 'default',
    },
};

export const FullWidth = {
    args: {
        src: layoutLandscape,
        alt: 'Abstract blue representation of a modular website layout',
        fullWidth: true,
        border: 'default',
    },
};

export const SquareWithoutBorder = {
    args: {
        src: layoutPortrait,
        alt: 'Editorial representation of modular content blocks',
        width: 320,
        height: 320,
        shape: 'square',
        border: 'none',
    },
};
