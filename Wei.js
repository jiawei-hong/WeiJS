class Wei {
    constructor(argv) {
        this.el = argv.el;
        this.data = argv.data;
        this.template = document.querySelector(this.el);
        this.method = argv.method;
        this._cloneTemplate = this.template.cloneNode(true);
        this.rendered = false;
        this.registerVariableListen();
        this.build();
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
            if (x.outerHTML !== undefined) {
                let variableParse = x.outerHTML.match(variableRegex);

                if (variableParse !== null) {
                    let variable = variableParse[1];

                    this.template.childNodes[i].innerText = this.data[variable.trim()];
                } else if (!this.rendered) {
                    for (let event in variableEventsRegex) {
                        let variableEventParse = x.outerHTML.match(variableEventsRegex[event]);

                        this.template.childNodes[i].addEventListener('click', () => {
                            let variableEvent = this.method[variableEventParse[3]].toString().split('\n');

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

    component(name, settings) {
        console.log(name, settings);
    }
}
