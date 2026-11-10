/** Enhance readable static panels into independently keyboard-operable tabs. */
export function initializeTabs(root: ParentNode = document): void {
    for (const group of root.querySelectorAll<HTMLElement>('.ss-tabs')) {
        if (group.dataset.enhanced) continue;
        const list = group.querySelector<HTMLElement>(
            ':scope > .ss-tabs__list',
        );
        const panels = Array.from(
            group.querySelectorAll<HTMLElement>(':scope > .ss-tab'),
        );
        if (!list || panels.length === 0) continue;
        const initial = Number(group.dataset.initial) - 1;
        if (
            !Number.isInteger(initial) ||
            initial < 0 ||
            initial >= panels.length
        )
            throw new Error('Tabs initial exceeds the number of Tab panels.');

        let sequence = 1;
        while (document.getElementById(`ss-tabs-${sequence}`)) sequence += 1;
        group.id = `ss-tabs-${sequence}`;
        list.setAttribute('role', 'tablist');
        list.setAttribute('aria-label', list.dataset.label ?? 'Tabs');

        const buttons = panels.map((panel, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ss-tabs__button tab';
            button.id = `${group.id}-tab-${index + 1}`;
            button.textContent = panel.dataset.title ?? '';
            button.setAttribute('role', 'tab');
            panel.id = `${group.id}-panel-${index + 1}`;
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', button.id);
            panel.tabIndex = 0;
            button.setAttribute('aria-controls', panel.id);
            const label = panel.querySelector<HTMLElement>(
                ':scope > .ss-tab__label',
            );
            if (label) label.hidden = true;
            list.append(button);
            return button;
        });

        function activate(selected: number): void {
            buttons.forEach((button, index) => {
                const active = index === selected;
                button.setAttribute('aria-selected', String(active));
                button.tabIndex = active ? 0 : -1;
                button.classList.toggle('tab-active', active);
                panels[index].hidden = !active;
            });
        }

        buttons.forEach((button, index) => {
            button.addEventListener('click', () => activate(index));
            button.addEventListener('focus', () => activate(index));
            button.addEventListener('keydown', (event) => {
                let next: number;
                switch (event.key) {
                    case 'ArrowRight':
                        next = (index + 1) % buttons.length;
                        break;
                    case 'ArrowLeft':
                        next = (index - 1 + buttons.length) % buttons.length;
                        break;
                    case 'Home':
                        next = 0;
                        break;
                    case 'End':
                        next = buttons.length - 1;
                        break;
                    default:
                        return;
                }
                event.preventDefault();
                buttons[next].focus();
                buttons[next].scrollIntoView({
                    block: 'nearest',
                    inline: 'nearest',
                });
            });
        });
        activate(initial);
        list.hidden = false;
        group.dataset.enhanced = 'true';
    }
}

initializeTabs();
