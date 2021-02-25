class Wei {
    constructor(...argvs) {
        if (argvs.length > 0) {
            this.el = argvs[0].el;
            this.data = argvs[0].data;
            this.template = document.querySelector(this.el);
            this.methods = argvs[0].methods;
            this._cloneTemplate = this.template.cloneNode(true);
            this.rendered = false;
            this.registerVariableListen();
            this.build();
        }
    }

    registerVariableListen() {
        this.data = new Proxy(this.data, {
            set: (obj, x, y) => {
                obj[x] = y;
                this.build();

                return true;
            }
        });
    }

    build() {
        let variableRegex = /{{([^}]*)}}/;
        let variableEventsRegex = {
            'click': /<(.*)\s+@(click)+=\s*(?:"([^"]*)"+|'([^']*)')/
        };

        this._cloneTemplate.childNodes.forEach((x, i) => {
            if (x.outerHTML !== undefined && Object.getOwnPropertySymbols(Object.getPrototypeOf(x)).length > 0) {
                let variableParse = x.outerHTML.match(variableRegex);

                if (variableParse !== null) {
                    let variable = variableParse[1];

                    this.template.childNodes[i].innerText = this.data[variable.trim()];
                } else if (!this.rendered) {
                    for (let event in variableEventsRegex) {
                        let variableEventParse = x.outerHTML.match(variableEventsRegex[event]);

                        this.template.childNodes[i].addEventListener('click', () => {
                            let variableEvent = this.methods[variableEventParse[3]].toString().split('\n');

                            variableEvent.splice(0, 1);
                            variableEvent.pop();
                            variableEvent.forEach(x => eval(x));
                        });
                    }
                }
            }
        });

        this.rendered = true;
    }

    static component(name, instance) {
        customElements.define(name, class extends HTMLElement {
            constructor() {
                super();

                let html = ``;

                if (Object.keys(instance).includes('styles')) {
                    let styles = '<style>';

                    instance['styles'].forEach(ele => {
                        styles += `*{`;
                        Object.keys(ele.style).forEach(obj => {
                            styles += `${obj}:${ele.style[obj]};`;
                        });

                        styles += `}`;
                    });

                    styles += '</style>';
                    html += styles;
                }

                html += instance['template'];

                this.attachShadow({
                    mode: 'open'
                }).innerHTML = html;
            }
        });
    }
}
