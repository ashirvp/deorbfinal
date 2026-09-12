(() => {
  'use strict';
  const story = document.getElementById('story');
  const chapters = [...document.querySelectorAll('[data-step]')];
  const nav = [...document.querySelectorAll('[data-nav]')];
  const policy = document.getElementById('policy');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactLayout = window.matchMedia('(max-width: 900px)');
  const captions = [
    'Airports, public spaces, energy sites and ports share the same sky.',
    'Complementary passive observations feed the same network. Zones are schematic, not emissions.',
    'DE ORB OS turns multiple observations into an assessed track for the operator.',
    'The operator and competent authorities determine what happens next.',
    'A reliable track supports proportionate action. The response depends on legal authority.'
  ];
  const layers = ['00 / THE SETTING', '01 / PASSIVE SENSING', '02 / SENSOR FUSION', '03 / AUTHORITY DECISION', '04 / AUTHORISED RESPONSE'];
  const responses = {
    monitor: {
      category: 'NON-ENGAGEMENT RESPONSE',
      title: 'Protect people and operations',
      description: "Notify the competent authority, continue monitoring and apply the site's protective procedures. A physical intervention is not a prerequisite for useful detection.",
      constraint: "Subject to the site's approved procedures.",
      sceneTitle: 'Protective procedures',
      sceneType: 'Notify · monitor · protect',
      caption: 'Detection supports protective action even when no physical intervention is authorised.'
    },
    interceptor: {
      category: 'PARTNER INTERCEPTION',
      title: 'An interceptor drone',
      description: 'A partner aircraft may intercept or capture a drone using an approved approach. DE ORB would supply track information; the partner supplies the interception capability.',
      constraint: 'Requires competent authority, aviation coordination and an approved safety case.',
      sceneTitle: 'Interceptor drone',
      sceneType: 'Potential partner capability',
      caption: 'Potential integration: DE ORB provides track information; an authorised partner provides interception.'
    },
    kinetic: {
      category: 'KINETIC RESPONSE',
      title: 'A physical countermeasure',
      description: 'A legally empowered actor may use an approved physical effector. DE ORB provides situational awareness; the effector and its operation remain the partner’s responsibility.',
      constraint: 'Civilian exposure and debris risk must be assessed. Availability depends on national law.',
      sceneTitle: 'Kinetic effector',
      sceneType: 'Potential partner capability',
      caption: 'Potential integration: physical countermeasures remain conditional on authority and civilian safety.'
    },
    laser: {
      category: 'DIRECTED-ENERGY RESPONSE',
      title: 'A laser effector',
      description: 'A partner laser system is one possible directed-energy option. Detection and tracking can inform the authorised response; DE ORB does not claim a deployed laser capability here.',
      constraint: 'Specific authorisation and a safety assessment for people and aviation are required.',
      sceneTitle: 'Laser effector',
      sceneType: 'Directed energy · partner option',
      caption: 'Potential integration: a laser is a directed-energy response, subject to specific authority and safety requirements.'
    },
    microwave: {
      category: 'DIRECTED-ENERGY RESPONSE',
      title: 'A high-power microwave system',
      description: 'A partner microwave system is another possible directed-energy option. It belongs to the conditional response layer, separate from the passive DE ORB sensing configuration.',
      constraint: 'Specific powers and spectrum, interference and civilian-safety assessments are required.',
      sceneTitle: 'Microwave system',
      sceneType: 'Directed energy · partner option',
      caption: 'Potential integration: microwave effectors require specific powers and assessment of effects on the surrounding environment.'
    }
  };
  let activeStage = -2;
  let activeOption = 'monitor';
  let scheduled = false;
  const caption = document.getElementById('scene-caption');
  function setStage(stage) {
    if (stage === activeStage) return;
    activeStage = stage;
    story.dataset.stage = String(stage);
    const isNode = stage === -1;
    caption.textContent = isNode ? 'Four complementary sensing inputs, brought together at the site.' : stage === 4 ? responses[activeOption].caption : captions[stage];
    document.getElementById('scene-layer').textContent = isNode ? 'THE NODE / START HERE' : layers[stage];
    document.getElementById('scene-heading').textContent = isNode ? 'THE HARDWARE AT EACH SITE' : 'EUROPEAN CIVILIAN AIRSPACE';
    document.getElementById('scene-footnote').textContent = isNode ? 'Illustrative node design' : 'Fictional district · schematic coverage · not to scale';
    document.getElementById('node-figure').setAttribute('aria-hidden', String(!isNode));
    nav.forEach(link => {
      if (Number(link.dataset.nav) === stage) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }
  function updateScene() {
    scheduled = false;
    const scene = document.querySelector('.scene-shell');
    const marker = compactLayout.matches
      ? scene.getBoundingClientRect().bottom + 105
      : window.innerHeight * .46;
    let current = -1;
    chapters.forEach(chapter => {
      if (chapter.getBoundingClientRect().top <= marker) current = Number(chapter.dataset.step);
    });
    setStage(current);
    document.body.classList.toggle('at-policy', policy.getBoundingClientRect().top < window.innerHeight * .72);
  }
  function queueUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateScene);
  }
  window.addEventListener('scroll', queueUpdate, {passive:true});
  window.addEventListener('resize', queueUpdate);
  window.addEventListener('load', queueUpdate);
  compactLayout.addEventListener('change', queueUpdate);

  const tabs = [...document.querySelectorAll('[data-option]')];
  function chooseResponse(key, focus = false) {
    const selected = responses[key];
    if (!selected) return;
    activeOption = key;
    story.dataset.response = key;
    tabs.forEach(tab => {
      const isSelected = tab.dataset.option === key;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      if (isSelected && focus) tab.focus();
    });
    document.getElementById('response-category').textContent = selected.category;
    document.getElementById('response-title').textContent = selected.title;
    document.getElementById('response-description').textContent = selected.description;
    document.getElementById('response-constraint').textContent = selected.constraint;
    document.getElementById('response-detail').setAttribute('aria-labelledby', 'option-' + key);
    document.getElementById('partner-title').textContent = selected.sceneTitle;
    document.getElementById('partner-type').textContent = selected.sceneType;
    if (activeStage === 4) caption.textContent = selected.caption;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => chooseResponse(tab.dataset.option));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        chooseResponse(tabs[next].dataset.option, true);
      }
    });
  });
  const motionButton = document.getElementById('motion-control');
  let paused = reducedMotion.matches;
  function updateMotion() {
    motionButton.disabled = reducedMotion.matches;
    document.body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', reducedMotion.matches ? 'Animation disabled by your motion preference' : paused ? 'Resume ambient animation' : 'Pause ambient animation');
    motionButton.replaceChildren(document.createTextNode(paused ? '▷ ' : 'Ⅱ '));
    const label = document.createElement('span');
    label.textContent = 'Motion';
    motionButton.appendChild(label);
  }
  motionButton.addEventListener('click', () => {paused = !paused; updateMotion();});
  reducedMotion.addEventListener('change', () => {paused = reducedMotion.matches; updateMotion();});
  chooseResponse('monitor');
  updateMotion();
  updateScene();
})();
