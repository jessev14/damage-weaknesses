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
    const dwSet = {
        bypasses: new Set(dw.bypasses),
        value: new Set(dw.value),
        custom: dw.custom
    }
    const traits = app._prepareTraits({
        traits: {
            dw: dwSet
        }
    });

    const dwDiv = document.createElement('div');
    dwDiv.classList.add('form-group');
    if (traits.traits.dw.cssClass) dwDiv.classList.add(traits.traits.dw.cssClass);
    const content = await renderTemplate(`modules/${moduleID}/templates/dw-template.hbs`, traits);
    dwDiv.innerHTML = content;
    dwDiv.querySelector('a.trait-selector').addEventListener('click', () => {
        new dwTraitSelector(actor, dwSet).render(true);
    });

    const dvDiv = html.querySelector('a.trait-selector[data-trait="dv"]').parentElement;
    dvDiv.before(dwDiv);
});


class dwTraitSelector extends dnd5e.applications.actor.TraitSelector {
    constructor(actor, dwSet) {
        actor.system.traits.dw = dwSet;

        super(actor, 'dw');
    }

    get title() {
        return `${this.document.name}: Damage Weaknesses`;
    }

    _getActorOverrides() {
        this.document._source.system.traits.dw = {
            value: new Set(this.document.getFlag(moduleID, 'dw').value)
        };

        return super._getActorOverrides();
    }

    async _updateObject(event, formData) {
        const path = 'system.traits.dw';
        const data = foundry.utils.getProperty(this.document, path);
    
        this._prepareChoices('choices', 'value', formData);
        if ( 'bypasses' in data ) this._prepareChoices('bypasses', 'bypasses', formData);

        const updateData = {
            bypasses: formData.bypasses,
            value: formData.value,
            custom: formData['system.traits.dw.custom']
        };
    
        return this.object.setFlag(moduleID, 'dw', updateData);
    }
}
