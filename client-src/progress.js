class WebpackDevServerProgress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.maxDashOffset = -219.99078369140625;
    this.animationTimer = null;
  }

  #reset() {
    clearTimeout(this.animationTimer);
    this.animationTimer = null;

    const typeAttr = this.getAttribute("type")?.toLowerCase();
    this.type = typeAttr === "circular" ? "circular" : "linear";

    const innerHTML =
      this.type === "circular"
        ? WebpackDevServerProgress.#circularTemplate()
        : WebpackDevServerProgress.#linearTemplate();
    this.shadowRoot.innerHTML = innerHTML;

    this.initialProgress = Number(this.getAttribute("progress")) ?? 0;

    this.#update(this.initialProgress);
  }

  static #circularTemplate() {
    return `
        <style>
        :host {
            width: 200px;
            height: 200px;
            position: fixed;
            right: 5%;
            top: 5%;
            transition: opacity .25s ease-in-out;
            z-index: 2147483645;
        }

        circle {
            fill: #282d35;
        }

        path {
            fill: rgba(0, 0, 0, 0);
            stroke: rgb(186, 223, 172);
            stroke-dasharray: 219.99078369140625;
            stroke-dashoffset: -219.99078369140625;
            stroke-width: 10;
            transform: rotate(90deg) translate(0px, -80px);
        }

        text {
            font-family: 'Open Sans', sans-serif;
            font-size: 18px;
            fill: #ffffff;
            dominant-baseline: middle;
            text-anchor: middle;
        }

        tspan#percent-super {
            fill: #bdc3c7;
            font-size: 0.45em;
            baseline-shift: 10%;
        }

        @keyframes fade {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0); }
        }

        .disappear {
            animation: fade 0.3s;
            animation-fill-mode: forwards;
            animation-delay: 0.5s;
        }

        .hidden {
            display: none;
        }
        </style>
        <svg id="progress" class="hidden noselect" viewBox="0 0 80 80">
        <circle cx="50%" cy="50%" r="35"></circle>
        <path d="M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0"></path>
        <text x="50%" y="51%">
            <tspan id="percent-value">0</tspan>
            <tspan id="percent-super">%</tspan>
        </text>
        </svg>
      `;
  }

  static #linearTemplate() {
    return `
        <style>
        :host {
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            width: 100vw;
            z-index: 2147483645;
        }

        #bar {
            width: 0%;
            height: 4px;
            background-color: rgb(186, 223, 172);
        }

        @keyframes fade {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }

        .disappear {
            animation: fade 0.3s;
            animation-fill-mode: forwards;
            animation-delay: 0.5s;
        }

        .hidden {
            display: none;
        }
        </style>
        <div id="progress"></div>
        `;
  }

  connectedCallback() {
    this.#reset();
  }

  static get observedAttributes() {
    return ["progress", "type"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "progress") {
      this.#update(Number(newValue));
    } else if (name === "type") {
      this.#reset();
    }
  }

  #update(percent) {
    const element = this.shadowRoot.querySelector("#progress");
    if (this.type === "circular") {
      const path = this.shadowRoot.querySelector("path");
      const value = this.shadowRoot.querySelector("#percent-value");
      const offset = ((100 - percent) / 100) * this.maxDashOffset;

      path.style.strokeDashoffset = offset;
      value.textContent = percent;
    } else {
      element.style.width = `${percent}%`;
    }

    if (percent >= 100) {
      this.#hide();
    } else if (percent > 0) {
      this.#show();
    }
  }

  #show() {
    const element = this.shadowRoot.querySelector("#progress");
    element.classList.remove("hidden");
  }

  #hide() {
    const element = this.shadowRoot.querySelector("#progress");
    if (this.type === "circular") {
      element.classList.add("disappear");
      element.addEventListener(
        "animationend",
        () => {
          element.classList.add("hidden");
          this.#update(0);
        },
        { once: true },
      );
    } else if (this.type === "linear") {
      element.classList.add("disappear");
      this.animationTimer = setTimeout(() => {
        element.classList.remove("disappear");
        element.classList.add("hidden");
        element.style.width = "0%";
        this.animationTimer = null;
      }, 800);
    }
  }
}

export function isProgressSupported() {
  return "customElements" in window && !!HTMLElement.prototype.attachShadow;
}

export function defineProgressElement() {
  if (!isProgressSupported() || customElements.get("wds-progress")) {
    return;
  }

  customElements.define("wds-progress", WebpackDevServerProgress);
}
