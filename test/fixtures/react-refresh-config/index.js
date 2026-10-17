import { createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import { label } from "./label.js";

const container = document.createElement("div");

container.id = "root";
container.dataset.label = label;
document.body.append(container);

createRoot(container).render(createElement(App));
