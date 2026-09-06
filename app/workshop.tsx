"use client";
import { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Download, Plus, RotateCcw, TrainFront, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { WorkshopSign, PIXEL_FONT } from '@/components/workshop-sign';
import { appearanceFor, INITIAL_STATION, INITIAL_TRANSFERS, PURPOSES, TEXTURES, THEMES } from '@/lib/workshop-model';
import type { Appearance, Frame, Purpose, Slot, Station, Surface, Theme, Transfer } from '@/lib/workshop-model';
import './workshop.css';

function Field({ name, value, change }: { name:string; value:string; change:(value:string)=>void }) { return <label className="ws-field"><span>{name}</span><Input value={value} onChange={e=>change(e.target.value)} /></label>; }
function Color({ name, value, change }: {name:string;value:string;change:(s:string)=>void}) { return <label className="ws-color"><span>{name}</span><div><input type="color" value={value} onChange={e=>change(e.target.value)} aria-label={name}/><code>{value.toUpperCase()}</code></div></label>; }
function Range({name,value,min,max,step=1,change,unit=''}:{name:string;value:number;min:number;max:number;step?:number;change:(n:number)=>void;unit?:string}){return <div className="ws-range"><div><span>{name}</span><output>{value}{unit}</output></div><Slider aria-label={name} value={[value]} min={min} max={max} step={step} onValueChange={v=>change(v[0])}/></div>;}
function Toggle({name,value,change}:{name:string;value:boolean;change:(b:boolean)=>void}){return <label className="ws-toggle"><span>{name}</span><Switch checked={value} onCheckedChange={change} aria-label={name}/></label>;}
const blobData = (blob:Blob) => new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('文件读取失败'));r.readAsDataURL(blob);});

