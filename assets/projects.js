export function visibleProjects(projects, role, limit = Infinity) {
  return projects.filter(project => role === 'all' || project.role === role).slice(0, limit);
}

// Balance every row, including the last, without changing project order.
export function justifiedRows(ratios, width, gap = 20, target = 300, minWidth = 150) {
  const costs = Array(ratios.length + 1).fill(Infinity), ends = [];
  costs[ratios.length] = 0;
  for (let start = ratios.length - 1; start >= 0; start--) {
    let sum = 0;
    for (let end = start; end < Math.min(ratios.length, start + 8); end++) {
      sum += ratios[end];
      const height = (width - gap * (end - start)) / sum;
      if (height <= 0) break;
      if (end > start && Math.min(...ratios.slice(start, end + 1)) * height < minWidth) continue;
      const cost = (height - target) ** 2 + costs[end + 1];
      if (cost < costs[start]) { costs[start] = cost; ends[start] = end + 1; }
    }
  }
  const rows = [];
  for (let start = 0; start < ratios.length;) {
    const end = ends[start];
    const height = (width - gap * (end - start - 1)) / ratios.slice(start, end).reduce((a,b) => a+b, 0);
    rows.push({start, end, height});
    start = end;
  }
  return rows;
}

function initProjects() {
  const sections = ['work', 'commercial'].map(id => {
    const section = document.getElementById(id);
    return {section, id, gallery:section.querySelector(id === 'work' ? '.masonry-gallery' : '.work-grid'),
      projects:[...section.querySelectorAll('[data-project-role]')].map(card => ({card, role:card.dataset.projectRole})),
      button:section.querySelector('.show-more-btn'), expanded:false, role:'all'};
  });
  document.documentElement.classList.add('projects-ready');
  const spanish = () => document.documentElement.lang === 'es';
  function ratio(project) {
    if (project.card.classList.contains('featured-item')) return 16 / 9;
    const media = project.card.querySelector('video,img');
    const raw = media.style.getPropertyValue('--media-ratio').split('/').map(Number);
    return raw.length === 2 && raw[0] > 0 && raw[1] > 0 ? raw[0] / raw[1] : 9 / 16;
  }
  function render() {
    for (const state of sections) {
      const matching = visibleProjects(state.projects, state.role);
      state.gallery.hidden = !matching.length;
      const width = Math.max(1, state.gallery.clientWidth);
      const gap = innerWidth <= 600 ? 12 : 20;
      const ratios = matching.map(ratio);
      const rows = innerWidth <= 600
        ? ratios.map((r,i) => ({start:i,end:i+1,height:width/r}))
        : justifiedRows(ratios, width, gap, innerWidth <= 1000 ? 260 : 300);
      const limit = rows[Math.min(state.id === 'work' ? 3 : 2, rows.length) - 1]?.end || 0;
      state.gallery.style.gap = `${gap}px`;
      for (const row of rows) for (let i = row.start; i < row.end; i++) {
        matching[i].card.style.width = `${ratios[i] * row.height}px`;
        matching[i].card.style.height = `${row.height}px`;
      }
      const visible = new Set(matching.slice(0, state.expanded ? Infinity : limit));
      for (const project of state.projects) {
        project.card.hidden = !visible.has(project);
        if (project.card.hidden) project.card.querySelectorAll('video').forEach(video => video.pause());
      }
      state.section.querySelector('[data-project-empty]').hidden = matching.length > 0;
      state.gallery.hidden = !matching.length;
      state.section.querySelector('[data-project-count]').textContent = spanish()
        ? `${visible.size} de ${matching.length} proyectos` : `${visible.size} of ${matching.length} projects`;
      state.button.closest('.show-more-wrap').hidden = matching.length <= limit;
      state.button.setAttribute('aria-expanded', String(state.expanded));
      state.button.classList.toggle('open', state.expanded);
      const label = state.button.querySelector('[data-en]');
      const remaining = matching.length - visible.size;
      label.dataset.en = state.expanded ? 'Show less' : `Show ${remaining} more projects`;
      label.dataset.es = state.expanded ? 'Ver menos' : `Ver ${remaining} proyectos más`;
      label.textContent = spanish() ? label.dataset.es : label.dataset.en;
    }
    document.dispatchEvent(new Event('projectschange'));
  }
  for (const state of sections) state.section.querySelector('[data-project-filter]').addEventListener('change', event => {
    state.role = event.target.value;
    state.expanded = false;
    render();
  });
  for (const state of sections) state.button.addEventListener('click', () => {
    state.expanded = !state.expanded;
    render();
    if (!state.expanded) state.section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
  });

  const cards = sections[0].projects.map(project => project.card);
  cards.forEach(card => {
    const media = card.querySelector('video,img');
    function updateRatio() {
      const width = media.videoWidth || media.naturalWidth, height = media.videoHeight || media.naturalHeight;
      if (width && height) { media.style.setProperty('--media-ratio', `${width} / ${height}`); render(); }
    }
    media.addEventListener('loadedmetadata', updateRatio);
    media.addEventListener('load', updateRatio);
    updateRatio();
  });
  window.addEventListener('resize', render, {passive:true});
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
}
if (typeof document !== 'undefined') initProjects();
