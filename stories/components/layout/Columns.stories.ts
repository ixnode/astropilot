import Columns from '../../../src/themes/default/components/layout/Columns/Columns.astro';

const column = (span: number, index: number): string =>
    `<div class="ss-column ss-column--span-${span}"><article class="rounded-box bg-base-200 p-6"><h3 class="m-0 text-lg font-bold">Column ${index}</h3><p class="mt-3 mb-0">${span} of 12 columns on desktop, stacked on smaller screens.</p></article></div>`;

const columns = (spans: number[]): string =>
    spans.map((span, index) => column(span, index + 1)).join('');

export default {
    title: 'Layout/Columns',
    component: Columns,
    tags: ['autodocs'],
    parameters: {
        docs: {
            story: {
                height: '10rem',
            },
        },
    },
};

export const SingleColumn = {
    args: {
        slots: {
            default: columns([12]),
        },
    },
};

export const TwoColumns = {
    args: {
        slots: {
            default: columns([6, 6]),
        },
    },
};

export const ThreeColumns = {
    args: {
        slots: {
            default: columns([4, 4, 4]),
        },
    },
};

export const FourColumns = {
    args: {
        slots: {
            default: columns([3, 3, 3, 3]),
        },
    },
};
