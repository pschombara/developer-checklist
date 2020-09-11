import {Uuid} from '../options/uuid';

export default class Select {
    constructor(select) {
        if ('SELECT' !== select.tagName) {
            throw new Error('Select only accept select elements');
        }

        this.select = select;
        this.element = null;

        this.template = '<div class="select--chooser-container">Test</div>';
        this.chooser = null;
        this.backdrop = null;
        this.body = document.querySelector('body');
        this.html = document.querySelector('html');

        this.createElement();
    }

    createElement() {
        this.element = document.createElement('input');

        this.element.setAttribute('type', 'text');
        this.element.setAttribute('readonly', 'readonly');

        this.element.classList.add('select--chooser');
        this.element.classList.add(...this.select.classList.values());
        this.select.classList.add('d-none');

        if (-1 !== this.select.selectedIndex) {
            this.element.value = this.select.options[this.select.selectedIndex].innerHTML;
        }

        this.select.after(this.element);

        this.element.addEventListener('click', () => {
            this.buildChooser();
        });
    }

    buildChooser() {
        if (null === this.chooser) {
            this.chooser = document.createElement('div');
            this.chooser.classList.add('select--chooser-container');

            this.chooser.innerHTML =
                '<h5>Choose a option</h5>' +
                '<div class="input-group">' +
                '<div class="input-group-prepend"><span class="input-group-text"><i class="fas fa-search"></i></span></div><input type="search" class="form-control" data-search />' +
                '</div>' +
                '<div class="select--chooser-options" data-options></div>' +
                '<button type="button" class="btn btn-primary btn-block mt-3">OK</button>'
            ;

            this.buildOptions();

            this.backdrop = document.createElement('div');
            this.backdrop.classList.add('select--chooser-backdrop');

            const search = this.chooser.querySelector('[data-search]');

            this.chooser.querySelector('button').addEventListener('click', () => {
                this.body.classList.remove('no--scroll');
                this.html.classList.remove('no--scroll');

                const checked = this.chooser.querySelector('input[type="radio"]:checked');
                this.select.value = checked.value;
                this.element.value = checked.parentNode.innerText;

                this.chooser.querySelectorAll('label.d-none').forEach(label => {
                    label.classList.remove('d-none');
                });

                search.value = '';

                this.body.removeChild(this.chooser);
                this.body.removeChild(this.backdrop);
            });

            search.addEventListener('keyup', (e) => {
                this.searchOption(e.target.value);
            });

            search.addEventListener('search', (e) => {
                this.searchOption(e.target.value);
            });
        }

        this.body.append(this.chooser);
        this.body.append(this.backdrop);

        this.body.classList.add('no--scroll');
        this.html.classList.add('no--scroll');
    }

    searchOption(search) {
        this.chooser.querySelectorAll('input[type="radio"]').forEach(input => {
            if (input.value.includes(search)) {
                input.parentNode.classList.remove('d-none');
            } else if ('' !== input.value) {
                input.parentNode.classList.add('d-none');
            }
        });
    }

    buildOptions() {
        const options = [];

        const optionName = Uuid.generate();

        let selectedValue = '';

        if (-1 !== this.select.selectedIndex) {
            selectedValue = this.select.options[this.select.selectedIndex].value;
        }

        for (let option of this.select.options) {
            const radio = document.createElement('input');
            const label = document.createElement('label');

            radio.setAttribute('type', 'radio');
            radio.name = optionName;
            radio.value = option.value;

            if (selectedValue === option.value) {
                radio.checked = true;
            }

            label.innerHTML = option.innerHTML;
            label.prepend(radio);

            options.push(label);
        }

        this.chooser.querySelector('[data-options]').append(...options);
    }
}
