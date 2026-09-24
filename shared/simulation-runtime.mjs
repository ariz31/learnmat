const STYLE_ID = 'learnmat-simulation-runtime-layout';

export function installSimulationLayout() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
/*
 * Shared responsive layout safeguards for LearnMat simulations.
 * These rules reserve real canvas space around educational controls instead of
 * rendering important geometry beneath overlays. They intentionally apply only
 * to recognizable LearnMat simulation shells.
 */
#threeHost canvas,
#view canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}

@media (max-width: 820px) {
  /* Building/material shells: keep header tools and the bottom note outside the
     active 3D viewport. */
  .shell > .stage #threeHost {
    top: 78px !important;
    bottom: 54px !important;
  }
  .shell > .stage .hud {
    max-width: calc(100% - 164px);
  }
  .shell > .stage .hud-card span {
    max-width: 34ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Hydraulic/geotechnical teaching plates: the step strip, lesson, and metric
     rail previously covered the scene. Give the renderer an unobstructed band. */
  .stage:has(> .steps):has(> .lesson) #threeHost {
    top: 142px !important;
    bottom: 220px !important;
  }
  .stage:has(> .steps):has(> .lesson) .head {
    right: 12px;
  }
  .stage:has(> .steps):has(> .lesson) .tools {
    top: 58px !important;
    left: 12px !important;
    right: 12px !important;
    justify-content: flex-end;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .stage:has(> .steps):has(> .lesson) .tools::-webkit-scrollbar {
    display: none;
  }
  .stage:has(> .steps):has(> .lesson) .steps {
    top: 102px !important;
    left: 12px !important;
    right: 12px !important;
    max-width: none !important;
    flex-wrap: nowrap !important;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  /* Surveying figure cards: controls live at the bottom on narrow screens.
     Reserve that footprint so people, staffs, poles, and sight lines are not
     hidden behind the controls. */
  #stage:has(> .panel) #view,
  #stage:has(> .card) #view {
    bottom: 258px !important;
  }
  #stage:has(> .panel) > .panel,
  #stage:has(> .card) > .card {
    max-height: 242px;
    overflow: auto;
    overscroll-behavior: contain;
  }
  #stage:has(> .panel) > .metric,
  #stage:has(> .card) > .metric,
  #stage:has(> .panel) > .metrics,
  #stage:has(> .card) > .metrics {
    bottom: 258px !important;
  }

  /* Structural figures used fixed top/bottom offsets that left too little
     room for the model in embedded viewers. Keep the rail scrollable while
     preserving a materially larger 3D viewport. */
  .stage:has(> .right-rail) #threeHost {
    top: 128px !important;
    bottom: 202px !important;
  }
  .stage:has(> .right-rail) .right-rail {
    height: 178px !important;
    overflow: auto;
    overscroll-behavior: contain;
  }
}

@media (max-width: 600px) {
  .shell > .stage #threeHost {
    top: 72px !important;
    bottom: 48px !important;
  }
  .shell > .stage .hud-card span,
  .shell > .stage .metrics {
    display: none;
  }

  .stage:has(> .steps):has(> .lesson) #threeHost {
    top: 136px !important;
    bottom: 206px !important;
  }
  .stage:has(> .steps):has(> .lesson) .lesson {
    max-height: 96px !important;
  }

  #stage:has(> .panel) #view,
  #stage:has(> .card) #view {
    bottom: 244px !important;
  }
  #stage:has(> .panel) > .panel,
  #stage:has(> .card) > .card {
    max-height: 230px;
  }
  #stage:has(> .panel) > .metric,
  #stage:has(> .card) > .metric,
  #stage:has(> .panel) > .metrics,
  #stage:has(> .card) > .metrics {
    bottom: 244px !important;
  }

  .stage:has(> .right-rail) #threeHost {
    top: 112px !important;
    bottom: 194px !important;
  }
  .stage:has(> .right-rail) .right-rail {
    height: 170px !important;
  }
}

/* Focus mode must always give the renderer the full available stage. */
.app.focus .stage #threeHost,
.stage.focus #threeHost,
#stage.focus #view,
.stage.focused #threeHost,
.stage.info-hidden #threeHost {
  inset: 0 !important;
}

/* Make camera/action controls usable without allowing a long row to escape the
   simulation boundary. */
.tools,
.toolbar,
.row {
  max-width: 100%;
}
.tools button,
.toolbar button,
.row button {
  flex: 0 0 auto;
}
`;

  document.head.appendChild(style);
}
