class Component {
    static create(params) {
        let component = new Component();

        component.selector = document.querySelector(params.name);
        component.name = params.name;
        component.template = params.template;
        component.regex = {
            'variable': /{{([^}]*)}}/g
        };

        return service => {
            if (service !== undefined) {
                let params = new service();

                for (let dataKey in params) {
                    component[dataKey] = params[dataKey];
                }

                let functions = Object.getOwnPropertyNames(Object.getPrototypeOf(params))

                functions.shift();

                for (let functionKey of functions) {
                    component[functionKey] = params[functionKey];
                }
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
                    let templateMatchVariable = [...template.matchAll(component.regex.variable)];

                    for (let variable of templateMatchVariable) {
                        template = template.replace(variable[0], component[variable[1]]);
                    }

                    for (let event of this.getAttributeNames()) {
                        let eventName = event.substr(1, event.length - 1);

                        component.selector.addEventListener(eventName, function () {
                            component[this.getAttribute(event)].call(component);

                            component.rebuild();
                        })

                        component.selector.removeAttribute(event);
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
        let templateMatchVariable = [...template.matchAll(component.regex.variable)];

        for (let variable of templateMatchVariable) {
            template = template.replace(variable[0], component[variable[1]]);
        }

        component.shadow.innerHTML = template;
    }
}

window.Component = Component;