class SearchableSelect extends HTMLElement {
  static observedAttributes = ["placeholder"];
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
    this.addStyles();
    this.afterSelect = null;
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
          .combo-box {
            position: relative;
            width: 100%;
          }
  
          input {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin: 0 !important;
          }
  
          ul {
            list-style: none;
            padding: 0;
            margin: 0;
            border: 1px solid #ccc;
            border-top: none;
            max-height: 150px;
            overflow-y: auto;
            background: white;
            position: absolute;
            width: 100%;
            z-index: 10;
            border-radius: 0 0 5px 5px;
            display: none;
          }
  
          ul.visible {
            display: block;
          }
  
          li {
            padding: 8px;
            cursor: pointer;
          }
  
          li:hover, li:focus {
            background: #f0f0f0;
}
        </style>
        
        <div class="combo-box">
          <input type="text" />
          <ul></ul>
        </div>
      `;

    this.input = this.shadowRoot.querySelector("input");
    this.optionsList = this.shadowRoot.querySelector("ul");

    // TODO : #1 Los eventos de change y el mousedown de los li se ejecutan ambos en el caso donde el usuario escribe en el input y luego hace click en un li. Esto provoca que se ejecute el evento change antes de que se ejecute el evento mousedown del li. Solucionar este problema.
    this.input.addEventListener("input", () => this.filterOptions());
    this.input.addEventListener("mousedown", (event) => this.showOptions());
    this.input.addEventListener("blur", () => this.handleOutFocus());
    this.input.addEventListener("change", () => this.handleChangeValue());
    //TODOD: move between options with arrow keys
  }

  set options(values) {
    this._options = values;
    this.renderOptions();
  }

  get options() {
    return this._options || [];
  }

  setFunctionAfterSelect(func = null) {
    this.afterSelect = func;
  }

  renderOptions() {
    this.optionsList.innerHTML = this.options
      .map(
        (option) => `
        <li>${option}</li>
      `
      )
      .join("");

    this.shadowRoot.querySelectorAll("li").forEach((li) => {
      li.addEventListener("mousedown", (event) => {
        this.selectOption(event, li.textContent);
      });
    });
  }

  filterOptions() {
    const query = this.input.value.toLowerCase();
    this.shadowRoot.querySelectorAll("li").forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(query)
        ? ""
        : "none";
    });
  }

  showOptions() {
    this.optionsList.classList.add("visible");
  }

  selectOption(event, value) {
    event.preventDefault();
    this.input.value = value;
    this.optionsList.classList.remove("visible");
    console.log("Event --> click li ");
    if (this.afterSelect) {
      this.afterSelect();
    }
  }

  handleChangeValue(e) {
    this.optionsList.classList.remove("visible");
    console.log("Event --> change");
    if (this.afterSelect) {
      this.afterSelect();
    }
  }

  handleOutFocus() {
    this.optionsList.classList.remove("visible");
    console.log("Event --> focus");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "placeholder") {
      this.input.placeholder = newValue;
    } else if (name === "entidad") {
      this.fetchOptions(newValue);
    }
  }

  addStyles() {
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "./css/input.css");
    this.shadowRoot.appendChild(linkElem);
  }
}

customElements.define("searchable-select", SearchableSelect);
