/**
 * Antigravity Module
 * Adds physics simulation to DOM elements.
 * Trigger: Click the Logo/Brand 5 times rapidly.
 */

class Antigravity {
    constructor() {
        this.clickCount = 0;
        this.gravity = 0.5;
        this.friction = 0.8; // Bounce energy loss
        this.elements = [];
        this.isActive = false;

        this.setupTrigger();
    }

    setupTrigger() {
        const logo = document.getElementById('brand-logo');
        if (logo) {
            logo.addEventListener('click', () => {
                this.clickCount++;
                if (this.clickCount === 5) {
                    this.activate();
                    this.clickCount = 0;
                }
                // Reset count if too slow
                setTimeout(() => this.clickCount = 0, 2000);
            });
        }
    }

    activate() {
        if (this.isActive) return;
        this.isActive = true;
        console.log("Antigravity Activated!");
        alert("⚠️ ATENCIÓN: Gravedad inestable detectada...");

        // Select heavy elements to drop
        const selectors = [
            '.bg-white', // Cards
            'button',
            'input',
            'h1', 'h2', 'h3',
            'tr'
        ];

        // Flatten and unique
        let targets = [];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (!targets.includes(el) && this.isVisible(el)) {
                    targets.push(el);
                }
            });
        });

        // Initialize physics state for each element
        targets.forEach(el => {
            const rect = el.getBoundingClientRect();
            // We need to set them to fixed/absolute to move them freely
            // But preserving their visual position first is key.
            // Simplified approach: use transform translate.

            el.dataset.vx = (Math.random() - 0.5) * 10; // Random horizontal velocity
            el.dataset.vy = 0;
            el.dataset.x = 0;
            el.dataset.y = 0;
            el.dataset.r = 0; // Rotation
            el.dataset.vr = (Math.random() - 0.5) * 5; // Rotation velocity

            // We'll use style.transform to animate
            el.style.transition = 'none'; // Disable CSS transitions for physics

            this.elements.push(el);
        });

        this.loop();
    }

    isVisible(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    loop() {
        if (!this.isActive) return;

        this.elements.forEach(el => {
            let vx = parseFloat(el.dataset.vx);
            let vy = parseFloat(el.dataset.vy);
            let x = parseFloat(el.dataset.x);
            let y = parseFloat(el.dataset.y);
            let r = parseFloat(el.dataset.r);
            let vr = parseFloat(el.dataset.vr);

            // Apply Gravity
            vy += this.gravity;

            // Update Position
            x += vx;
            y += vy;
            r += vr;

            // Bounds Checking (Floor)
            const rect = el.getBoundingClientRect();
            const bottomPos = rect.top + rect.height; // Current bottom on screen

            // Approximate screen height
            if (rect.bottom >= window.innerHeight) {
                // Bounce
                y = window.innerHeight - rect.top - rect.height + parseFloat(el.dataset.y); // Correct position to exactly floor
                vy *= -this.friction;
                vx *= this.friction; // Ground friction
                vr *= this.friction;

                // Stop small jitters
                if (Math.abs(vy) < this.gravity * 2) vy = 0;
            }

            // Apply
            el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;

            // Save state
            el.dataset.vx = vx;
            el.dataset.vy = vy;
            el.dataset.x = x;
            el.dataset.y = y;
            el.dataset.r = r;
            el.dataset.vr = vr;
        });

        requestAnimationFrame(() => this.loop());
    }
}

// Init
window.antigravity = new Antigravity();