export default function Workshop({onLegacy}:{onLegacy:()=>void}) {
  const [theme,setTheme]=useState<Theme>('modern');
  const [purpose,setPurpose]=useState<Purpose>('comprehensive');
  const [station,setStation]=useState<Station>({...INITIAL_STATION});
  const [transfers,setTransfers]=useState<Transfer[]>(INITIAL_TRANSFERS.map(t=>({...t})));
  const [appearance,setAppearance]=useState<Appearance>(appearanceFor('modern'));
  const [exportWidth,setExportWidth]=useState('1200');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [pixelReady,setPixelReady]=useState(false);
  const cache=useRef(new Map<string,string>());
  const spec=PURPOSES[purpose];
  useEffect(()=>{let active=true;document.fonts.load('12px GafaPixel','南薰站').then(fonts=>{if(active)setPixelReady(fonts.length>0);}).catch(()=>{if(active)setMessage('像素字体暂未加载成功，请刷新后重试。');});return()=>{active=false;};},[]);
  const edit=(key:keyof Station,value:string)=>setStation(s=>({...s,[key]:value}));
  const look=<K extends keyof Appearance>(key:K,value:Appearance[K])=>setAppearance(a=>({...a,[key]:value}));
  function chooseTheme(next:Theme){setTheme(next);setAppearance(a=>({...a,background:THEMES[next].background,foreground:THEMES[next].foreground,secondary:THEMES[next].secondary}));}
  function updateTransfer(id:number,patch:Partial<Transfer>){setTransfers(ts=>ts.map(t=>t.id===id?{...t,...patch}:t));}
  function addTransfer(slot:Slot){setTransfers(ts=>[...ts,{id:Date.now()+Math.random(),name:'新线路',color:'#387CB4',slot,side:'right',destination:''}]);}
  function reset(){setStation({...INITIAL_STATION});setTransfers(INITIAL_TRANSFERS.map(t=>({...t})));setAppearance(appearanceFor(theme));setMessage('已恢复南薰站示例。');}
  async function asset(path:string){if(cache.current.has(path))return cache.current.get(path)!;const response=await fetch(path);if(!response.ok)throw new Error('字体或背景资源未能加载，请刷新后重试。');const result=await blobData(await response.blob());cache.current.set(path,result);return result;}
  async function download(format:'png'|'svg') {
    setBusy(true);setMessage('');
    try {
      if(theme==='pixel' && !pixelReady)throw new Error('点阵字体尚未就绪，请稍后再导出。');
      await document.fonts.ready;
      const svg=document.getElementById('workshop-preview') as SVGSVGElement|null;
      if(!svg)throw new Error('预览尚未就绪。');
      const copy=svg.cloneNode(true) as SVGSVGElement;
      const width=Number(exportWidth),height=Math.round(width*spec.height/spec.width);
      copy.setAttribute('width',String(width));copy.setAttribute('height',String(height));
      for(const image of Array.from(copy.querySelectorAll('image'))){const href=image.getAttribute('href');if(href)image.setAttribute('href',await asset(href));}
      if(theme==='pixel'){
        const style=document.createElementNS('http://www.w3.org/2000/svg','style');style.textContent=`@font-face{font-family:GafaPixel;src:url(${await asset(PIXEL_FONT)}) format('woff2');font-weight:400;font-style:normal}`;copy.insertBefore(style,copy.firstChild);
      }
      const source=new XMLSerializer().serializeToString(copy);
      const svgBlob=new Blob([source],{type:'image/svg+xml;charset=utf-8'});
      let output:Blob=svgBlob;
      if(format==='png') {
        const url=URL.createObjectURL(svgBlob);
        try {
          const image=new Image();
          await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('图片生成失败，请改用 SVG 导出或重试。'));image.src=url;});
          const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
          const ctx=canvas.getContext('2d');if(!ctx)throw new Error('当前浏览器无法导出图片。');
          ctx.imageSmoothingEnabled=theme!=='pixel';ctx.drawImage(image,0,0,width,height);
          output=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('图片导出失败。')),'image/png'));
        } finally {URL.revokeObjectURL(url);}
      }
      const url=URL.createObjectURL(output),link=document.createElement('a');link.href=url;link.download=`${station.cn.replace(/[\\/:*?"<>|]/g,'-')||'站牌'}-${purpose}-${theme}.${format}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      setMessage(`已生成 ${format.toUpperCase()} · ${width} × ${height}，请查看浏览器下载。`);
    }catch(error){setMessage(error instanceof Error?error.message:'导出失败，请重试。');}finally{setBusy(false);}
  }
  const currentOnly=purpose==='transfer';
  const slots:Slot[]=currentOnly?['current']:['previous','current','next'];
  return <main className="ws-shell">
    <header className="ws-header"><div className="ws-brand"><span className="ws-logo"><TrainFront size={23}/></span><div><strong>GAFAcraft <span>标识工坊</span></strong><small>铁路 · 站台 · 换乘</small></div></div><Button variant="outline" onClick={onLegacy}>旧版模板</Button></header>
    <div className="ws-workspace"><aside className="ws-controls" aria-label="站牌编辑器">
      <section className="ws-section"><div className="ws-section-title"><span>01</span><h2>用途与排版</h2></div>
        <Label htmlFor="ws-purpose">标牌用途</Label><Select value={purpose} onValueChange={v=>setPurpose(v as Purpose)}><SelectTrigger id="ws-purpose"><SelectValue/></SelectTrigger><SelectContent>{Object.entries(PURPOSES).map(([key,p])=><SelectItem key={key} value={key}>{p.name}</SelectItem>)}</SelectContent></Select>
        <p className="ws-help">{spec.note}</p>
        <div className="ws-style-grid" aria-label="原创风格">{Object.entries(THEMES).map(([key,t])=><button key={key} onClick={()=>chooseTheme(key as Theme)} aria-pressed={theme===key} className={`ws-style-card ${theme===key?'is-selected':''}`}><div className={`ws-style-mini mini-${key}`} style={{background:t.background,color:t.foreground}}><span>南薰</span><i/></div><strong>{t.name}</strong><small>{t.note}</small></button>)}</div>
      </section>
      <section className="ws-section"><div className="ws-section-title"><span>02</span><h2>内容与外观</h2></div>
        <Tabs defaultValue="content"><TabsList className="ws-tabs"><TabsTrigger value="content">文字</TabsTrigger><TabsTrigger value="transfer">换乘</TabsTrigger><TabsTrigger value="surface">背景</TabsTrigger><TabsTrigger value="color">颜色</TabsTrigger></TabsList>
          <TabsContent value="content" className="ws-fields">
            <Field name="本站中文" value={station.cn} change={v=>edit('cn',v)}/><Field name="本站英文 · 可留空" value={station.en} change={v=>edit('en',v)}/>
            {purpose!=='transfer' && <Field name="运行线路" value={station.line} change={v=>edit('line',v)}/>}
            <Range name="站名 / 站台主文字" value={appearance.nameScale} min={70} max={120} step={5} unit="%" change={v=>look('nameScale',v)}/>
            <Range name="辅助文字大小" value={appearance.infoScale} min={80} max={120} step={5} unit="%" change={v=>look('infoScale',v)}/>
            <Toggle name="显示英文" value={appearance.showEnglish} change={v=>look('showEnglish',v)}/>
            {purpose==='comprehensive' && <><div className="ws-divider">相邻车站</div><div className="ws-two"><Field name="前一站" value={station.previous} change={v=>edit('previous',v)}/><Field name="后一站" value={station.next} change={v=>edit('next',v)}/><Field name="前站英文" value={station.previousEn} change={v=>edit('previousEn',v)}/><Field name="后站英文" value={station.nextEn} change={v=>edit('nextEn',v)}/></div><Button variant="outline" onClick={()=>{setStation(s=>({...s,previous:s.next,previousEn:s.nextEn,next:s.previous,nextEn:s.previousEn}));setTransfers(ts=>ts.map(t=>({...t,slot:t.slot==='previous'?'next':t.slot==='next'?'previous':'current'})));}}><ArrowLeftRight size={16}/> 对调前后站</Button><Toggle name="显示站序线路" value={appearance.showRoute} change={v=>look('showRoute',v)}/><Toggle name="显示列车方向箭头" value={appearance.showArrow} change={v=>look('showArrow',v)}/></>}
            {(purpose==='platform'||purpose==='comprehensive') && <><div className="ws-divider">乘车信息 · 留空即隐藏</div><div className="ws-two"><Field name="站台号" value={station.platform} change={v=>edit('platform',v)}/><Field name="股道号" value={station.track} change={v=>edit('track',v)}/></div><Field name="开往方向" value={station.destination} change={v=>edit('destination',v)}/></>}
            {purpose==='comprehensive' && <><Field name="车站编号" value={station.code} change={v=>edit('code',v)}/><Field name="运营单位" value={station.operator} change={v=>edit('operator',v)}/><Field name="状态标识 · 如终点站，可留空" value={station.status} change={v=>edit('status',v)}/></>}
            {purpose==='name' && <p className="ws-help">悬挂牌不显示前后站、换乘、站台和股道；切换牌型不会丢失这些内容。</p>}
          </TabsContent>
          <TabsContent value="transfer" className="ws-fields">
            {(purpose==='name'||purpose==='platform')?<p className="ws-help">此牌型不显示换乘信息。请切换到综合线路牌或换乘导向牌编辑；已有信息会保留。</p>:slots.map(slot=>{
              const lines=transfers.filter(t=>t.slot===slot);return <div className="ws-transfer-group" key={slot}><div className="ws-transfer-heading"><strong>{slot==='current'?'本站':slot==='previous'?'前一站':'后一站'}换乘</strong><Button size="sm" variant="outline" disabled={lines.length>=4} onClick={()=>addTransfer(slot)}><Plus size={15}/>添加</Button></div>
                {!lines.length&&<p className="ws-help">暂无换乘线路</p>}
                {lines.map(t=><div className="ws-transfer-row" key={t.id}><div className="ws-row"><Input aria-label="换乘线路名称" value={t.name} onChange={e=>updateTransfer(t.id,{name:e.target.value})}/><Button size="icon" variant="ghost" aria-label={`删除${t.name}`} onClick={()=>setTransfers(ts=>ts.filter(x=>x.id!==t.id))}><X size={16}/></Button></div><Color name="线路颜色" value={t.color} change={v=>updateTransfer(t.id,{color:v})}/>{purpose==='transfer'&&<><Select value={t.side} onValueChange={v=>updateTransfer(t.id,{side:v as 'left'|'right'})}><SelectTrigger aria-label="步行方向"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="left">← 向左换乘</SelectItem><SelectItem value="right">向右换乘 →</SelectItem></SelectContent></Select><Field name="目的地补充 · 可留空" value={t.destination} change={v=>updateTransfer(t.id,{destination:v})}/></>}</div>)}<small className="ws-help">每站最多 4 条；名称与颜色均可修改。</small></div>;})}
          </TabsContent>
          <TabsContent value="surface" className="ws-fields">
            <div className="ws-choice-row">{(['solid','texture','transparent'] as Surface[]).map((s,i)=><button key={s} aria-pressed={appearance.surface===s} onClick={()=>look('surface',s)}>{['纯色','方块纹理','透明'][i]}</button>)}</div>
            {appearance.surface!=='transparent'&&<Color name="背景底色" value={appearance.background} change={v=>look('background',v)}/>}
            {appearance.surface==='texture'&&<><div className="ws-materials">{TEXTURES.map(t=><button key={t.id} aria-pressed={appearance.texture===t.id} onClick={()=>look('texture',t.id)}><span style={{backgroundColor:t.color,backgroundImage:`url(/${t.id}.png)`}}/><strong>{t.name}</strong></button>)}</div><Range name="纹理浓度" value={appearance.textureOpacity} min={0} max={100} unit="%" change={v=>look('textureOpacity',v)}/><Range name="纹理平铺尺寸" value={appearance.textureScale} min={16} max={160} step={16} unit=" px" change={v=>look('textureScale',v)}/><p className="ws-help">纹理浓度越低，底色越明显。小字较多时建议降低浓度。</p></>}
            {appearance.surface==='transparent'&&<p className="ws-help">棋盘格仅供预览，不会导出。透明模式去掉底面与装饰侧栏，保留文字和线路标识；游戏内需使用支持透明图片的画框模式。</p>}
            <div className="ws-divider">可选边框 · 默认无边框</div><div className="ws-frame-grid">{(['none','line','double','corners'] as Frame[]).map((f,i)=><button key={f} aria-pressed={appearance.frame===f} onClick={()=>look('frame',f)}><span className={`frame-sample frame-${f}`}/>{['无边框','细线','双线','四角'][i]}</button>)}</div>
            {appearance.frame!=='none'&&<><Color name="边框颜色" value={appearance.frameColor} change={v=>look('frameColor',v)}/><Range name="边框宽度" value={appearance.frameWidth} min={2} max={20} step={2} unit=" px" change={v=>look('frameWidth',v)}/></>}
          </TabsContent>
          <TabsContent value="color" className="ws-fields"><Color name="主要文字" value={appearance.foreground} change={v=>look('foreground',v)}/><Color name="英文与辅助文字" value={appearance.secondary} change={v=>look('secondary',v)}/><Color name="运行线路识别色" value={appearance.accent} change={v=>look('accent',v)}/><Button variant="outline" onClick={()=>chooseTheme(theme)}>恢复此风格配色</Button><p className="ws-help">换乘颜色在“换乘”页独立设置。线路色块上的文字自动使用深色或白色，保证可读性。</p>{theme==='pixel'&&<p className="ws-help">{pixelReady?'点阵字库已就绪。':'正在加载点阵字库…'}原生版使用 Fusion Pixel，非锯齿滤镜。</p>}</TabsContent>
        </Tabs>
      </section>
      <div className="ws-reset"><Button variant="ghost" onClick={reset}><RotateCcw size={15}/> 恢复南薰站示例</Button></div>
    </aside>
    <section className="ws-preview" aria-label="实时预览"><div className="ws-preview-top"><div><span className="ws-eyebrow">SIGN WORKSPACE</span><h1>{spec.name}</h1><p>{THEMES[theme].name}</p></div><div className="ws-export"><Select value={exportWidth} onValueChange={setExportWidth}><SelectTrigger aria-label="导出分辨率"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="768">768 px 宽</SelectItem><SelectItem value="1200">1200 px 宽</SelectItem><SelectItem value="2400">2400 px 宽</SelectItem><SelectItem value="3600">3600 px 宽</SelectItem></SelectContent></Select><Button disabled={busy||(theme==='pixel'&&!pixelReady)} onClick={()=>download('png')}><Download size={17}/>{busy?'正在生成…':'下载 PNG'}</Button><Button variant="outline" disabled={busy||(theme==='pixel'&&!pixelReady)} onClick={()=>download('svg')}>SVG</Button></div></div>
      <div className={`ws-canvas ${purpose==='platform'?'ws-canvas-portrait':''}`}><div className="ws-canvas-label">{spec.width} × {spec.height} · {purpose==='platform'?'2:3':'3:1'}</div><div className={`ws-artboard ${appearance.surface==='transparent'?'ws-checker':''}`} style={{aspectRatio:`${spec.width}/${spec.height}`}}><WorkshopSign station={station} appearance={appearance} purpose={purpose} theme={theme} transfers={transfers}/></div><div className="ws-canvas-caption">{purpose==='name'?'站名是主角，线路是辅助。':purpose==='transfer'?'在分岔口指向换乘通道。':purpose==='platform'?'确认站台，再确认乘车方向。':'站名优先，线路与服务信息分层。'}</div></div>
      <div className="ws-message" role="status" aria-live="polite">{message}</div>
      <div className="ws-specs"><div><span>建议画框比例</span><strong>{spec.blocks} 格</strong></div><div><span>导出大小</span><strong>{exportWidth} × {Math.round(Number(exportWidth)*spec.height/spec.width)} px</strong></div><div><span>背景</span><strong>{appearance.surface==='solid'?'纯色底面':appearance.surface==='transparent'?'透明叠字':TEXTURES.find(t=>t.id===appearance.texture)?.name}</strong></div></div>
      <section className="ws-purpose-strip"><h2>同一内容，不同用途</h2><div>{Object.entries(PURPOSES).map(([key,p])=><button key={key} aria-pressed={purpose===key} onClick={()=>setPurpose(key as Purpose)}><span>{String(Object.keys(PURPOSES).indexOf(key)+1).padStart(2,'0')}</span><strong>{p.name}</strong><small>{p.note}</small></button>)}</div></section>
      <p className="ws-disclaimer">南薰站初始信息为排版示例，请按服务器实际线路修改。仅用于非官方 Minecraft 创作；纹理为平面图片，不会赋予真实方块或发光特性。</p>
      <details className="ws-credits"><summary>字体与材质来源</summary><p>像素字库：<a href="https://github.com/TakWolf/fusion-pixel-font" target="_blank" rel="noreferrer">Fusion Pixel Font</a>，OFL-1.1，许可随项目附带。方块纹理：Minecraft 1.21.1，由 <a href="https://github.com/PrismarineJS/minecraft-assets" target="_blank" rel="noreferrer">PrismarineJS/minecraft-assets</a> 提供镜像，素材权利归 Mojang / Microsoft。与 Immersive Paintings 无隶属关系。</p></details>
    </section></div>
  </main>;
}
