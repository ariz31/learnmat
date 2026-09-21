import { DEFAULT_BEAM_PARAMETERS, beamResponseAt, solveBeam, validateBeamParameters } from './model.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(name, attrs = {}, text = '') {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}

export function createAsset(context) {
  if (!context || !(context.container instanceof Element)) throw new TypeError('context.container must be a DOM Element');
  let disposed = false;
  let parameters = { ...DEFAULT_BEAM_PARAMETERS };
  let timeSeconds = 0;
  let viewport = { width: 760, height: 500, pixelRatio: 1 };

  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = ':host{display:block}.card{font:13px/1.35 system-ui,sans-serif;color:#111827;background:#fff;border:1px solid #d1d5db;border-radius:12px;padding:10px}svg{display:block;width:100%;height:auto}.summary{margin:.5rem 0 0;white-space:normal}';
  const card = document.createElement('div');
  card.className = 'card';
  const svg = svgEl('svg', { viewBox: '0 0 760 500', role: 'img', 'aria-label': 'Simply supported beam load, shear, moment, and deflection diagrams' });
  const summary = document.createElement('p');
  summary.className = 'summary';
  shadow.append(style, card);
  card.append(svg, summary);
  context.container.append(host);

  function line(x1, y1, x2, y2, attrs = {}) {
    svg.append(svgEl('line', { x1, y1, x2, y2, stroke: 'currentColor', 'stroke-width': 2.5, ...attrs }));
  }
  function text(x, y, value, anchor = 'start', size = 13, weight = 500) {
    svg.append(svgEl('text', { x, y, 'text-anchor': anchor, 'font-size': size, 'font-family': 'system-ui,sans-serif', 'font-weight': weight, fill: 'currentColor' }, value));
  }
  function poly(points, attrs = {}) {
    svg.append(svgEl('polyline', { points: points.map(p => p.join(',')).join(' '), fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5, 'stroke-linejoin': 'round', ...attrs }));
  }
  function arrowDown(x, y1, y2) {
    line(x, y1, x, y2, { 'stroke-width': 3 });
    svg.append(svgEl('polygon', { points: (x-8)+','+(y2-12)+' '+(x+8)+','+(y2-12)+' '+x+','+y2, fill: 'currentColor' }));
  }
  function draw() {
    svg.replaceChildren();
    const solved = solveBeam(parameters);
    const p = solved.parameters;
    const L = p.spanM, P = p.loadN;
    const reaction = solved.reactionsN.left;
    const maxMoment = solved.maxMomentNm;
    const maxDeflection = solved.maxDeflectionM;
    const left = 80, right = 690, beamY = 82, width = right - left;
    const xPix = x => left + width * x / L;

    text(380, 28, 'Simply supported beam — centered point load', 'middle', 20, 750);
    line(left, beamY, right, beamY, { 'stroke-width': 7 });
    svg.append(svgEl('polygon', { points: left+','+(beamY+2)+' '+(left-20)+','+(beamY+38)+' '+(left+20)+','+(beamY+38), fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5 }));
    svg.append(svgEl('polygon', { points: right+','+(beamY+2)+' '+(right-20)+','+(beamY+34)+' '+(right+20)+','+(beamY+34), fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5 }));
    svg.append(svgEl('circle', { cx:right-10, cy:beamY+43, r:6, fill:'none', stroke:'currentColor', 'stroke-width':2 }));
    svg.append(svgEl('circle', { cx:right+10, cy:beamY+43, r:6, fill:'none', stroke:'currentColor', 'stroke-width':2 }));
    arrowDown(xPix(L/2), 38, beamY-5);
    text(xPix(L/2)+12, 50, (P/1000).toFixed(2)+' kN', 'start', 12, 700);
    text(left, 137, 'RA '+(reaction/1000).toFixed(2)+' kN', 'middle', 12, 650);
    text(right, 137, 'RB '+(reaction/1000).toFixed(2)+' kN', 'middle', 12, 650);
    text(380, 137, 'L = '+L.toFixed(2)+' m', 'middle', 12, 650);

    const panels = [
      { name:'Shear V', y:190, value:r=>r.shearN, max:Math.max(Math.abs(reaction),1), unit:'kN', scale:1e-3 },
      { name:'Moment M', y:300, value:r=>r.momentNm, max:Math.max(Math.abs(maxMoment),1), unit:'kN·m', scale:1e-3 },
      { name:'Deflection v', y:420, value:r=>r.deflectionM, max:Math.max(Math.abs(maxDeflection),1e-12), unit:'mm', scale:1e3 }
    ];
    for (const panel of panels) {
      text(28, panel.y-42, panel.name, 'start', 13, 750);
      line(left, panel.y, right, panel.y, { 'stroke-width': 1.2, 'stroke-dasharray':'5 4' });
      const pts=[];
      for (let i=0;i<=80;i++) {
        const x=L*i/80;
        const r=beamResponseAt(x,p);
        const value=panel.value(r);
        const visual=panel.name.startsWith('Deflection') ? -value : value;
        pts.push([xPix(x), panel.y - 42 * visual / panel.max]);
      }
      poly(pts);
      if (panel.name.startsWith('Shear') && P > 0) line(xPix(L/2), panel.y-42, xPix(L/2), panel.y+42, { 'stroke-width':2.5 });
      let labelValue;
      if (panel.name.startsWith('Shear')) labelValue=reaction*panel.scale;
      else if (panel.name.startsWith('Moment')) labelValue=maxMoment*panel.scale;
      else labelValue=Math.abs(maxDeflection)*panel.scale;
      text(right, panel.y-48, (panel.name.startsWith('Deflection')?'max |v| ':'max ')+labelValue.toFixed(panel.name.startsWith('Deflection')?3:2)+' '+panel.unit, 'end', 12, 650);
    }

    text(380, 486, 'Deflection curve is visually exaggerated; numerical values remain physical SI results.', 'middle', 11, 550);
    summary.textContent = 'Reactions: ' + (reaction/1000).toFixed(3) + ' kN each · Mmax: ' + (maxMoment/1000).toFixed(3) + ' kN·m · downward |vmax|: ' + (Math.abs(maxDeflection)*1000).toFixed(3) + ' mm.';
    svg.setAttribute('aria-label', 'Simply supported beam with centered load ' + (P/1000).toFixed(2) + ' kilonewtons over ' + L.toFixed(2) + ' metres. Reactions are ' + (reaction/1000).toFixed(2) + ' kilonewtons each, maximum moment ' + (maxMoment/1000).toFixed(2) + ' kilonewton metres, and maximum downward deflection ' + (Math.abs(maxDeflection)*1000).toFixed(3) + ' millimetres.');
  }

  draw();

  return {
    setParameters(next = {}) {
      if (disposed) throw new Error('Asset is disposed');
      parameters = validateBeamParameters(next, parameters);
      draw();
    },
    update(nextTimeSeconds) {
      if (disposed) throw new Error('Asset is disposed');
      if (!Number.isFinite(nextTimeSeconds) || nextTimeSeconds < 0) throw new RangeError('timeSeconds must be finite and nonnegative');
      timeSeconds = nextTimeSeconds;
    },
    reset() {
      if (disposed) throw new Error('Asset is disposed');
      parameters = { ...DEFAULT_BEAM_PARAMETERS };
      timeSeconds = 0;
      draw();
    },
    resize(width, height, pixelRatio = 1) {
      if (disposed) throw new Error('Asset is disposed');
      for (const value of [width, height, pixelRatio]) if (!Number.isFinite(value) || value <= 0) throw new RangeError('resize values must be finite and positive');
      viewport = { width, height, pixelRatio };
      host.style.width = width + 'px';
      host.style.maxWidth = '100%';
    },
    snapshot() {
      return { ...solveBeam(parameters), timeSeconds, viewport: { ...viewport } };
    },
    dispose() {
      if (disposed) return;
      disposed=true;
      host.remove();
    }
  };
}
