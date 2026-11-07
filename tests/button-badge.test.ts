import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateAstroPilotContent } from '../src/lib/astropilot/validation';

function validate(imports: string, component: string): void {
    const directory = mkdtempSync(join(tmpdir(), 'astropilot-button-badge-'));
    try {
        writeFileSync(
            join(directory, 'page.yaml'),
            'title: Components\ndescription: Component examples.\n',
        );
        writeFileSync(
            join(directory, '01-components.mdx'),
            `${imports}\n\n## Components\n\n${component}\n`,
        );
        validateAstroPilotContent(directory);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
}

test('accepts documented Button variants, styles, sizes, links, and actions', () => {
    assert.doesNotThrow(() =>
        validate(
            "import { Button } from 'astropilot/components';",
            '<Button variant="success" style="soft" size="lg">Save</Button>\n\n<Button href="/contact/">Contact</Button>\n\n<Button type="submit" disabled>Send</Button>',
        ),
    );
});

test('rejects unsupported or conflicting Button props', () => {
    for (const component of [
        '<Button variant="unknown">Invalid</Button>',
        '<Button style="dash">Invalid</Button>',
        '<Button size="huge">Invalid</Button>',
        '<Button href="javascript:alert(1)">Invalid</Button>',
        '<Button href="/contact/" disabled>Invalid</Button>',
        '<Button type="unknown">Invalid</Button>',
    ])
        assert.throws(
            () =>
                validate(
                    "import { Button } from 'astropilot/components';",
                    component,
                ),
            /Button accepts optional/,
        );
});

test('accepts documented Badge variants, styles, and sizes', () => {
    assert.doesNotThrow(() =>
        validate(
            "import { Badge } from 'astropilot/components';",
            '<Badge variant="success" style="soft" size="lg">Ready</Badge>',
        ),
    );
});

test('rejects unsupported Badge props', () => {
    for (const component of [
        '<Badge variant="unknown">Invalid</Badge>',
        '<Badge style="ghost">Invalid</Badge>',
        '<Badge size="huge">Invalid</Badge>',
        '<Badge class="custom">Invalid</Badge>',
    ])
        assert.throws(
            () =>
                validate(
                    "import { Badge } from 'astropilot/components';",
                    component,
                ),
            /Badge accepts optional/,
        );
});
