import ColumnsPreview from './ColumnsPreview.astro';

export default {
    title: 'Layout/Columns',
    component: ColumnsPreview,
    tags: ['autodocs'],
    parameters: {
        docs: {
            story: {
                height: '10rem',
            },
        },
    },
    argTypes: {
        layout: {
            name: 'Layout',
            control: {
                type: 'select',
                labels: {
                    single: 'One column (12 / 12)',
                    two: 'Two columns (6 / 6)',
                    three: 'Three columns (4 / 4 / 4)',
                    four: 'Four columns (3 / 3 / 3 / 3)',
                },
            },
            options: ['single', 'two', 'three', 'four'],
            description:
                'Equal column distribution on desktop; stacked on smaller screens.',
        },
    },
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
