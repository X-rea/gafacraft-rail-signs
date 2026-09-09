import type { Appearance, Purpose, Station, Theme, Transfer } from '@/lib/workshop-model';
import { contrastInk, fitSize, PURPOSES } from '@/lib/workshop-model';

export const PIXEL_FONT = '/fusion-pixel-12px-monospaced-zh_hans.ttf.woff2';
export function WorkshopSign({ station: d, appearance: a, theme, purpose, transfers, id = 'workshop-preview' }: { station: Station; appearance: Appearance; theme: Theme; purpose: Purpose; transfers: Transfer[]; id?: string }) {
  const { width: w, height: h } = PURPOSES[purpose];
  const pixel = theme === 'pixel';
  const heritage = theme === 'heritage';
  const sidebar = theme === 'sidebar' || pixel;
  const fg = a.foreground, muted = a.secondary, accent = a.accent;
  const ink = contrastInk(accent);
  const transparent = a.surface === 'transparent';
  const family = pixel ? 'GafaPixel, monospace' : heritage ? 'Georgia, "Noto Serif CJK SC", "Songti SC", SimSun, serif' : 'Arial, "Noto Sans SC", "Microsoft YaHei", sans-serif';
  const current = transfers.filter(t => t.slot === 'current');
  function text(value: string, x: number, y: number, size: number, width: number, color = fg, anchor: 'start' | 'middle' | 'end' = 'start', main = false) {
    if (!value.trim()) return null;
    const fontSize = fitSize(value, size * (main ? a.nameScale : a.infoScale) / 100, width, pixel);
    return <text x={x} y={y} fill={color} textAnchor={anchor} fontFamily={family} fontWeight={pixel ? 400 : 700} fontSize={fontSize}>{value}</text>;
  }
  function arrow(x: number, y: number, side: 'left' | 'right', size = 1, color = accent) {
    return <g transform={`translate(${x} ${y}) scale(${size}) ${side === 'left' ? 'rotate(180)' : ''}`} fill={color}>{pixel ? <path d="M-24 -6H0V-18H6V-12H12V-6H18V0H24V6H18V12H12V18H6V24H0V12H-24Z" /> : <path d="M-26 -5H7L-3 -15L4 -22L26 0L4 22L-3 15L7 5H-26Z" />}</g>;
  }
  function badges(lines: Transfer[], x: number, y: number, width: number) {
    if (!lines.length) return null;
    const columns = Math.min(2, lines.length), gap = 8, cell = (width - gap * (columns - 1)) / columns;
    return <g>{lines.map((line, i) => <g key={line.id} transform={`translate(${x + i % columns * (cell + gap)} ${y + Math.floor(i / columns) * 32})`}><rect width={cell} height={27} rx={pixel ? 0 : 3} fill={line.color}/>{text(line.name || '未命名线路', cell/2, 20, 17, cell-12, contrastInk(line.color), 'middle')}</g>)}</g>;
  }
  function largeTransfers(x:number,y:number,width:number,height:number) {
    if (!current.length) return null;
    const rows=Math.ceil(current.length/2), columns=current.length===1?1:2;
    const cell=(width-8*(columns-1))/columns, rowH=(height-6*(rows-1))/rows;
    return <g>{current.map((line,i)=><g key={line.id} transform={`translate(${x+(i%columns)*(cell+8)} ${y+Math.floor(i/columns)*(rowH+6)})`}>
      <rect width={cell} height={rowH} rx={pixel?0:10} fill={line.color}/>
      {text('换乘 '+(line.name||'未命名线路'),cell/2,rowH*.73,Math.min(54,rowH*.65),cell-20,contrastInk(line.color),'middle')}
    </g>)}</g>;
  }
  function referenceRoute(x:number,y:number,width:number,above=false) {
    if(!a.showRoute)return null;
    const points=[{cn:d.previous,en:d.previousEn,slot:'previous'},{cn:d.cn.replace(/站$/,''),en:d.en.replace(/ STATION$/,''),slot:'current'},{cn:d.next,en:d.nextEn,slot:'next'}];
    const hasAdjacent=transfers.some(t=>t.slot!=='current');
    const lineY=hasAdjacent&&!above?y-22:y;
    return <g>
      <path d={`M${x} ${lineY}H${x+width}`} stroke={accent} strokeWidth={pixel?9:6}/>
      {theme==='sidebar'&&<path d={`M${x+width/2} ${lineY}H${x+width+72}`} stroke={fg} strokeWidth={6}/>}
      {!pixel&&a.showArrow&&arrow(x+width+72,lineY,'right',.9,theme==='sidebar'?fg:accent)}
      {points.map((p,i)=>{const px=x+i*width/2;return <g key={p.slot}>
        {p.cn&&(pixel?<rect x={px-13} y={lineY-13} width={26} height={26} fill={i===1?accent:fg} stroke={fg} strokeWidth={5}/>:<circle cx={px} cy={lineY} r={15} fill={i===1?accent:a.background} stroke={fg} strokeWidth={4}/>)}
        {text(p.cn,px,above?lineY-46:lineY+47,above?36:32,width/2-35,fg,'middle')}
        {a.showEnglish&&text(p.en,px,above?lineY-24:lineY+68,above?21:18,width/2-28,muted,'middle')}
        {badges(transfers.filter(t=>t.slot===p.slot&&t.slot!=='current'),px-85,above?lineY-112:lineY+77,170)}
      </g>})}
      {theme==='modern'&&text(d.destination,36,280,25,550,accent)}
    </g>;
  }
  const platform = [d.platform && `${d.platform}站台`,d.track && `${d.track}股道`].filter(Boolean).join(' · ');
  const title = d.cn || '未命名站';
  const inset = a.frame === 'none' ? 0 : Math.min(36,a.frameWidth + 12);
  const nameOnly = purpose === 'name';
  return <svg id={id} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${title} · ${PURPOSES[purpose].name}`}>
    <title>{title} · {PURPOSES[purpose].name}</title>
    <defs><pattern id={`${id}-texture`} width={a.textureScale} height={a.textureScale} patternUnits="userSpaceOnUse"><image href={`/${a.texture}.png`} width={a.textureScale} height={a.textureScale} style={{imageRendering:'pixelated'}}/></pattern></defs>
    {!transparent && <rect width={w} height={h} fill={a.background}/>}
    {a.surface === 'texture' && <rect width={w} height={h} fill={`url(#${id}-texture)`} opacity={a.textureOpacity/100}/>}
    <g transform={`translate(${inset} ${inset}) scale(${(w-2*inset)/w} ${(h-2*inset)/h})`}>
    {nameOnly && <>
      {sidebar && !transparent && <rect width={196} height={h} fill={accent}/>}
      {!sidebar && !heritage && !transparent && <rect x={996} width={204} height={h} fill={accent}/>}
      {heritage ? <>{text(title,600,230,130,1080,fg,'middle',true)}{a.showEnglish && text(d.en,70,325,28,820,muted)}{text(d.line,1130,325,34,230,accent,'end')}</> : <>{text(title,sidebar?250:60,225,126,sidebar?880:870,fg,'start',true)}{a.showEnglish && text(d.en,sidebar?254:64,300,31,sidebar?850:840,muted)}{text(d.line,sidebar?98:1098,218,40,160,transparent?accent:ink,'middle')}</>}
    </>}
    {purpose === 'comprehensive' && <>
      {sidebar && !transparent && <rect width={pixel?154:250} height={400} fill={accent}/>}
      {pixel ? <>
        {text(d.line.replace(/号线$/, ''),77,184,160,134,transparent?accent:ink,'middle')}
        {text(d.line.endsWith('号线')?'号线':'',77,256,52,132,transparent?accent:ink,'middle')}
        <path d="M18 294H136" stroke={transparent?accent:ink} strokeWidth={8}/>
        {text(d.code,77,365,36,134,transparent?fg:ink,'middle')}
        {text(title,190,180,154,568,fg,'start',true)}
        {a.showEnglish && text(d.en,194,239,48,556,muted)}
        {text(d.operator,1170,42,28,382,muted,'end')}
        {largeTransfers(834,68,342,94)}
        {text(platform,1170,233,44,345,fg,'end')}
        {referenceRoute(239,354,600,true)}
        {text(d.destination,955,336,30,186,fg)}
        {a.showArrow && arrow(1158,333,'right',1.2)}
      </> : theme === 'sidebar' ? <>
        {text(d.line,125,185,87,218,transparent?accent:ink,'middle')}
        <path d="M28 222H222" stroke={transparent?accent:ink} strokeWidth={3}/>
        {text(d.code,125,273,40,214,transparent?muted:ink,'middle')}
        {text(platform,125,348,42,222,transparent?fg:ink,'middle')}
        {text(title,286,180,154,506,fg,'start',true)}
        {a.showEnglish && text(d.en,291,239,49,495,muted)}
        {text(d.operator,1175,43,27,350,muted,'end')}
        {largeTransfers(828,110,302,88)}
        {referenceRoute(341,291,538)}
        {text(d.destination,997,303,33,179)}
      </> : heritage ? <>
        <rect x={28} y={32} width={182} height={52} rx={8} fill={accent}/>
        {text(d.line,119,72,43,167,ink,'middle')}
        {text(d.code,119,115,29,195,muted,'middle')}
        {text(title,600,181,154,568,fg,'middle',true)}
        {a.showEnglish && text(d.en,600,242,49,526,muted,'middle')}
        {text(d.operator,1174,53,27,277,muted,'end')}
        {text(platform,30,229,45,253)}
        {largeTransfers(956,190,218,49)}
        {referenceRoute(348,292,400)}
        {text(d.destination,892,307,31,250)}
      </> : <>
        {text(d.line,36,46,32,240,accent)}{text(d.code,312,46,25,175,muted)}
        {text(d.operator,1164,44,25,430,muted,'end')}
        {text(title,36,185,132,725,fg,'start',true)}
        {a.showEnglish && text(d.en,40,240,39,723,muted)}
        {largeTransfers(839,96,325,72)}
        {text(platform,1164,245,34,338,fg,'end')}
        {referenceRoute(115,301,880)}
      </>}
      {text(d.status,1168,389,20,400,accent,'end')}
    </>}
    {purpose === 'platform' && <>
      {!transparent && <rect width={600} height={80} fill={accent}/>}{text(d.line,300,55,32,490,transparent?accent:ink,'middle')}
      {text(d.platform || '—',300,365,pixel?216:260,470,fg,'middle',true)}{text('站台',300,435,52,460,fg,'middle')}
      {text(d.track ? `${d.track} 股道` : '',300,530,42,480,muted,'middle')}
      {text(d.destination,300,650,43,490,accent,'middle')}{text(title,300,755,38,490,fg,'middle')}
      {a.showEnglish && text(d.en,300,802,22,500,muted,'middle')}
    </>}
    {purpose === 'transfer' && <>
      {text('换乘',42,55,31,220,fg)}{text(title,1158,51,22,650,muted,'end')}
      {current.length ? current.map((line,i)=>{ const rowH=280/current.length, y=90+i*rowH, cy=y+rowH/2; return <g key={line.id}>
        {arrow(line.side==='left'?92:1100,cy,line.side,Math.min(2,rowH/40),line.color)}
        <rect x={164} y={y+5} width={14} height={Math.max(18,rowH-18)} fill={line.color}/>
        {text(line.name||'未命名线路',215,cy+8,Math.min(64,rowH*.47),line.destination?460:800,fg)}
        {text(line.destination,730,cy+8,Math.min(24,rowH*.3),280,muted)}
      </g>}) : text('请添加本站换乘线路',600,225,42,1050,muted,'middle')}
    </>}
    </g>
    {a.frame === 'line' && <rect x={a.frameWidth/2} y={a.frameWidth/2} width={w-a.frameWidth} height={h-a.frameWidth} fill="none" stroke={a.frameColor} strokeWidth={a.frameWidth}/>}
    {a.frame === 'double' && <g fill="none" stroke={a.frameColor} strokeWidth={a.frameWidth/2}><rect x={4} y={4} width={w-8} height={h-8}/><rect x={a.frameWidth+8} y={a.frameWidth+8} width={w-2*a.frameWidth-16} height={h-2*a.frameWidth-16}/></g>}
    {a.frame === 'corners' && <path d={`M8 55V8H55 M${w-55} 8H${w-8}V55 M8 ${h-55}V${h-8}H55 M${w-55} ${h-8}H${w-8}V${h-55}`} fill="none" stroke={a.frameColor} strokeWidth={a.frameWidth}/>}
  </svg>;
}
