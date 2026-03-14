/* ===========================
   DO NOT STEAL MY CODE @keyzzilla USAGE EXCLUSIVE
   =========================== */

(function () {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href').split('/').pop();
        if (href === path) a.classList.add('active');
    });
})();

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

(function () {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    let mouse = { x: -9999, y: -9999, r: 100 };

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        mouse.r = Math.min(W, H) / 10;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

    class Particle {
        constructor() { this.reset(true); }
        reset(initial) {
            this.x = Math.random() * W;
            this.y = initial ? Math.random() * H : (Math.random() < 0.5 ? -5 : H + 5);
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.r = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.5 + 0.2;
            const hues = ['99,179,237', '183,148,244', '104,211,145'];
            this.color = hues[Math.floor(Math.random() * hues.length)];
        }
        update() {
            const dx = this.x - mouse.x, dy = this.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            const mr = mouse.r;
            if (d2 < mr * mr) {
                const d = Math.sqrt(d2) || 1;
                const force = (mr - d) / mr * 0.5;
                this.vx += (dx / d) * force;
                this.vy += (dy / d) * force;
            }
            this.vx *= 0.99;
            this.vy *= 0.99;
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -10) this.x = W + 10;
            if (this.x > W + 10) this.x = -10;
            if (this.y < -10) this.y = H + 10;
            if (this.y > H + 10) this.y = -10;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
            ctx.fill();
        }
    }

    function init() {
        const count = Math.min(Math.floor((W * H) / 9000), 140);
        particles = Array.from({ length: count }, () => new Particle());
    }
    init();
    window.addEventListener('resize', init);

    const MAX_DIST = 130;
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST;

    function connect() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d2 = dx * dx + dy * dy;
                if (d2 < MAX_DIST_SQ) {
                    const alpha = (1 - d2 / MAX_DIST_SQ) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99,179,237,${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        connect();
        requestAnimationFrame(loop);
    }
    loop();
})();

(function () {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .timeline-item, .feature-card').forEach(el => io.observe(el));
})();

(function () {
    const bars = document.querySelectorAll('.skill-fill');
    if (!bars.length) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.width = e.target.dataset.width;
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    bars.forEach(b => io.observe(b));
})();

(function () {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('.form-submit');
        btn.classList.add('sent');
        btn.innerHTML = '✅ Message Sent!';
        setTimeout(() => {
            btn.classList.remove('sent');
            btn.innerHTML = 'Send Message <span>→</span>';
            form.reset();
        }, 3000);
    });
})();
