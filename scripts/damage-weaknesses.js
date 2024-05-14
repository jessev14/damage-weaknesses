const moduleID = 'damage-weaknesses';

const lg = x => console.log(x);


Hooks.once('init', () => {
    CONFIG.DND5E.traits.dw = {
        label: 'Damage Weaknesses',
        configKey: 'damageTypes'
    };
});


Hooks.on('renderActorSheet5e', async (app, [html], appData) => {
    const actor = app.object;
    if (!actor.getFlag(moduleID, 'dw')) {
        await actor.setFlag(moduleID, 'dw', {
            bypasses: [],
            value: [],
            custom: ""
        });
    }
    const dw = actor.getFlag(moduleID, 'dw');
    const empty = dw.value.length ? false : true;

    let pills = ``;
    for (const weakness of dw.value) {
        pills += `
            <li class="pill maroon ">
                <span class="label">${CONFIG.DND5E.damageTypes[weakness].label}</span>
            </li>
        `;
    }
    const sheetMode = app._mode === 1 ? 'play': 'edit';
    if (sheetMode === 'edit') {
        const dvDiv = html.querySelector('div.pills-group h3.icon a[data-trait="dv"]').closest('div');
        const dwDiv = document.createElement('div');
        dwDiv.classList.add('pills-group');
        if (empty) dwDiv.classList.add('empty');
        dwDiv.innerHTML = `
            <h3 class="icon">
                <i class="fa-solid fa-heart-half-stroke"></i>
                <span class="roboto-upper">Damage Weaknesses</span>
                <a class="trait-selector" data-trait="dw" data-tooltip="Configure Damage Weaknesses" aria-label="Configure Damage Weaknesses">
                    <i class="fas fa-cog"></i>
                </a>
            </h3>
            <ul class="pills">
                ${pills}
            </ul>
        `;
        const dwSet = {
            bypasses: new Set(dw.bypasses),
            value: new Set(dw.value),
            custom: dw.custom
        }
        actor._source.system.traits.dw = dwSet;
        dwDiv.querySelector('a.trait-selector').addEventListener('click', () => new dwTraitSelector(actor, dwSet).render(true)); 
        dvDiv.after(dwDiv);
    } else {
        const dwDiv = document.createElement('div');
        dwDiv.classList.add('pills-group');
        dwDiv.innerHTML = `
            <h3 class="icon">
            <i class="fa-solid fa-heart-half-stroke"></i>
            <span class="roboto-upper">Weaknesses</span>
            </h3>
            <ul class="pills">
                ${pills}
            </ul>
        `;

        html.querySelector('div.right div.top.flexrow').after(dwDiv);
    }
});


class dwTraitSelector extends dnd5e.applications.actor.TraitSelector {
    constructor(actor, dwSet) {
        actor.system.traits.dw = dwSet;

        super(actor, 'dw');

        this.dwSet = dwSet;
    }

    get title() {
        return `${this.document.name}: Damage Weaknesses`;
    }

    async _updateObject(event, formData) {
        const path = 'system.traits.dw';
        const data = foundry.utils.getProperty(this.document, path);
    
        this._prepareChoices('choices', `${path}.value`, formData);
        if ( 'bypasses' in data ) this._prepareChoices('bypasses', `${path}.bypasses`, formData);
       
        const updateData = {
            bypasses: formData['system.traits.dw.bypasses'],
            value: formData['system.traits.dw.value'],
            custom: formData['system.traits.dw.custom']
        };
    
        return this.object.setFlag(moduleID, 'dw', updateData);
    }
}
