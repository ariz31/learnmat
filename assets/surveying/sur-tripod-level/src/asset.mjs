const SVG_NS='http://www.w3.org/2000/svg';
const PI=Math.PI;
const DEFAULTS=Object.freeze({instrumentHeight:1.5,legSpread:0.8,sightAzimuthRad:0,sightElevationRad:0});
const LIMITS=Object.freeze({instrumentHeight:[1,2.2],legSpread:[0.4,1.2],sightAzimuthRad:[-PI,PI],sightElevationRad:[-0.0872665,0.0872665]});

function node(name,attrs={}){const el=document.createElementNS(SVG_NS,name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el}
function validate(name,value){const [min,max]=LIMITS[name];if(!Number.isFinite(value)||value<min||value>max)throw new RangeError(name+' must be finite and between '+min+' and '+max+'.')}
function normalize(next){const merged={...DEFAULTS,...next};for(const key of Object.keys(LIMITS))validate(key,merged[key]);return merged}

export function createAsset(context={}){
  const container=context.container;
  if(!container||typeof container.appendChild!=='function')throw new TypeError('createAsset requires a DOM container.');
  let disposed=false,timeSeconds=0,params=normalize({});
  const root=document.createElement('div');
  root.setAttribute('data-learnmat-asset','sur-tripod-level');
  root.style.width='100%';root.style.maxWidth='780px';root.style.fontFamily='system-ui,sans-serif';root.style.color='CanvasText';
  const svg=node('svg',{viewBox:'0 0 760 460',role:'img','aria-label':'Surveying tripod and level showing instrument height, sight-axis elevation, and plan azimuth'});
  svg.style.width='100%';svg.style.height='auto';svg.style.display='block';

  const ground=node('line',{x1:55,y1:350,x2:500,y2:350,stroke:'currentColor','stroke-width':3});
  const legLeft=node('line',{stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'});
  const legRight=node('line',{stroke:'currentColor','stroke-width':7,'stroke-linecap':'round'});
  const legRear=node('line',{stroke:'currentColor','stroke-width':5,'stroke-linecap':'round','stroke-dasharray':'7 5'});
  const head=node('circle',{r:10,fill:'Canvas',stroke:'currentColor','stroke-width':4});
  const instrument=node('g');
  const body=node('rect',{x:-58,y:-17,width:116,height:34,rx:9,fill:'Canvas',stroke:'currentColor','stroke-width':4});
  const telescope=node('line',{x1:-76,y1:0,x2:92,y2:0,stroke:'currentColor','stroke-width':9,'stroke-linecap':'round'});
  const sight=node('line',{x1:0,y1:0,x2:235,y2:0,stroke:'currentColor','stroke-width':3,'stroke-dasharray':'9 6'});
  instrument.append(body,telescope,sight);

  const heightLine=node('line',{stroke:'currentColor','stroke-width':2,'stroke-dasharray':'5 4'});
  const heightText=node('text',{'font-size':16,fill:'currentColor','text-anchor':'middle'});
  const status=node('text',{x:278,y:42,'font-size':18,fill:'currentColor','text-anchor':'middle'});
  const viewLabel=node('text',{x:278,y:435,'font-size':15,fill:'currentColor','text-anchor':'middle'});
  viewLabel.textContent='Elevation view — azimuth direction is shown in the plan inset';

  const planBox=node('rect',{x:535,y:70,width:185,height:185,rx:12,fill:'none',stroke:'currentColor','stroke-width':2});
  const centerX=627.5,centerY=162.5;
  const north=node('line',{x1:centerX,y1:220,x2:centerX,y2:98,stroke:'currentColor','stroke-width':2});
  const northText=node('text',{x:centerX,y:91,'font-size':15,fill:'currentColor','text-anchor':'middle'});
  northText.textContent='N';
  const eastText=node('text',{x:707,y:168,'font-size':15,fill:'currentColor','text-anchor':'middle'});
  eastText.textContent='E';
  const planSight=node('line',{x1:centerX,y1:centerY,stroke:'currentColor','stroke-width':4,'stroke-linecap':'round'});
  const planStatus=node('text',{x:centerX,y:282,'font-size':15,fill:'currentColor','text-anchor':'middle'});
  svg.append(ground,legRear,legLeft,legRight,head,instrument,heightLine,heightText,status,viewLabel,planBox,north,northText,eastText,planSight,planStatus);
  root.appendChild(svg);container.appendChild(root);

  function ensure(){if(disposed)throw new Error('Asset has been disposed.')}
  function sightVector(){
    const a=params.sightAzimuthRad,e=params.sightElevationRad,c=Math.cos(e);
    return {x:c*Math.sin(a),y:Math.sin(e),z:-c*Math.cos(a)};
  }
  function render(){
    const scale=110,stationX=265,baseY=350;
    const headY=baseY-params.instrumentHeight*scale;
    const half=params.legSpread*scale/2;
    legLeft.setAttribute('x1',stationX);legLeft.setAttribute('y1',headY+8);legLeft.setAttribute('x2',stationX-half);legLeft.setAttribute('y2',baseY);
    legRight.setAttribute('x1',stationX);legRight.setAttribute('y1',headY+8);legRight.setAttribute('x2',stationX+half);legRight.setAttribute('y2',baseY);
    legRear.setAttribute('x1',stationX);legRear.setAttribute('y1',headY+8);legRear.setAttribute('x2',stationX+half*0.15);legRear.setAttribute('y2',baseY);
    head.setAttribute('cx',stationX);head.setAttribute('cy',headY);
    instrument.setAttribute('transform','translate('+stationX+' '+headY+') rotate('+(-params.sightElevationRad*180/PI).toFixed(4)+')');
    heightLine.setAttribute('x1',stationX-115);heightLine.setAttribute('x2',stationX-115);heightLine.setAttribute('y1',baseY);heightLine.setAttribute('y2',headY);
    heightText.setAttribute('x',stationX-148);heightText.setAttribute('y',(baseY+headY)/2);heightText.textContent=params.instrumentHeight.toFixed(2)+' m';
    status.textContent='Instrument height '+params.instrumentHeight.toFixed(2)+' m · sight elevation '+(params.sightElevationRad*180/PI).toFixed(2)+'°';
    const dx=Math.sin(params.sightAzimuthRad)*61,dy=-Math.cos(params.sightAzimuthRad)*61;
    planSight.setAttribute('x2',(centerX+dx).toFixed(3));planSight.setAttribute('y2',(centerY+dy).toFixed(3));
    let degrees=params.sightAzimuthRad*180/PI;if(degrees<0)degrees+=360;
    planStatus.textContent='Azimuth '+degrees.toFixed(1)+'° clockwise from N';
  }
  function snapshot(){
    ensure();
    return {id:'sur-tripod-level',timeSeconds:Math.max(0,timeSeconds),parameters:{...params},result:{instrumentStation:{x:0,y:params.instrumentHeight,z:0},sightDirection:sightVector()},pose:{legSpread:params.legSpread}};
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
