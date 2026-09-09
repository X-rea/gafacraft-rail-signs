import type { Appearance, Purpose, Station, Theme, Transfer } from '@/lib/workshop-model';
import { contrastInk, fitSize, PURPOSES, usesPixelFont } from '@/lib/workshop-model';
import { emptyAttributes, visibleStops } from '@/lib/station-layout';
import type { StationAttributes } from '@/lib/station-layout';
export const PIXEL_FONT='/fusion-pixel-12px-monospaced-zh_hans.ttf.woff2';
export function WorkshopSign({station:d,appearance:a,theme,purpose,transfers,attributes=emptyAttributes(),logo='',id='workshop-preview'}:{station:Station;appearance:Appearance;theme:Theme;purpose:Purpose;transfers:Transfer[];attributes?:StationAttributes;logo?:string;id?:string}){
 const {width:w,height:h}=PURPOSES[purpose];
 const pixel=theme==='pixel',heritage=theme==='heritage',sidebar=theme==='sidebar'||pixel;
 const fg=a.foreground,muted=a.secondary,accent=a.accent,ink=contrastInk(accent),transparent=a.surface==='transparent';
 const bold=a.bold!==false;
 const pixelFont=usesPixelFont(theme,a.font);
 const selectedFont=a.font&&a.font!=='auto'?a.font:heritage?'serif':theme==='railway'?'railway':'sans';
 const family=pixelFont?'GafaPixel, monospace':selectedFont==='serif'?'Georgia, "Noto Serif CJK SC", "Songti SC", SimSun, serif':selectedFont==='railway'?'Arial, "Microsoft YaHei", sans-serif':'Arial, "Noto Sans SC", "Microsoft YaHei", sans-serif';
 const current=transfers.filter(t=>t.slot==='current').slice(0,4),title=d.cn||'未命名站';
 const {terminal,origin,stops}=visibleStops(d,attributes);
 const platform=[d.platform&&`${d.platform}站台`,d.track&&`${d.track}股道`].filter(Boolean).join(' · ');
 function text(value:string,x:number,y:number,size:number,width:number,color=fg,anchor:'start'|'middle'|'end'='start',main=false,maxHeight=size*1.08){
  if(!value.trim())return null;
  const fontSize=Math.min(maxHeight,fitSize(value,size*(main?a.nameScale:a.infoScale)/100,width,pixelFont));
  const latin=/[A-Za-z]/.test(value)&&!/[\u3400-\u9fff]/.test(value);
  const latinFamily=selectedFont==='serif'?'Georgia, serif':bold?'"Arial Black", Arial, sans-serif':'Arial, sans-serif';
  return <text x={x} y={y} fill={color} textAnchor={anchor} fontFamily={latin&&!pixelFont?latinFamily:family} fontWeight={pixelFont?400:bold?(latin?900:700):400} fontSize={fontSize} stroke={bold&&(latin||pixelFont)?color:undefined} strokeWidth={bold?fontSize*(pixelFont?(latin?.035:.008):latin?.012:0):0} paintOrder="stroke fill" strokeLinejoin="round">{value}</text>;
 }
 function arrow(x:number,y:number,side:'left'|'right',size=1,color=accent){return <g data-layout="direction-arrow" transform={`translate(${x} ${y}) scale(${size}) ${side==='left'?'rotate(180)':''}`} fill={color}>{pixel?<path d="M-24 -5H0V-20H6V-15H12V-10H18V-5H24V5H18V10H12V15H6V20H0V5H-24Z"/>:<path d="M-26 -4H12L0 -16L6 -22L28 0L6 22L0 16L12 4H-26Z"/>}</g>;}
 function badges(lines:Transfer[],x:number,y:number,width:number,rowHeight=27){
  const cols=lines.length===1?1:2,cell=(width-6*(cols-1))/cols;
  return <g data-layout="transfer-badges">{lines.slice(0,4).map((line,i)=><g key={line.id} transform={`translate(${x+i%cols*(cell+6)} ${y+Math.floor(i/cols)*(rowHeight+5)})`}><rect width={cell} height={rowHeight} rx={pixel?0:5} fill={line.color}/>{text(line.name||'未命名线路',cell/2,rowHeight*.76,rowHeight*.65,cell-12,contrastInk(line.color),'middle',false,rowHeight*.67)}</g>)}</g>;
 }
 function logoAt(x:number,y:number,size:number){return logo?<image data-layout="logo" href={logo} x={x} y={y} width={size} height={size} preserveAspectRatio="xMidYMid meet"/>:null;}
 const sideWidth=pixel?154:250,contentLeft=sidebar?sideWidth+30:30,routeWidth=1170-contentLeft;
 const tagsFor=(slot:typeof stops[number]['slot'])=>[...(attributes[slot]||[]),...(slot==='current'&&d.status?[d.status]:[])];
 const adjacentFor=(slot:typeof stops[number]['slot'])=>transfers.filter(t=>t.slot===slot&&slot!=='current').slice(0,4);
 const rawExtras=Math.max(0,...stops.map(s=>Math.ceil(tagsFor(s.slot).length/3)*28+Math.ceil(adjacentFor(s.slot).length/2)*38));
 const dense=rawExtras>92,tagH=dense?(a.showStopEnglish?15:17):transfers.length?28:40,badgeH=dense?(a.showStopEnglish?17:19):32;
 const extraHeight=Math.max(0,...stops.map(s=>Math.ceil(tagsFor(s.slot).length/3)*(tagH+4)+Math.ceil(adjacentFor(s.slot).length/2)*(badgeH+5)));
 const routeY=a.showRoute?Math.max(190,(pixel?288:a.showStopEnglish?294:326)-extraHeight):380;
 const nameY=dense&&a.showEnglish?(pixel?130:120):a.showEnglish?Math.max(128,routeY-130):routeY-76;
 const nameSize=dense&&a.showEnglish?(pixel?108:60):Math.min(a.showEnglish?154:180,Math.max(pixel?108:72,routeY-150),theme==='modern'?Math.max(65,(nameY-64)/.95):180);
 const serviceX=heritage?950:850,serviceW=1170-serviceX;
 const titleWidth=heritage?(current.length?570:850):current.length?serviceX-contentLeft-30:1170-contentLeft;
 function route(){
  if(!a.showRoute)return null;
  const cell=routeWidth/stops.length,xs=stops.map((_,i)=>contentLeft+cell*(i+.5));
  const lineY=pixel?routeY+(a.showStopEnglish?68:48):routeY;
  return <g data-layout="route">
   {xs.length>1&&<path d={`M${xs[0]} ${lineY}H${xs.at(-1)}`} stroke={accent} strokeWidth={pixel?8:6}/>}
   {!terminal&&!origin&&stops.some(s=>s.slot==='next')&&a.showArrow&&arrow(Math.min(1160,xs.at(-1)!+cell*.37),lineY,'right',dense?.65:.9)}
   {stops.map((stop,i)=>{
    const x=xs[i],tags=tagsFor(stop.slot),lines=adjacentFor(stop.slot),english=a.showEnglish&&a.showStopEnglish===true&&stop.en.trim();
    const cnY=pixel?routeY+20:routeY+54,enY=pixel?routeY+44:routeY+88;
    const tagY=pixel?lineY+17:english?routeY+104:routeY+72;
    const cols=Math.min(3,tags.length),tagW=Math.min(cols===1?190:cols===2?150:110,(cell-24-5*(cols-1))/Math.max(1,cols));
    const badgeY=tagY+Math.ceil(tags.length/3)*(tagH+4);
    return <g key={stop.slot} data-station={stop.slot}>
     {pixel?<rect data-layout="station-marker" x={x-12} y={lineY-12} width={24} height={24} fill={stop.slot==='current'?accent:fg} stroke={fg} strokeWidth={4}/>:<circle data-layout="station-marker" cx={x} cy={lineY} r={14} fill={stop.slot==='current'?accent:a.background} stroke={fg} strokeWidth={4}/>}
     {text(stop.cn,x,cnY,dense?26:36,cell-24,fg,'middle',false,dense?28:38)}
     {english&&text(stop.en,x,enY,dense?16:21,cell-24,muted,'middle',false,dense?17:22)}
     {tags.map((tag,j)=>{const rowCount=Math.min(3,tags.length-Math.floor(j/3)*3),rowW=rowCount*tagW+(rowCount-1)*5;return <g key={tag} transform={`translate(${x-rowW/2+j%3*(tagW+5)} ${tagY+Math.floor(j/3)*(tagH+4)})`}><rect width={tagW} height={tagH} rx={pixel?0:4} fill={accent} fillOpacity={.2}/>{text(tag,tagW/2,tagH*.77,dense?16:tagH*.74,tagW-8,fg,'middle',false,dense?16:tagH*.76)}</g>;})}
     {badges(lines,x-Math.min(cell-24,lines.length===1?180:300)/2,badgeY,Math.min(cell-24,lines.length===1?180:300),badgeH)}
    </g>;
   })}
  </g>;
 }
 const inset=a.frame==='none'?20:Math.max(20,Math.min(36,a.frameWidth+12));
 return <svg id={id} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${title} · ${PURPOSES[purpose].name}`}>
  <title>{`${title} · ${PURPOSES[purpose].name}`}</title>
  <defs><pattern id={`${id}-texture`} width={a.textureScale} height={a.textureScale} patternUnits="userSpaceOnUse"><image href={`/${a.texture}.png`} width={a.textureScale} height={a.textureScale} style={{imageRendering:'pixelated'}}/></pattern></defs>
  {!transparent&&<rect width={w} height={h} fill={a.background}/>}
  {a.surface==='texture'&&<rect width={w} height={h} fill={`url(#${id}-texture)`} opacity={a.textureOpacity/100}/>}
  <g transform={`translate(${inset} ${inset}) scale(${(w-2*inset)/w} ${(h-2*inset)/h})`}>
  {purpose==='comprehensive'&&<>
   {theme==='railway'?<>
    <rect width={1200} height={16} fill={accent}/><rect y={384} width={1200} height={16} fill={accent}/>
    <circle cx={82} cy={77} r={45} fill={accent}/>{text(d.line.replace(/号线$/,''),82,80,40,74,ink,'middle')}{text(d.code,82,108,16,78,ink,'middle')}
    {text(title,600,nameY+(dense?0:4),nameSize,830,fg,'middle',true,nameSize)}
    {a.showEnglish&&text(d.en,600,dense?160:Math.min(nameY+Math.max(46,nameSize*.56),routeY-36),Math.min(35,nameSize*.27),790,muted,'middle',false,36)}
    {current.length>0&&badges(current,920,90,250,dense?26:current.length>2?30:48)}
   </>:<>
    {sidebar&&<>
     {!transparent&&<rect width={sideWidth} height={400} fill={accent}/>}
     {pixel?<>{text(d.line.replace(/号线$/,''),sideWidth/2,173,150,sideWidth-22,transparent?accent:ink,'middle')}{text(d.line.endsWith('号线')?'号线':'',sideWidth/2,240,48,sideWidth-22,transparent?accent:ink,'middle')}</>:text(d.line,sideWidth/2,160,78,sideWidth-22,transparent?accent:ink,'middle')}
     <path d={`M22 263H${sideWidth-22}`} stroke={transparent?accent:ink} strokeWidth={3}/>
     {text(d.code,sideWidth/2,305,32,sideWidth-22,transparent?fg:ink,'middle')}
     {pixel?<>{text(d.platform?d.platform+'站台':'',sideWidth/2,346,29,sideWidth-22,transparent?fg:ink,'middle')}{text(d.track?d.track+'股道':'',sideWidth/2,385,29,sideWidth-22,transparent?fg:ink,'middle')}</>:text(platform,sideWidth/2,370,36,sideWidth-22,transparent?fg:ink,'middle')}
    </>}
    {!sidebar&&<>{heritage&&<rect x={28} y={20} width={185} height={49} rx={8} fill={accent}/>}{text(d.line,heritage?120:30,heritage?59:48,40,200,heritage?ink:accent,heritage?'middle':'start')}{text(d.code,heritage?120:280,heritage?108:46,27,165,muted,heritage?'middle':'start')}</>}
    {text(title,heritage?600:contentLeft,nameY,nameSize,titleWidth,fg,heritage?'middle':'start',true,nameSize)}
    {a.showEnglish&&text(d.en,heritage?600:contentLeft,dense?(pixel?176:160):Math.min(nameY+(pixel?70:Math.max(44,nameSize*.54)),routeY-(pixel?24:36)),pixel&&!dense?48:Math.min(43,nameSize*.3),titleWidth,muted,heritage?'middle':'start',false,pixel&&!dense?48:44)}
    {current.length>0&&<>{badges(current,serviceX,heritage&&!dense&&current.length<=2?112:88,serviceW,dense?26:current.length>2?26:66)}{text('换乘',serviceX,heritage&&!dense&&current.length<=2?100:76,26,serviceW)}</>}
    {heritage?text(platform,140,dense?150:Math.max(170,routeY-104),dense?28:35,240,fg,'middle'):!sidebar&&text(platform,650,42,27,300,fg,'middle')}
   </>}
   {text([d.operator,d.region].filter(Boolean).join(' · '),logo?1070:1170,theme==='railway'?56:36,26,theme==='railway'?370:460,muted,'end')}{logoAt(1098,10,72)}
   {text(d.destination,1170,dense?169:routeY-30,dense?17:27,320,accent,'end',false,dense?18:28)}
   {route()}
  </>}
  {purpose==='name'&&<>
   {!transparent&&<rect x={sidebar?0:996} width={204} height={400} fill={accent}/>}
   {text(d.line,sidebar?102:1098,226,58,180,transparent?accent:ink,'middle')}
   {text(title,sidebar?702:498,a.showEnglish?212:248,a.showEnglish?128:152,880,fg,'middle',true,156)}
   {a.showEnglish&&text(d.en,sidebar?702:498,288,40,840,muted,'middle')}{logoAt(sidebar?1110:24,18,66)}
  </>}
  {purpose==='platform'&&<>
   {!transparent&&<rect width={450} height={110} fill={accent}/>}
   {text(d.line,logo?175:225,78,65,logo?270:390,transparent?accent:ink,'middle',false,70)}{logoAt(350,15,80)}
   {text(d.platform||'—',225,337,220,380,fg,'middle',true,235)}
   {text('站台',225,448,64,380,fg,'middle',false,68)}
   {text(d.track?`${d.track} 股道`:'',225,544,64,380,muted,'middle',false,68)}
   {text(d.destination,225,653,52,380,accent,'middle')}
   {text(title,225,a.showEnglish?767:795,50,380,fg,'middle')}{a.showEnglish&&text(d.en,225,821,31,380,muted,'middle')}
  </>}
  {purpose==='transfer'&&<>
   <path d="M30 92H1170" stroke={accent} strokeWidth={4}/>
   {text('换乘',30,65,52,270)}{text(title,logo?1075:1170,63,38,700,muted,'end')}{logoAt(1102,10,68)}
   {current.length?current.map((line,i)=>{
    const columns=current.length>2?2:1,rows=Math.ceil(current.length/columns),cw=1140/columns,rh=278/rows;
    const x=30+(i%columns)*cw,y=110+Math.floor(i/columns)*rh,cy=y+(rh-12)/2;
    return <g key={line.id} data-layout="direction-card">
     <rect x={x} y={y} width={cw-12} height={rh-14} rx={pixel?0:8} fill={line.color} fillOpacity={.13}/>
     <rect x={x} y={y} width={9} height={rh-14} fill={line.color}/>
     <rect x={line.side==='left'?x+20:x+cw-108} y={cy-40} width={80} height={80} rx={pixel?0:6} fill={line.color}/>
     {arrow(line.side==='left'?x+60:x+cw-68,cy,line.side,1,contrastInk(line.color))}
     {text(line.name||'未命名线路',x+(line.side==='left'?125:28),cy+(line.destination?0:18),columns===1?72:48,cw-160,fg,'start',false,78)}
     {line.destination&&text(line.destination,x+(line.side==='left'?125:28),cy+38,26,cw-160,muted)}
    </g>;
   }):text('请添加本站换乘线路',600,245,44,1050,muted,'middle')}
  </>}
  </g>
  {a.frame==='line'&&<rect x={a.frameWidth/2} y={a.frameWidth/2} width={w-a.frameWidth} height={h-a.frameWidth} fill="none" stroke={a.frameColor} strokeWidth={a.frameWidth}/>}
  {a.frame==='double'&&<g fill="none" stroke={a.frameColor} strokeWidth={a.frameWidth/2}><rect x={4} y={4} width={w-8} height={h-8}/><rect x={a.frameWidth+8} y={a.frameWidth+8} width={w-2*a.frameWidth-16} height={h-2*a.frameWidth-16}/></g>}
  {a.frame==='corners'&&<path d={`M8 55V8H55 M${w-55} 8H${w-8}V55 M8 ${h-55}V${h-8}H55 M${w-55} ${h-8}H${w-8}V${h-55}`} fill="none" stroke={a.frameColor} strokeWidth={a.frameWidth}/>}
 </svg>;
}

