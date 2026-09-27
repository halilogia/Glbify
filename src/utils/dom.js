export function $(selector, root = document) {
    return root.querySelector(selector);
}

export function setHidden(element, hidden) {
    element?.classList.toggle('hidden', hidden);
}

export function setText(element, text) {
    if (element) element.textContent = text;
}

export function setDisabled(element, disabled) {
    if (element) element.disabled = disabled;
}

export function toggleClass(element, className, force) {
    element?.classList.toggle(className, force);
}

export function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
