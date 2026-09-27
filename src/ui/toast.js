import { TOAST_TIMEOUT } from '../config.js';

const container = () => document.getElementById('toasts');

export function toast(message, { type = 'info', timeout = TOAST_TIMEOUT, action } = {}) {
    const host = container();
    if (!host) return () => {};

    const node = document.createElement('div');
    node.className = `toast toast-${type}`;

    const text = document.createElement('div');
    text.textContent = message;
    node.appendChild(text);

    if (action) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = action.label;
        button.className = 'mt-2 text-xs font-bold text-green-400 hover:text-green-300 underline';
        button.addEventListener('click', () => {
            action.onClick?.();
            dismiss();
        });
        node.appendChild(button);
    }

    host.appendChild(node);

    let timer = timeout ? setTimeout(dismiss, timeout) : null;

    function dismiss() {
        if (timer) clearTimeout(timer);
        timer = null;
        if (!node.isConnected) return;
        node.classList.add('leaving');
        setTimeout(() => node.remove(), 220);
    }

    node.addEventListener('click', (event) => {
        if (!action && event.target === node) dismiss();
    });

    return dismiss;
}

export const notify = {
    info: (message, options) => toast(message, { ...options, type: 'info' }),
    success: (message, options) => toast(message, { ...options, type: 'success' }),
    warning: (message, options) => toast(message, { ...options, type: 'warning' }),
    error: (message, options) => toast(message, { ...options, type: 'error', timeout: 10_000 }),
};
