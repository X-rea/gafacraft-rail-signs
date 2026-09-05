export type Theme = 'modern' | 'sidebar' | 'heritage' | 'pixel';
export type Purpose = 'comprehensive' | 'name' | 'platform' | 'transfer';
export type Surface = 'solid' | 'texture' | 'transparent';
export type Frame = 'none' | 'line' | 'double' | 'corners';
export type Slot = 'previous' | 'current' | 'next';
export type Transfer = { id: number; name: string; color: string; slot: Slot; side: 'left' | 'right'; destination: string };
export type Station = { cn: string; en: string; previous: string; previousEn: string; next: string; nextEn: string; line: string; code: string; operator: string; platform: string; track: string; destination: string; status: string; statusEn: string };
export type Appearance = { surface: Surface; texture: string; background: string; foreground: string; secondary: string; accent: string; frame: Frame; frameColor: string; frameWidth: number; textureScale: number; textureOpacity: number; nameScale: number; infoScale: number; showEnglish: boolean; showRoute: boolean; showArrow: boolean };
export const THEMES: Record<Theme, { name: string; note: string; background: string; foreground: string; secondary: string }> = {
  modern: { name: '现代 · 横向分层', note: '大站名 / 底部连续站序', background: '#F5F5F0', foreground: '#172027', secondary: '#4F5B64' },
  sidebar: { name: '现代 · 侧栏分区', note: '线路侧栏 / 深色主区域', background: '#123450', foreground: '#FFFFFF', secondary: '#D6E2EA' },
  heritage: { name: '工业复古', note: '厚实衬线 / 居中对称', background: '#104C37', foreground: '#FFF4D9', secondary: '#DBDEC9' },
  pixel: { name: '原生像素', note: '真实点阵 / 方形站序', background: '#303438', foreground: '#FFF5DE', secondary: '#D6D6CF' },
};
export const PURPOSES: Record<Purpose, { name: string; note: string; width: number; height: number; blocks: string }> = {
  comprehensive: { name: '综合线路牌', note: '站名、相邻站、运行方向、换乘与站台信息', width: 1200, height: 400, blocks: '3 × 1' },
  name: { name: '悬挂站名牌', note: '仅显示本站、英文与运行线路，远处一眼识别', width: 1200, height: 400, blocks: '3 × 1' },
  platform: { name: '站台乘车牌', note: '竖向突出站台号，辅以股道、线路和开往方向', width: 600, height: 900, blocks: '2 × 3' },
  transfer: { name: '换乘导向牌', note: '箭头表示步行方向，不表示列车运行方向', width: 1200, height: 400, blocks: '3 × 1' },
};
export const TEXTURES = [
  { id: 'spruce_planks', name: '云杉木板', color: '#705232' },
  { id: 'deepslate', name: '深板岩', color: '#494A50' },
  { id: 'copper_block', name: '铜块', color: '#B66B47' },
  { id: 'bricks', name: '红砖', color: '#995E4C' },
  { id: 'stone', name: '石头', color: '#888888' },
];
export const INITIAL_STATION: Station = { cn: '南薰站', en: 'NANXUN STATION', previous: '南沙', previousEn: 'NANSHA', next: '汉中', nextEn: 'HANZHONG', line: '1号线', code: '01-01', operator: '松铁集团南薰局', platform: '2', track: '3', destination: '开往 汉中', status: '', statusEn: '' };
export const INITIAL_TRANSFERS: Transfer[] = [{ id: 1, name: '2号线', color: '#19804A', slot: 'current', side: 'right', destination: '' }];
export function appearanceFor(theme: Theme): Appearance { return { ...THEMES[theme], surface: 'solid', texture: 'deepslate', accent: '#C99B28', frame: 'none', frameColor: '#C99B28', frameWidth: 8, textureScale: 64, textureOpacity: 65, nameScale: 100, infoScale: 100, showEnglish: true, showRoute: true, showArrow: true }; }
export function fitSize(text: string, max: number, width: number, pixel = false) {
  const units = Array.from(text).reduce((sum, c) => sum + (c.codePointAt(0)! > 255 ? 1 : 0.62), 0);
  const size = Math.min(max, width / Math.max(1, units));
  return pixel && size >= 12 ? Math.max(12, Math.floor(size / 12) * 12) : size;
}
export function contrastInk(hex: string) {
  const rgb = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16) / 255).map(v => v <= .04045 ? v/12.92 : Math.pow((v+.055)/1.055,2.4));
  return rgb[0]*.2126 + rgb[1]*.7152 + rgb[2]*.0722 > .4 ? '#15212A' : '#FFFFFF';
}
