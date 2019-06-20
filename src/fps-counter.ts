export class FPSCounter {
    private display: HTMLElement;
    private frames: number[];
    private lastFrameTimeStamp: number;

    constructor(id: string = "fps-counter") {
        this.display = document.getElementById(id);
        this.frames = [];
        this.lastFrameTimeStamp = performance.now();
    }

    public render() {
        const now = performance.now();
        const delta = now - this.lastFrameTimeStamp;
        this.lastFrameTimeStamp = now;
        const fps = 1 / delta * 1000;

        this.frames.push(fps);
        if (this.frames.length > 100) {
            this.frames.shift();
        }

        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (const frame of this.frames) {
            sum += frame;
            min = Math.min(frame, min);
            max = Math.max(frame, max);
        }
        const mean = sum / this.frames.length;

        this.display.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
    }
}
