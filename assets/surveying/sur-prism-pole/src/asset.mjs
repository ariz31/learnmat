const SVG_NS='http://www.w3.org/2000/svg';
const DEFAULTS=Object.freeze({targetHeight:2,poleTiltRad:0,personHeight:1.7});
const LIMITS=Object.freeze({targetHeight:[1,3.5],poleTiltRad:[-0.1745329,0.1745329],personHeight:[1.4,2.1]});

function node(name,attrs={}){const el=document.createElementNS(SVG_NS,name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el}
function validate(name,value){const [min,max]=LIMITS[name];if(!Number.isFinite(value)||value<min||value>max)throw new RangeError(name+' must be finite and between '+min+' and '+max+'.')}
function normalize(next){const merged={...DEFAULTS,...next};for(const key of Object.keys(LIMITS))validate(key,merged[key]);return merged}

export function prismGeometry(parameters={}){
  const p=normalize(parameters);
  return {
    horizontalOffset:p.targetHeight*Math.sin(p.poleTiltRad),
    verticalProjection:p.targetHeight*Math.cos(p.poleTiltRad),
    tiltDeg:p.poleTiltRad*180/Math.PI
  };
}

export function createAsset(context={}){
  const container=context.container;
  if(!container||typeof container.appendChild!=='function')throw new TypeError('createAsset requires a DOM container.');
  let disposed=false,timeSeconds=0,params=normalize({});
  const reducedMotion=Boolean(context.reducedMotion);
  const root=document.createElement('div');
  root.setAttribute('data-learnmat-asset','sur-prism-pole');
  root.style.width='100%';root.style.maxWidth='740px';root.style.fontFamily='system-ui,sans-serif';root.style.color='CanvasText';

  const svg=node('svg',{viewBox:'0 0 720 450',role:'img','aria-label':'Surveyor carrying a prism pole showing target height, plumb reference, and pole tilt'});
  svg.style.width='100%';svg.style.height='auto';svg.style.display='block';
  const ground=node('line',{x1:65,y1:365,x2:655,y2:365,stroke:'currentColor','stroke-width':3});
  const plumb=node('line',{x1:430,y1:365,x2:430,y2:75,stroke:'currentColor','stroke-width':2,'stroke-dasharray':'6 5',opacity:.55});
  const pole=node('g');
  const shaft=node('line',{x1:0,y1:0,x2:0,y2:-240,stroke:'currentColor','stroke-width':8,'stroke-linecap':'round'});
  const prism=node('polygon',{points:'0,-270 28,-240 0,-210 -28,-240',fill:'Canvas',stroke:'currentColor','stroke-width':5,'stroke-linejoin':'round'});
  const prismCrossA=node('line',{x1:-18,y1:-240,x2:18,y2:-240,stroke:'currentColor','stroke-width':2});
  const prismCrossB=node('line',{x1:0,y1:-258,x2:0,y2:-222,stroke:'currentColor','stroke-width':2});
  pole.append(shaft,prism,prismCrossA,prismCrossB);

  const person=node('g');
  person.append(
    node('circle',{cx:-78,cy:-150,r:16,fill:'none',stroke:'currentColor','stroke-width':5}),
    node('line',{x1:-78,y1:-132,x2:-78,y2:-68,stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'}),
    node('line',{x1:-78,y1:-68,x2:-100,y2:0,stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'}),
    node('line',{x1:-78,y1:-68,x2:-55,y2:0,stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'}),
    node('polyline',{points:'-78,-118 -45,-98 0,-116',fill:'none',stroke:'currentColor','stroke-width':6,'stroke-linejoin':'round','stroke-linecap':'round'})
  );

  const heightLine=node('line',{stroke:'currentColor','stroke-width':2});
  const heightText=node('text',{'font-size':16,fill:'currentColor','text-anchor':'end'});
  const heading=node('text',{x:360,y:38,'text-anchor':'middle','font-size':18,fill:'currentColor'});
  const metrics=node('text',{x:360,y:420,'text-anchor':'middle','font-size':16,fill:'currentColor'});
  const baseMark=node('circle',{cx:430,cy:365,r:6,fill:'currentColor'});
  svg.append(ground,plumb,pole,person,heightLine,heightText,baseMark,heading,metrics);
  root.appendChild(svg);container.appendChild(root);

  function ensure(){if(disposed)throw new Error('Asset has been disposed.')}
  function geometry(){return prismGeometry(params)}
  function render(){
    const scale=120/2;
    const poleScale=params.targetHeight/2;
    const angle=params.poleTiltRad*180/Math.PI;
    pole.setAttribute('transform','translate(430 365) rotate('+angle.toFixed(4)+') scale('+poleScale.toFixed(5)+')');
    const breathe=reducedMotion?0:Math.sin(Math.max(0,timeSeconds)*Math.PI/2)*1.5;
    person.setAttribute('transform','translate(430 '+(365+breathe).toFixed(3)+') scale('+(params.personHeight/1.7).toFixed(5)+')');
    const prismY=365-params.targetHeight*scale*2;
    heightLine.setAttribute('x1',328);heightLine.setAttribute('x2',328);heightLine.setAttribute('y1',365);heightLine.setAttribute('y2',prismY);
    heightText.setAttribute('x',316);heightText.setAttribute('y',(365+prismY)/2);heightText.textContent=params.targetHeight.toFixed(2)+' m target height';
    const g=geometry();
    heading.textContent='Prism pole · tilt '+g.tiltDeg.toFixed(2)+'°';
    metrics.textContent='horizontal target offset '+g.horizontalOffset.toFixed(3)+' m · vertical projection '+g.verticalProjection.toFixed(3)+' m';
  }
  function snapshot(){
    ensure();const g=geometry();
    return {id:'sur-prism-pole',timeSeconds:Math.max(0,timeSeconds),parameters:{...params},result:g,pose:{base:{x:0,y:0,z:0},prismCenter:{x:g.horizontalOffset,y:g.verticalProjection,z:0}}};
  }
  render();
  return {
    setParameters(next={}){ensure();params=normalize({...params,...next});render();return snapshot()},
    update(t){ensure();if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');timeSeconds=Math.max(0,t);render();return snapshot()},
    reset(){ensure();params=normalize({});timeSeconds=0;render();return snapshot()},
    resize(width,height,pixelRatio=1){ensure();if(![width,height,pixelRatio].every(Number.isFinite)||width<=0||height<=0||pixelRatio<=0)throw new RangeError('resize requires positive finite values.');root.style.width=width+'px';root.style.maxWidth='100%';root.style.aspectRatio=width+' / '+height;return snapshot()},
    snapshot,
    dispose(){if(disposed)return;disposed=true;root.remove()}
  };
}
