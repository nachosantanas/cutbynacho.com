export function visibleProjects(projects, role, limit = Infinity) {
  return projects.filter(project => role === 'all' || project.role === role).slice(0, limit);
}

function initProjects() {
  const sections = ['work', 'commercial'].map(id => {
    const section = document.getElementById(id);
    return {section, id, gallery:section.querySelector(id === 'work' ? '.masonry-gallery' : '.work-grid'),
      projects:[...section.querySelectorAll('[data-project-role]')].map(card => ({card, role:card.dataset.projectRole})),
      button:section.querySelector('.show-more-btn'), expanded:false};
  });
  document.documentElement.classList.add('projects-ready');
  let role = 'all', scheduled = false;
  const spanish = () => document.documentElement.lang === 'es';
  const columns = () => innerWidth <= 600 ? 1 : innerWidth <= 1000 ? 2 : 3;

  function layoutMasonry() {
    scheduled = false;
    const gallery = sections[0].gallery;
    for (const card of gallery.children) {
      if (card.hidden) continue;
      card.style.gridRowEnd = `span ${Math.ceil(card.getBoundingClientRect().height + 20)}`;
    }
  }
  function scheduleLayout() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(layoutMasonry); }
  }
  function render() {
    for (const state of sections) {
      const limit = state.expanded ? Infinity : columns() * (state.id === 'work' ? 3 : 2);
      const matching = visibleProjects(state.projects, role);
      const visible = new Set(visibleProjects(state.projects, role, limit));
      for (const project of state.projects) {
        project.card.hidden = !visible.has(project);
        if (project.card.hidden) project.card.querySelectorAll('video').forEach(video => video.pause());
      }
      state.section.querySelector('[data-project-empty]').hidden = matching.length > 0;
      state.gallery.hidden = !matching.length;
      state.section.querySelector('[data-project-count]').textContent = spanish()
        ? `${visible.size} de ${matching.length} proyectos` : `${visible.size} of ${matching.length} projects`;
      state.button.closest('.show-more-wrap').hidden = matching.length <= columns() * (state.id === 'work' ? 3 : 2);
      state.button.setAttribute('aria-expanded', String(state.expanded));
      state.button.classList.toggle('open', state.expanded);
      const label = state.button.querySelector('[data-en]');
      label.dataset.en = state.expanded ? 'Show less' : 'Show more';
      label.dataset.es = state.expanded ? 'Ver menos' : 'Ver más';
      label.textContent = spanish() ? label.dataset.es : label.dataset.en;
    }
    scheduleLayout();
    document.dispatchEvent(new Event('projectschange'));
  }
  document.querySelectorAll('[data-project-filter]').forEach(select => select.addEventListener('change', () => {
    role = select.value;
    document.querySelectorAll('[data-project-filter]').forEach(other => { other.value = role; });
    sections.forEach(state => { state.expanded = false; });
    render();
  }));
  for (const state of sections) state.button.addEventListener('click', () => {
    state.expanded = !state.expanded;
    render();
    if (!state.expanded) state.section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
  });

  const cards = sections[0].projects.map(project => project.card);
  const cardObserver = new ResizeObserver(scheduleLayout);
  cards.forEach(card => {
    cardObserver.observe(card);
    const media = card.querySelector('video,img');
    function updateRatio() {
      const width = media.videoWidth || media.naturalWidth, height = media.videoHeight || media.naturalHeight;
      if (width && height) { media.style.setProperty('--media-ratio', `${width} / ${height}`); scheduleLayout(); }
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
