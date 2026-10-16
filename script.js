/* ==========================================================================
   Transvictor — animação da rota Brasil → Estados Unidos
   Ciclo de 8s: 1) Brasil acende  2) rota é desenhada  3) pulso nos EUA
                4) rota permanece acesa e esmaece  → reinicia
   Sem dependências. Respeita prefers-reduced-motion e pausa fora da tela.
   ========================================================================== */
(() => {
  const svg = document.querySelector('.route');
  if (!svg) return;

  const track = svg.querySelector('#routeTrack');
  const lines = svg.querySelectorAll('[data-route]');
  const arrow = svg.querySelector('[data-arrow]');
  const head = svg.querySelector('[data-head]');
  const brGlow = svg.querySelector('[data-marker-br] .marker__glow');
  const usGlow = svg.querySelector('[data-marker-us] .marker__glow');
  const pulse = svg.querySelector('[data-pulse]');

  // Orienta a seta pela tangente final da rota (sempre apontando para os EUA)
  const len = track.getTotalLength();
  const end = track.getPointAtLength(len);
  const prev = track.getPointAtLength(len - 8);
  const angle = Math.atan2(end.y - prev.y, end.x - prev.x) * 180 / Math.PI;
  arrow.setAttribute('transform', `translate(${end.x.toFixed(1)} ${end.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return; // rota estática (estado padrão do CSS)

  // ---- Linha do tempo (ms) ----
  const CYCLE = 8000;
  const T_ORIGIN = 900;   // Brasil acende
  const T_DRAW = 3400;    // duração do traçado
  const T_ARRIVE = T_ORIGIN + T_DRAW;
  const T_PULSE = 1400;   // pulso no destino
  const T_FADE = 6700;    // início do esmaecimento
  const MIN = 0.12;       // intensidade residual da rota no fim do ciclo

  const clamp = v => Math.min(1, Math.max(0, v));
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  svg.classList.add('is-animated');

  let start = null, raf = 0, running = false;

  function frame(now) {
    if (start === null) start = now;
    const t = (now - start) % CYCLE;

    // 1) Origem
    const origin = easeOut(clamp(t / T_ORIGIN));
    // 2) Deslocamento
    const draw = easeInOut(clamp((t - T_ORIGIN) / T_DRAW));
    // 3) Chegada
    const arrived = clamp((t - T_ARRIVE) / 450);
    const p = clamp((t - T_ARRIVE) / T_PULSE);
    // 4) Esmaecimento
    const fade = 1 - (1 - MIN) * easeInOut(clamp((t - T_FADE) / (CYCLE - T_FADE)));

    for (const l of lines) {
      l.style.strokeDashoffset = 1 - draw;
      l.style.opacity = fade;
    }

    brGlow.style.opacity = (0.35 + 0.65 * origin) * (0.55 + 0.45 * fade);

    // Cabeça luminosa: visível apenas durante o traçado
    const drawing = t > T_ORIGIN && t < T_ARRIVE + 200;
    if (drawing) {
      const pt = track.getPointAtLength(len * draw);
      head.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      head.setAttribute('opacity', (Math.min(1, draw * 8) * (1 - arrived)).toFixed(2));
    } else {
      head.setAttribute('opacity', '0');
    }

    arrow.style.opacity = arrived * fade;
    usGlow.style.opacity = (0.3 + 0.7 * arrived) * fade;

    // Pulso discreto ao chegar
    if (t >= T_ARRIVE && p < 1) {
      pulse.setAttribute('r', (11 + 30 * easeOut(p)).toFixed(1));
      pulse.style.opacity = (0.85 * (1 - p)).toFixed(2);
    } else {
      pulse.style.opacity = 0;
    }

    raf = requestAnimationFrame(frame);
  }

  const play = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  // Só anima quando o globo está visível na tela
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop())).observe(svg);
  } else {
    play();
  }

  // Se o usuário ativar "reduzir movimento" com a página aberta
  reduce.addEventListener?.('change', e => {
    if (!e.matches) return;
    stop();
    svg.classList.remove('is-animated');
    [...lines, arrow, brGlow, usGlow, pulse].forEach(el => el.removeAttribute('style'));
    head.setAttribute('opacity', '0');
  });
})();
