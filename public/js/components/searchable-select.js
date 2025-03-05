import api from "../api.js";

class SearchableSelect extends HTMLElement {
  static observedAttributes = ["placeholder", "entidad"];
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
    this.addStyles();
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
  
          li:hover {
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

    this.input.addEventListener("input", () => this.filterOptions());
    this.input.addEventListener("focus", () => this.showOptions());
    document.addEventListener("click", (e) => this.handleClickOutside(e));
  }

  set options(values) {
    this._options = values;
    this.renderOptions();
  }

  get options() {
    return this._options || [];
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
      li.addEventListener("click", () => this.selectOption(li.textContent));
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

  selectOption(value) {
    this.input.value = value;
    this.optionsList.classList.remove("visible");
  }

  handleClickOutside(e) {
    if (!this.contains(e.target)) {
      this.optionsList.classList.remove("visible");
    }
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

  async fetchOptions(entidad) {
    if (!entidad || !entidad.trim()) return;

    if (entidad === "clientes") {
      entidad = "clientes/all";
    } else if (entidad === "marcas") {
      entidad = "vehiculos/";
    }
    try {
      const response = await api.get(`/${entidad}`);
      this.options = response.data;
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  }
}

customElements.define("searchable-select", SearchableSelect);
