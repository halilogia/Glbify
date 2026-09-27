const LIMIT = 40;

export class History {
    constructor({ capture, restore, limit = LIMIT, onChange } = {}) {
        this.capture = capture;
        this.restore = restore;
        this.limit = limit;
        this.onChange = onChange;
        this.stack = [];
        this.index = -1;
    }

    reset(state) {
        this.stack = [state];
        this.index = 0;
        this.onChange?.(this.info());
    }

    push(state) {
        if (this.index < this.stack.length - 1) this.stack = this.stack.slice(0, this.index + 1);
        this.stack.push(state);
        if (this.stack.length > this.limit) this.stack.shift();
        this.index = this.stack.length - 1;
        this.onChange?.(this.info());
    }

    commit() {
        this.push(this.capture());
    }

    undo() {
        if (!this.canUndo()) return false;
        this.index -= 1;
        this.restore(this.stack[this.index]);
        this.onChange?.(this.info());
        return true;
    }

    redo() {
        if (!this.canRedo()) return false;
        this.index += 1;
        this.restore(this.stack[this.index]);
        this.onChange?.(this.info());
        return true;
    }

    canUndo() {
        return this.index > 0;
    }

    canRedo() {
        return this.index < this.stack.length - 1;
    }

    info() {
        return {
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            position: this.index,
            total: this.stack.length,
        };
    }
}
