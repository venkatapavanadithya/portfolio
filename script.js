function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// Colorful, cursor-following background animation
;(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = 0;
  let h = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', () => {
    // reset transform and resize
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    resize();
    // recreate blobs responsively on resize
    createBlobs();
  }, { passive: true });
  resize();

  // blobs state (will be created responsively)
  let blobs = [];

  function getDesiredBlobCount() {
    const width = window.innerWidth;
    if (width < 420) return 0; // disable on very small devices for performance
    if (width < 600) return 3;
    if (width < 900) return 5;
    return 7;
  }

  // utility: random between
  const rand = (a,b) => a + Math.random() * (b-a);

  // create initial blobs with random colors
  // stronger, more saturated palette (r,g,b)
  const palette = [
    '255,56,129', // vivid pink
    '54,120,255', // vivid blue
    '255,175,40', // warm orange
    '36,200,170', // bright teal
    '160,90,255', // vivid purple
    '255,95,140', // rose
    '90,210,255'  // light cyan
  ];

  function createBlobs() {
    const count = getDesiredBlobCount();
    blobs = [];
    for (let i = 0; i < count; i++) {
      const rMin = window.innerWidth < 900 ? 100 : 160;
      const rMax = window.innerWidth < 900 ? 220 : 360;
      blobs.push({
        x: w/2 + rand(-250,250),
        y: h/2 + rand(-250,250),
        tx: w/2,
        ty: h/2,
        r: rand(rMin, rMax), // responsive radii
        color: palette[i % palette.length],
        alpha: rand(0.12, 0.28), // higher alpha for stronger colors
        vx: 0,
        vy: 0,
        phase: Math.random()*Math.PI*2,
      });
    }
  }
  createBlobs();

  // pointer tracking
  const pointer = {x: window.innerWidth/2, y: window.innerHeight/2, down:false};
  window.addEventListener('mousemove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    // set target positions for blobs with offsets
    if (blobs.length === 0) return;
    blobs.forEach((b, idx) => {
      const spread = 40 + idx * 30;
      b.tx = pointer.x + Math.cos(idx + performance.now()*0.002) * spread;
      b.ty = pointer.y + Math.sin(idx + performance.now()*0.002) * spread;
    });
  }, { passive: true });

  // animate
  let last = performance.now();
  function draw(now) {
    const dt = Math.min(40, now - last);
    last = now;

    // soft clear with low alpha to create trails
    ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.save();
  // use 'screen' for brighter additive-like blending
  ctx.globalCompositeOperation = 'screen';

    blobs.forEach((b, idx) => {
      // spring toward target
      const k = 0.08 + idx*0.005;
      b.vx += (b.tx - b.x) * k;
      b.vy += (b.ty - b.y) * k;
      // damping
      b.vx *= 0.85;
      b.vy *= 0.85;
      b.x += b.vx * (dt/16);
      b.y += b.vy * (dt/16);

      // slight radius pulsing
      const pulse = 1 + Math.sin(now*0.002 + b.phase) * 0.08;
      const radius = b.r * pulse;

      // radial gradient
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
      grad.addColorStop(0, `rgba(${b.color}, ${b.alpha})`);
      grad.addColorStop(0.4, `rgba(${b.color}, ${b.alpha*0.6})`);
      grad.addColorStop(1, `rgba(${b.color}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, radius, 0, Math.PI*2);
      ctx.fill();
    });

    ctx.restore();
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // Ensure canvas is resized and scaled correctly on load
  window.addEventListener('load', resize, { once: true });

})();

// Rotating role text (Frontend Developer, Python Developer, Web Developer...)
(function () {
  const el = document.querySelector('.section__text__p2');
  if (!el) return;
  const roles = ['Web Developer', 'Python Developer', 'Data Analyst'];
  let idx = 0;

  // wrap current text in fade span
  const span = document.createElement('span');
  span.className = 'role-fade role-visible';
  span.textContent = roles[idx];
  el.textContent = '';
  el.appendChild(span);

  setInterval(() => {
    // fade out
    span.classList.remove('role-visible');
    span.classList.add('role-hidden');
    setTimeout(() => {
      idx = (idx + 1) % roles.length;
      span.textContent = roles[idx];
      // fade in
      span.classList.remove('role-hidden');
      span.classList.add('role-visible');
    }, 450);
  }, 2500);
})();
