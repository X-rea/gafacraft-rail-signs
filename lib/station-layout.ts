import type { Slot, Station } from './workshop-model';

export const STATION_ATTRIBUTES = ['未开通','建设中','始发站','终到站','折返站','暂停运营','线路终点','本车终到'] as const;
export type StationAttribute = typeof STATION_ATTRIBUTES[number];
export type StationAttributes = Record<Slot, StationAttribute[]>;
export const emptyAttributes = (): StationAttributes => ({previous:[],current:[],next:[],previous2:[],next2:[]});
export function visibleStops(station: Station, attributes: StationAttributes) {
  const terminal = attributes.current.some(x => ['终到站','线路终点','本车终到'].includes(x)) || /终点|终到/.test(station.status);
  const origin = attributes.current.includes('始发站');
  const previous={slot:'previous' as Slot,cn:station.previous,en:station.previousEn};
  const current={slot:'current' as Slot,cn:station.cn.replace(/站$/,'')||'未命名站',en:station.en.replace(/ STATION$/,'')};
  const next={slot:'next' as Slot,cn:station.next,en:station.nextEn};
  const previous2={slot:'previous2' as Slot,cn:station.previous2||'前两站',en:station.previous2En||''};
  const next2={slot:'next2' as Slot,cn:station.next2||'后两站',en:station.next2En||''};
  let stops=terminal?[previous2,previous,current]:origin?[current,next,next2]:[previous,current,next];
  if((terminal&&station.endpointSide==='left')||(origin&&station.endpointSide==='right'))stops=stops.toReversed();
  return {terminal,origin,stops:stops.filter(s=>s.cn.trim())};
}
