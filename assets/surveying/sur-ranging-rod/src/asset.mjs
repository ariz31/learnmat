const SVG_NS='http://www.w3.org/2000/svg';
const DEFAULTS=Object.freeze({sightDistance:30,rodStationDistance:15,crossTrackOffset:0.25,alignmentTolerance:0.05,rodHeight:2});
const LIMITS=Object.freeze({sightDistance:[5,100],rodStationDistance:[1,99],crossTrackOffset:[-2,2],alignmentTolerance:[0.005,0.25],rodHeight:[1.5,3]});

function node(name,attrs={}){const el=document.createElementNS(SVG_NS,name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el}
function validate(name,value){const [min,max]=LIMITS[name];if(!Number.isFinite(value)||value<min||value>max)throw new RangeError(name+' must be finite and between '+min+' and '+max+'.')}
function normalize(next){const merged={...DEFAULTS,...next};for(const key of Object.keys(LIMITS))validate(key,merged[key]);if(merged.rodStationDistance>=merged.sightDistance)throw new RangeError('rodStationDistance must be less than sightDistance.');return merged}

export function alignmentState(parameters={}){
  const p=normalize(parameters);
  const error=Math.abs(p.crossTrackOffset);
  return {crossTrackError:error,aligned:error<=p.alignmentTolerance,signedOffset:p.crossTrackOffset};
}

export function createAsset(context={}){
  const container=context.container;
  if(!container||typeof container.appendChild!=='function')throw new TypeError('createAsset requires a DOM container.');
  let disposed=false,timeSeconds=0,params=normalize({});
  const root=document.createElement('div');
  root.setAttribute('data-learnmat-asset','sur-ranging-rod');
  root.style.width='100%';root.style.maxWidth='800px';root.style.fontFamily='system-ui,sans-serif';root.style.color='CanvasText';

  const svg=node('svg',{viewBox:'0 0 780 470',role:'img','aria-label':'Plan view of a ranging rod relative to a straight survey line, with elevation inset'});
  svg.style.width='100%';svg.style.height='auto';svg.style.display='block';

  const heading=node('text',{x:390,y:36,'text-anchor':'middle','font-size':18,fill:'currentColor'});
  const planBox=node('rect',{x:55,y:60,width:470,height:340,rx:12,fill:'none',stroke:'currentColor','stroke-width':2});
  const sight=node('line',{x1:290,y1:355,x2:290,y2:105,stroke:'currentColor','stroke-width':3,'stroke-dasharray':'9 6'});
  const observer=node('circle',{cx:290,cy:355,r:10,fill:'currentColor'});
  const target=node('polygon',{points:'290,92 280,110 300,110',fill:'currentColor'});
  const rod=node('circle',{r:11,fill:'Canvas',stroke:'currentColor','stroke-width':4});
  const offsetLine=node('line',{stroke:'currentColor','stroke-width':2});
  const offsetText=node('text',{'font-size':15,fill:'currentColor','text-anchor':'middle'});
  const observerText=node('text',{x:290,y:382,'font-size':14,fill:'currentColor','text-anchor':'middle'});
  observerText.textContent='observer';
  const targetText=node('text',{x:290,y:82,'font-size':14,fill:'currentColor','text-anchor':'middle'});
  targetText.textContent='distant target';
  const planLabel=node('text',{x:75,y:88,'font-size':14,fill:'currentColor'});
  planLabel.textContent='PLAN';

  const inset=node('rect',{x:555,y:100,width:170,height:250,rx:12,fill:'none',stroke:'currentColor','stroke-width':2});
  const ground=node('line',{x1:575,y1:305,x2:705,y2:305,stroke:'currentColor','stroke-width':3});
  const rodVertical=node('line',{x1:640,y1:305,x2:640,y2:145,stroke:'currentColor','stroke-width':8,'stroke-linecap':'round'});
  const bands=node('g');
  for(let i=0;i<5;i++)bands.appendChild(node('line',{x1:627,y1:175+i*28,x2:653,y2:175+i*28,stroke:'currentColor','stroke-width':3}));
  const insetLabel=node('text',{x:640,y:128,'font-size':14,fill:'currentColor','text-anchor':'middle'});
  insetLabel.textContent='ELEVATION';
  const heightText=node('text',{x:640,y:335,'font-size':14,fill:'currentColor','text-anchor':'middle'});
  const metrics=node('text',{x:390,y:440,'font-size':16,fill:'currentColor','text-anchor':'middle'});

  svg.append(heading,planBox,sight,observer,target,rod,offsetLine,offsetText,observerText,targetText,planLabel,inset,ground,rodVertical,bands,insetLabel,heightText,metrics);
  root.appendChild(svg);container.appendChild(root);

  function ensure(){if(disposed)throw new Error('Asset has been disposed.')}
  function state(){return alignmentState(params)}
  function render(){
    const topY=105,bottomY=355,usable=bottomY-topY;
    const fraction=params.rodStationDistance/params.sightDistance;
    const rodY=bottomY-usable*fraction;
    const pxPerM=70;
    const rodX=290+params.crossTrackOffset*pxPerM;
    rod.setAttribute('cx',rodX);rod.setAttribute('cy',rodY);
    offsetLine.setAttribute('x1',290);offsetLine.setAttribute('y1',rodY);offsetLine.setAttribute('x2',rodX);offsetLine.setAttribute('y2',rodY);
    offsetText.setAttribute('x',(290+rodX)/2);offsetText.setAttribute('y',rodY-12);
    offsetText.textContent=params.crossTrackOffset.toFixed(3)+' m';
    const s=state();
    heading.textContent=s.aligned?'Rod aligned within tolerance':'Rod outside alignment tolerance';
    metrics.textContent='cross-track error '+s.crossTrackError.toFixed(3)+' m · tolerance '+params.alignmentTolerance.toFixed(3)+' m · station '+params.rodStationDistance.toFixed(1)+' / '+params.sightDistance.toFixed(1)+' m';
    heightText.textContent='rod height '+params.rodHeight.toFixed(2)+' m';
    rodVertical.setAttribute('y2',(305-160*(params.rodHeight/2)).toFixed(2));
  }
  function snapshot(){
    ensure();const s=state();
    return {id:'sur-ranging-rod',timeSeconds:Math.max(0,timeSeconds),parameters:{...params},result:s,pose:{observer:{x:0,y:0,z:0},target:{x:0,y:0,z:-params.sightDistance},rodBase:{x:params.crossTrackOffset,y:0,z:-params.rodStationDistance},rodTop:{x:params.crossTrackOffset,y:params.rodHeight,z:-params.rodStationDistance}}};
  }
  render();
  return {
    setParameters(next={}){ensure();params=normalize({...params,...next});render();return snapshot()},
    update(t){ensure();if(!Number.isFinite(t))throw new TypeError('timeSeconds must be finite.');timeSeconds=Math.max(0,t);return snapshot()},
    reset(){ensure();params=normalize({});timeSeconds=0;render();return snapshot()},
    resize(width,height,pixelRatio=1){ensure();if(![width,height,pixelRatio].every(Number.isFinite)||width<=0||height<=0||pixelRatio<=0)throw new RangeError('resize requires positive finite values.');root.style.width=width+'px';root.style.maxWidth='100%';root.style.aspectRatio=width+' / '+height;return snapshot()},
    snapshot,
    dispose(){if(disposed)return;disposed=true;root.remove()}
  };
}
