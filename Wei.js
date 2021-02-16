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
        let variableRegex = /{{(\s*[^}]*\s)}}/;
        let variableClickEventRegex = /<(.*)\s+@(click)+=\s*(?:"([^"]*)"+|'([^']*)')/;
        let templateOuterHTML = this._cloneTemplate.outerHTML.split('\n');
        let variableEventArray = [];

        for (let i = 0; i < templateOuterHTML.length; i++) {
            let variableParse = templateOuterHTML[i].match(variableRegex);
            let variableEvent = templateOuterHTML[i].match(variableClickEventRegex);

            if (variableParse !== null) {
                variableParse[1] = variableParse[1].trim()

                if (Object.keys(this.data).includes(variableParse[1])) {
                    templateOuterHTML[i] = templateOuterHTML[i].replace(variableRegex, this.data[variableParse[1]]);
                } else {
                    throw TypeError(`Not Found Variable : ${variableParse[1]}`);
                }
            }

            if (variableEvent !== null) {
                variableEventArray.push([
                    variableEvent[1],
                    variableEvent[2],
                    variableEvent[3]
                ]);
            }
        }

        while (this.template.lastChild) {
            this.template.removeChild(this.template.lastChild);
        }

        templateOuterHTML.splice(0, 1);
        templateOuterHTML.pop();
        this.template.innerHTML = templateOuterHTML.join('\n');

        variableEventArray.forEach(e => {
            let varaibleEvent = this.method[e[2]].toString().split('\n');

            varaibleEvent.splice(0, 1);
            varaibleEvent.pop();

            document.querySelector(e[0]).addEventListener(e[1], e => {
                varaibleEvent.forEach(x => eval(x));
            });
        });
    }

    component(name, settings) {
        console.log(name, settings);
    }
}
