class Component {
    static create(params) {
        let component = new Component();
        component.selector = document.querySelector(params.name);
        component.name = params.name;
        component.template = params.template;


        return service => {
            if (service !== undefined) {
                component.instance = new service();
            }

            component.build();
        }
    }

    build() {
        let component = this;
        let template = component.template;

        if (customElements.get(component.name) === undefined) {
            customElements.define(component.name, class extends HTMLElement {
                constructor() {
                    super();
                }

                connectedCallback() {
                    let variableRegex = /{{([^}]*)}}/g;
                    let templateMatchVariable = [...template.matchAll(variableRegex)];

                    for (let variable of templateMatchVariable) {
                        template = template.replace(variable[0], component.instance[variable[1]]);
                    }

                    for (let event of this.getAttributeNames()) {
                        let eventName = event.substr(1, event.length - 1);

                        component.selector.addEventListener(eventName, function () {
                            component.instance[this.getAttribute(event)].call(component);

                            component.rebuild();
                        })
                    }

                    component.shadow = this.attachShadow({
                        mode: 'open'
                    });

                    component.shadow.innerHTML = template;
                }
            })
        }
    }

    rebuild() {
        let component = this;
        let template = component.template;
        let variableRegex = /{{([^}]*)}}/g;
        let templateMatchVariable = [...template.matchAll(variableRegex)];

        for (let variable of templateMatchVariable) {
            template = template.replace(variable[0], component.instance[variable[1]]);
        }

        component.shadow.innerHTML = template;
    }
}

window.Component = Component;