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
  function route(x: number, y: number, width: number) {
    if (!a.showRoute) return null;
    y = Math.min(y, 264);
    const pts = [{ cn:d.previous,en:d.previousEn,slot:'previous' },{cn:d.cn.replace(/站$/, ''),en:d.en.replace(/ STATION$/, ''),slot:'current'},{cn:d.next,en:d.nextEn,slot:'next'}];
    return <g><path d={`M${x} ${y}H${x+width}`} stroke={accent} strokeWidth={pixel ? 8 : 5}/>{a.showArrow && arrow(x+width+28,y,'right',.65)}{pts.map((s,i) => <g key={s.slot}>
      {s.cn && (pixel ? <rect x={x+i*width/2-9} y={y-9} width={18} height={18} fill={i===1?accent:fg} stroke={fg} strokeWidth={3}/> : <circle cx={x+i*width/2} cy={y} r={10} fill={i===1?accent:a.background} stroke={accent} strokeWidth={4}/>)}
      {text(s.cn,x+i*width/2,y+35,25,width/2-35,fg,'middle')}
      {a.showEnglish && text(s.en,x+i*width/2,y+57,13,width/2-30,muted,'middle')}
      {badges(transfers.filter(t=>t.slot===s.slot && t.slot!=='current'),x+i*width/2-85,y+66,170)}
    </g>)}</g>;
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
      {sidebar && !transparent && <rect width={190} height={400} fill={accent}/>}
      {sidebar ? <>{text(d.line,95,145,50,154,transparent?accent:ink,'middle')}{text(d.code,95,205,23,150,transparent?muted:ink,'middle')}{text(platform,95,278,23,155,transparent?fg:ink,'middle')}{text(title,235,133,92,625,fg,'start',true)}{a.showEnglish && text(d.en,238,180,25,610,muted)}{text(d.operator,1160,36,17,490,muted,'end')}{text('本站换乘',920,85,16,235,muted)}{badges(current,920,99,240)}{text(d.destination,1160,249,21,450,fg,'end')}{route(280,279,790)}{text(d.status,238,230,19,230,accent)}{a.showEnglish && text(d.statusEn,475,230,13,200,muted)}</> : heritage ? <>
        {text(d.line,40,49,25,220,accent)}{text(d.code,40,81,18,210,muted)}{text(d.operator,1160,39,16,330,muted,'end')}
        {text(title,600,139,96,660,fg,'middle',true)}{a.showEnglish && text(d.en,600,183,28,650,muted,'middle')}
        {text(platform,40,223,25,285)}{text('本站换乘',928,108,16,220,muted)}{badges(current,930,122,230)}
        {text(d.destination,600,231,22,450,accent,'middle')}{text(d.status,1160,226,19,210,accent,'end')}{route(175,278,850)}
      </> : <>
        {text(d.line,40,43,24,250,accent)}{text(d.code,315,43,20,170,muted)}{text(d.operator,1160,39,16,550,muted,'end')}
        {text(title,40,153,106,790,fg,'start',true)}{a.showEnglish && text(d.en,44,201,29,795,muted)}
        {text('本站换乘',906,87,16,240,muted)}{badges(current,906,100,252)}{text(platform,1160,219,25,310,fg,'end')}
        {text(d.destination,40,244,21,550,accent)}{text(d.status,620,244,19,220,accent)}{route(130,280,940)}
      </>}
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
