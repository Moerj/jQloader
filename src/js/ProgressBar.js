export class ProgressBar {
    constructor() {
        this.color = '#58a2d1';
        this.transition = '10s width';
        this.timer = null;
        this.$progress = $('<span></span>');
        this.reset();
        $('html').append(this.$progress);
    }
    reset() {
        this.$progress.css({
            backgroundColor: this.color,
            transition: 'none',
            height: '2px',
            width: 0,
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 9999,
            boxShadow: '1px 1px 2px 0 ' + this.color
        });
    }
    max() {
        return document.body.clientWidth
    }
    setColor(color) {
        if (typeof color === 'string') {
            this.color = color;
        }
    }
    start() {
        this.reset();
        this.$progress.css({
            width: this.max(),
            transition: this.transition
        });
    }
    stop() {
        this.$progress.css({
            width: this.$progress.width()
        });
    }
    finish() {
        this.stop();
        this.$progress.css({
            width: this.max(),
            transition: '0.5s width'
        });
        if (!this.timer) {
            this.timer = setTimeout(() => {
                this.timer = null;
                this.reset();
            }, 700)
        }
    }
    destroy() {
        this.$progress.remove();
        this.$progress = null;
    }
}
