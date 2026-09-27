import * as THREE from 'three';

export class Animator {
    constructor(mixer, clips = []) {
        this.mixer = mixer;
        this.clips = clips;
        this.actions = clips.map((clip) => mixer.clipAction(clip));
        this.index = 0;
        this.speed = 1;
        this.loop = true;
        this.playing = this.actions.length > 0;
        this.onChange = null;
        this.select(0);
    }

    get clip() {
        return this.clips[this.index] ?? null;
    }

    get duration() {
        return this.clip?.duration ?? 0;
    }

    get time() {
        return this.clip ? Math.min(this.action.time, this.duration) : 0;
    }

    get action() {
        return this.actions[this.index] ?? null;
    }

    select(index) {
        if (!this.actions.length) return;
        this.actions.forEach((action, position) => {
            action.enabled = position === index;
            action.stop();
        });
        this.index = index;
        if (this.playing) this.play();
        this.notify();
    }

    play() {
        const action = this.action;
        if (!action) return;
        action.enabled = true;
        action.setEffectiveTimeScale(this.speed);
        action.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
        action.paused = false;
        if (this.loop || this.time < this.duration) action.play();
        this.playing = true;
        this.notify();
    }

    pause() {
        const action = this.action;
        if (!action) return;
        action.paused = true;
        this.playing = false;
        this.notify();
    }

    toggle() {
        if (this.playing) this.pause();
        else this.play();
    }

    stop() {
        const action = this.action;
        if (!action) return;
        action.paused = false;
        action.reset();
        this.playing = false;
        this.notify();
    }

    setTime(seconds) {
        const action = this.action;
        if (!action) return;
        const time = THREE.MathUtils.clamp(seconds, 0, this.duration);
        action.paused = true;
        action.time = time;
        this.playing = false;
        this.notify();
    }

    setSpeed(speed) {
        this.speed = THREE.MathUtils.clamp(Number(speed) || 1, 0.1, 4);
        this.action?.setEffectiveTimeScale(this.speed);
        this.notify();
    }

    setLoop(loop) {
        this.loop = Boolean(loop);
        const action = this.action;
        if (action) {
            action.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
            action.clampWhenFinished = !this.loop;
        }
        this.notify();
    }

    update(delta) {
        if (!this.playing) return;
        this.mixer.update(delta);
        if (!this.loop && this.action.time >= this.duration) {
            this.action.paused = true;
            this.playing = false;
            this.notify();
            return;
        }
        this.notifyTime();
    }

    notifyTime() {
        this.onChange?.({ playing: this.playing, time: this.time, duration: this.duration, silent: true });
    }

    notify() {
        this.onChange?.({ playing: this.playing, time: this.time, duration: this.duration, index: this.index });
    }
}
