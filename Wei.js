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
        let variableRegex = /{{([^}]*)}}/g;
        let variableClickEventRegex = /<(.*)\s+@(click)+=\s*(?:"([^"]*)"+|'([^']*)')/;
        let variableEventArray = [];
        let templateOuterHTML = this._cloneTemplate.outerHTML.split('\n');
        let htmlTemp = [];

        for (let i = 0; i < templateOuterHTML.length; i++) {
            let variableParse = templateOuterHTML[i].matchAll(variableRegex);
            let variableEvent = templateOuterHTML[i].match(variableClickEventRegex);
            let variableReplace = Array.from(variableParse, x => [x[0],x[1].trim()]);
            let _templateOuterHTML = templateOuterHTML[i];

            if(variableReplace.length > 0){
                variableReplace.forEach(x => {
                    if (Object.keys(this.data).includes(x[1])) {
                        _templateOuterHTML = _templateOuterHTML.replace(x[0],this.data[x[1]]);
                    } else {
                        throw TypeError(`Not Found Variable : ${x[1]}`);
                    }
                });
            }

            if (variableEvent !== null) {
                variableEventArray.push([
                    variableEvent[1],
                    variableEvent[2],
                    variableEvent[3]
                ]);
            }

            htmlTemp.push(_templateOuterHTML);
        }

        while (this.template.lastChild) {
            this.template.removeChild(this.template.lastChild);
        }

        htmlTemp.splice(0, 1);
        htmlTemp.pop();
        this.template.innerHTML = htmlTemp.join('\n');

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
