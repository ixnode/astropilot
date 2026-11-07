import ColumnsPreview from './ColumnsPreview.astro';

export default {
    title: 'Layout/Columns',
    component: ColumnsPreview,
    tags: ['autodocs'],
};

export const SingleColumn = {
    args: {
        layout: 'single',
    },
};

export const TwoColumns = {
    args: {
        layout: 'two',
    },
};

export const ThreeColumns = {
    args: {
        layout: 'three',
    },
};

export const FourColumns = {
    args: {
        layout: 'four',
    },
};
