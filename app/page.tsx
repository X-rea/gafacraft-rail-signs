"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Download,
  Plus,
  RotateCcw,
  Scaling,
  TrainFront,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

type StyleId = "guangzhou" | "dongguan" | "intercity" | "railway";
type SystemId = "station" | "facility" | "road";
type SignMode = "station" | "hanging" | "endboard" | "transfer";
type StationStatus = "normal" | "terminus" | "last";
type StationSlot = "previous" | "current" | "next";
type TransferSide = "left" | "right";
type FacilityType = "exit" | "entrance" | "ticket" | "service";
type RoadType = "crossroad" | "tjunction" | "direction" | "distance" | "boundary";
type ArrowDirection = "left" | "right" | "up" | "straight";

type SizeSettings = {
  stationText: number;
  transferBadge: number;
};

type SignData = {
  stationCn: string;
  stationEn: string;
  prevCn: string;
  prevEn: string;
  nextCn: string;
  nextEn: string;
  lineName: string;
  lineCode: string;
  stationCode: string;
  direction: string;
  operator: string;
  platformNumber: string;
  trackNumber: string;
  statusCn: string;
  statusEn: string;
};

type TransferLine = {
  id: number;
  code: string;
  name: string;
  color: string;
  side: TransferSide;
  destinationCn: string;
  destinationEn: string;
  station: StationSlot;
};

type FacilityData = {
  type: FacilityType;
  titleCn: string;
  titleEn: string;
  code: string;
  destinationCn: string;
  destinationEn: string;
  arrow: "left" | "right" | "up" | "none";
};

type RoadDestination = {
  id: number;
  nameCn: string;
  nameEn: string;
  distance: string;
  direction: ArrowDirection;
};

type RoadData = {
  type: RoadType;
  roadName: string;
  roadNameEn: string;
  roadCode: string;
  subtitleCn: string;
  subtitleEn: string;
  color: string;
  destinations: RoadDestination[];
};

type SignSpec = {
  name: string;
  short: string;
  width: number;
  height: number;
  exportWidth: number;
  exportHeight: number;
  ratio: string;
  frame: string;
  largerFrame: string;
};

const SYSTEMS: Record<SystemId, { index: string; name: string; short: string; note: string }> = {
  station: { index: "01", name: "铁路与地铁站牌", short: "STATION SIGNS", note: "车站识别、站序、换乘与站台信息" },
  facility: { index: "02", name: "站内公共标识", short: "FACILITY SIGNS", note: "出入口、售票与服务设施导向" },
  road: { index: "03", name: "道路方向标识", short: "ROAD SIGNS", note: "路口预告、分流方向与地点距离" },
};

const STYLES: Record<
  StyleId,
  { name: string; short: string; color: string; note: string; header: string }
> = {
  guangzhou: {
    name: "广州地铁风",
    short: "GZ METRO",
    color: "#C99A2E",
    header: "#F5F5F0",
    note: "线路色横贯、站名高识别、支持换乘徽标",
  },
  dongguan: {
    name: "东莞地铁风",
    short: "DG RAIL",
    color: "#1677C8",
    header: "#0C2D4C",
    note: "深蓝识别头、模块化分区、方向信息突出",
  },
  intercity: {
    name: "广东城际风",
    short: "GD INTERCITY",
    color: "#008D86",
    header: "#173C4A",
    note: "城际蓝绿、紧凑站序、跨城导向逻辑",
  },
  railway: {
    name: "广铁集团风",
    short: "CR GUANGZHOU",
    color: "#163E6C",
    header: "#163E6C",
    note: "铁路蓝底、高对比字级、适合站台悬挂",
  },
};

const MODES: Record<SignMode, SignSpec> = {
  station: {
    name: "地铁站内连续站牌",
    short: "STATION BAND",
    width: 1200,
    height: 400,
    exportWidth: 768,
    exportHeight: 256,
    ratio: "3:1",
    frame: "3 × 1 格",
    largerFrame: "6 × 2 格",
  },
  hanging: {
    name: "国铁站台悬挂站牌",
    short: "HANGING BOARD",
    width: 1200,
    height: 600,
    exportWidth: 1024,
    exportHeight: 512,
    ratio: "2:1",
    frame: "4 × 2 格",
    largerFrame: "6 × 3 格",
  },
  endboard: {
    name: "站台头尾竖向牌",
    short: "PLATFORM END",
    width: 800,
    height: 1200,
    exportWidth: 512,
    exportHeight: 768,
    ratio: "2:3",
    frame: "2 × 3 格",
    largerFrame: "4 × 6 格",
  },
  transfer: {
    name: "站内换乘方向指示牌",
    short: "TRANSFER GUIDE",
    width: 1200,
    height: 400,
    exportWidth: 768,
    exportHeight: 256,
    ratio: "3:1",
    frame: "3 × 1 格",
    largerFrame: "6 × 2 格",
  },
};

const FACILITY_SPEC: SignSpec = {
  name: "站内公共设施导向牌",
  short: "FACILITY GUIDE",
  width: 1200,
  height: 400,
  exportWidth: 1536,
  exportHeight: 512,
  ratio: "3:1",
  frame: "3 × 1 格",
  largerFrame: "6 × 2 格",
};

const ROAD_SPEC: SignSpec = {
  name: "道路方向、路口与地界牌",
  short: "ROAD GUIDE",
  width: 800,
  height: 1000,
  exportWidth: 1024,
  exportHeight: 1280,
  ratio: "4:5",
  frame: "4 × 5 格",
  largerFrame: "8 × 10 格",
};

const EXAMPLE_DATA: SignData = {
  stationCn: "广州东站",
  stationEn: "GUANGZHOU EAST RAILWAY STATION",
  prevCn: "长宁",
  prevEn: "CHANGNING",
  nextCn: "临安",
  nextEn: "LIN'AN",
  lineName: "2号线",
  lineCode: "2",
  stationCode: "01-03",
  direction: "开往 培源",
  operator: "松铁集团广州局",
  platformNumber: "2",
  trackNumber: "3",
  statusCn: "终点站",
  statusEn: "TERMINUS",
};

const DEFAULT_TRANSFERS: TransferLine[] = [
  {
    id: 1,
    code: "1",
    name: "1号线",
    color: "#D7A92B",
    side: "right",
    destinationCn: "方向待设置",
    destinationEn: "DESTINATION",
    station: "current",
  },
];

const DEFAULT_FACILITY: FacilityData = {
  type: "exit",
  titleCn: "出口",
  titleEn: "EXIT",
  code: "B",
  destinationCn: "广州南站西广场",
  destinationEn: "GUANGZHOU SOUTH WEST SQUARE",
  arrow: "right",
};

const DEFAULT_ROAD: RoadData = {
  type: "crossroad",
  roadName: "站前大道",
  roadNameEn: "ZHANQIAN AVENUE",
  roadCode: "G105",
  subtitleCn: "欢迎进入广州番禺",
  subtitleEn: "WELCOME TO PANYU, GUANGZHOU",
  color: "#1754A3",
  destinations: [
    { id: 1, nameCn: "广州南站", nameEn: "GUANGZHOU SOUTH", distance: "500 m", direction: "straight" },
    { id: 2, nameCn: "石壁", nameEn: "SHIBI", distance: "1.2 km", direction: "left" },
    { id: 3, nameCn: "谢村", nameEn: "XIECUN", distance: "2 km", direction: "right" },
  ],
};

const DEFAULT_SIZE_SETTINGS: SizeSettings = {
  stationText: 100,
  transferBadge: 100,
};

const scaledSize = (size: number, percent: number) => Math.round(size * percent) / 100;

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="field-stack">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="control-input"
      />
    </div>
  );
}

function ColorInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="color-control">
      <input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value)} aria-label="选择颜色" />
      <span>{value.toUpperCase()}</span>
    </div>
  );
}

function ScaleControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="scale-control">
      <div className="scale-control-head">
        <span>{label}</span>
        <output>{value}%</output>
      </div>
      <div className="scale-control-row">
        <Scaling size={15} strokeWidth={1.9} aria-hidden="true" />
        <Slider
          value={[value]}
          min={70}
          max={120}
          step={5}
          onValueChange={(nextValue) => onChange(nextValue[0] ?? 100)}
          aria-label={label}
        />
      </div>
    </div>
  );
}

function DirectionArrow({
  x,
  y,
  direction,
  color,
  scale = 1,
}: {
  x: number;
  y: number;
  direction: "left" | "right";
  color: string;
  scale?: number;
}) {
  const tip = 54;
  const head = 23;
  const points =
    direction === "left"
      ? `${head},-17 0,0 ${head},17`
      : `${tip - head},-17 ${tip},0 ${tip - head},17`;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="7"
    >
      <line x1="2" y1="0" x2="52" y2="0" />
      <polyline points={points} />
    </g>
  );
}

function TransferMarks({
  lines,
  x,
  y,
  labelColor,
  compact = false,
  sizeScale = 100,
}: {
  lines: TransferLine[];
  x: number;
  y: number;
  labelColor: string;
  compact?: boolean;
  sizeScale?: number;
}) {
  if (!lines.length) return null;
  const gap = scaledSize(compact ? 62 : 66, sizeScale);
  const radius = scaledSize(compact ? 20 : 24, sizeScale);
  const labelX = scaledSize(compact ? -60 : -54, sizeScale);
  const total = (lines.length - 1) * gap;
  return (
    <g transform={`translate(${x - total / 2} ${y})`}>
      <text x={labelX} y="0" dominantBaseline="middle" textAnchor="end" fill={labelColor} fontSize={scaledSize(compact ? 17 : 18, sizeScale)} fontWeight="800">
        换乘
      </text>
      {lines.map((line, index) => (
        <g key={line.id} transform={`translate(${index * gap} 0)`}>
          <circle r={radius} fill={line.color} stroke="#fff" strokeWidth={scaledSize(compact ? 2 : 3, sizeScale)} />
          <text
            y="0"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#fff"
            fontSize={scaledSize(line.code.length > 2 ? 13 : compact ? 16 : 19, sizeScale)}
            fontWeight="800"
          >
            {line.code || "—"}
          </text>
          {!compact && line.name && (
            <text y={scaledSize(43, sizeScale)} textAnchor="middle" fill={labelColor} fontSize={scaledSize(12, sizeScale)} fontWeight="650">
              {line.name}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

const transfersAt = (lines: TransferLine[], station: StationSlot) => lines.filter((line) => line.station === station);

function StatusMark({
  status,
  data,
  x,
  y,
  color,
  dark = false,
}: {
  status: StationStatus;
  data: SignData;
  x: number;
  y: number;
  color: string;
  dark?: boolean;
}) {
  if (status === "normal") return null;
  const fill = status === "terminus" ? "#C63A32" : dark ? "#F1CF57" : color;
  const ink = status === "last" && dark ? "#183148" : "#fff";
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-90" y="-27" width="180" height="54" rx="5" fill={fill} />
      <text y="-3" textAnchor="middle" fill={ink} fontSize="19" fontWeight="800">
        {data.statusCn || (status === "terminus" ? "终点站" : "尾站")}
      </text>
      <text y="17" textAnchor="middle" fill={ink} fontSize="10" fontWeight="700" letterSpacing="1.2">
        {data.statusEn || (status === "terminus" ? "TERMINUS" : "END OF LINE")}
      </text>
    </g>
  );
}

function GuangzhouPlatformSign({
  data,
  color,
  transfers,
  status,
  sizes,
}: {
  data: SignData;
  color: string;
  transfers: TransferLine[];
  status: StationStatus;
  sizes: SizeSettings;
}) {
  const stationSize = Math.max(70, 122 - Math.max(0, data.stationCn.length - 4) * 11);
  const previousTransfers = transfersAt(transfers, "previous");
  const currentTransfers = transfersAt(transfers, "current");
  const nextTransfers = transfersAt(transfers, "next");
  return (
    <>
      <rect width="1200" height="400" rx="16" fill="#F7F7F2" />
      <rect width="1200" height="22" rx="16" fill={color} />
      <rect y="17" width="1200" height="9" fill={color} />
      <circle cx="94" cy="82" r="48" fill={color} />
      <text x="94" y="76" textAnchor="middle" fill="#fff" fontSize="31" fontWeight="850">{data.lineCode || "—"}</text>
      <text x="94" y="105" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="750">{data.stationCode}</text>
      <text x="164" y="72" fill="#4D555A" fontSize="24" fontWeight="750">{data.lineName}</text>
      {data.operator && <text x="1142" y="69" textAnchor="end" fill="#6E7478" fontSize="18" fontWeight="650">{data.operator}</text>}
      <text x="600" y="167" textAnchor="middle" fill="#172027" fontSize={scaledSize(stationSize, sizes.stationText)} fontWeight="850" letterSpacing="8">{data.stationCn || "未命名站"}</text>
      <text x="600" y="211" textAnchor="middle" fill="#565D62" fontSize={scaledSize(29, sizes.stationText)} fontWeight="700">{data.stationEn}</text>
      <TransferMarks lines={currentTransfers} x={600} y={247} labelColor="#596066" compact sizeScale={sizes.transferBadge} />
      <StatusMark status={status} data={data} x={1030} y={158} color={color} />
      <line x1="48" y1="272" x2="1152" y2="272" stroke="#D6D8D4" strokeWidth="2" />
      <DirectionArrow x={61} y={329} direction="left" color={color} scale={0.86} />
      <text x="136" y="318" fill="#2D3338" fontSize={scaledSize(37, sizes.stationText)} fontWeight="800">{data.prevCn || "—"}</text>
      <text x="136" y="355" fill="#6A7074" fontSize={scaledSize(20, sizes.stationText)} fontWeight="700" letterSpacing="1">{data.prevEn}</text>
      <TransferMarks lines={previousTransfers} x={316} y={331} labelColor="#60676C" compact sizeScale={sizes.transferBadge} />
      <DirectionArrow x={1086} y={329} direction="right" color={color} scale={0.86} />
      <text x="1049" y="318" textAnchor="end" fill="#2D3338" fontSize={scaledSize(37, sizes.stationText)} fontWeight="800">{data.nextCn || "—"}</text>
      <text x="1049" y="355" textAnchor="end" fill="#6A7074" fontSize={scaledSize(20, sizes.stationText)} fontWeight="700" letterSpacing="1">{data.nextEn}</text>
      <TransferMarks lines={nextTransfers} x={870} y={331} labelColor="#60676C" compact sizeScale={sizes.transferBadge} />
      {data.direction && (
        <>
          <rect x="475" y="303" width="250" height="52" rx="26" fill={color} />
          <text x="600" y="336" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="750">{data.direction}</text>
        </>
      )}
      <rect y="382" width="1200" height="18" fill={color} />
    </>
  );
}

function DongguanPlatformSign({
  data,
  color,
  transfers,
  status,
  sizes,
}: {
  data: SignData;
  color: string;
  transfers: TransferLine[];
  status: StationStatus;
  sizes: SizeSettings;
}) {
  const stationSize = Math.max(64, 104 - Math.max(0, data.stationCn.length - 4) * 9);
  // Keep the oversized Dongguan-style name clear of the dark header even when
  // the user increases its scale. The lower information band follows the name
  // and transfer badge so the extra breathing room does not create a new clash.
  const stationY = 190 + (sizes.stationText - 100) * 0.7;
  const stationEnY = stationY + 43;
  const currentTransferY = stationY + 76;
  const lowerBandY = Math.max(294, currentTransferY + scaledSize(20, sizes.transferBadge) + 6);
  const headerMeta = [data.lineName.trim(), data.stationCode.trim()].filter(Boolean).join(" · ");
  const previousTransfers = transfersAt(transfers, "previous");
  const currentTransfers = transfersAt(transfers, "current");
  const nextTransfers = transfersAt(transfers, "next");
  return (
    <>
      <rect width="1200" height="400" rx="14" fill="#fff" />
      <rect width="1200" height="88" rx="14" fill="#0C2D4C" />
      <rect y="74" width="1200" height="14" fill="#0C2D4C" />
      <circle cx="66" cy="44" r="26" fill="none" stroke="#fff" strokeWidth="5" />
      <path d="M48 44h36M66 26v36" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      {data.operator && <text x="107" y="52" fill="#fff" fontSize="24" fontWeight="750">{data.operator}</text>}
      {headerMeta && <text x="1140" y="52" textAnchor="end" fill="#fff" fontSize="23" fontWeight="700">{headerMeta}</text>}
      <text x="600" y={stationY} textAnchor="middle" fill="#10293E" fontSize={scaledSize(stationSize, sizes.stationText)} fontWeight="850" letterSpacing="7">{data.stationCn || "未命名站"}</text>
      <text x="600" y={stationEnY} textAnchor="middle" fill={color} fontSize={scaledSize(29, sizes.stationText)} fontWeight="750">{data.stationEn}</text>
      <TransferMarks lines={currentTransfers} x={600} y={currentTransferY} labelColor="#52626D" compact sizeScale={sizes.transferBadge} />
      <StatusMark status={status} data={data} x={1032} y={158} color={color} />
      <rect y={lowerBandY} width="600" height={400 - lowerBandY} fill="#ECF0F2" />
      <rect x="600" y={lowerBandY} width="600" height={400 - lowerBandY} fill={color} />
      <DirectionArrow x={56} y={lowerBandY + 58} direction="left" color="#0C2D4C" scale={0.86} />
      <text x="131" y={lowerBandY + 47} fill="#0C2D4C" fontSize={scaledSize(37, sizes.stationText)} fontWeight="800">{data.prevCn || "—"}</text>
      <text x="131" y={lowerBandY + 84} fill="#5E6D78" fontSize={scaledSize(20, sizes.stationText)} fontWeight="700">{data.prevEn}</text>
      <TransferMarks lines={previousTransfers} x={320} y={lowerBandY + 63} labelColor="#55656F" compact sizeScale={sizes.transferBadge} />
      <DirectionArrow x={1088} y={lowerBandY + 58} direction="right" color="#fff" scale={0.86} />
      <text x="1050" y={lowerBandY + 47} textAnchor="end" fill="#fff" fontSize={scaledSize(37, sizes.stationText)} fontWeight="800">{data.nextCn || "—"}</text>
      <text x="1050" y={lowerBandY + 84} textAnchor="end" fill="#fff" fontSize={scaledSize(20, sizes.stationText)} fontWeight="700">{data.nextEn}</text>
      <TransferMarks lines={nextTransfers} x={873} y={lowerBandY + 63} labelColor="#fff" compact sizeScale={sizes.transferBadge} />
      {data.direction && (
        <>
          <rect x="490" y={lowerBandY + 25} width="220" height="66" rx="5" fill="#fff" stroke="#D9E0E4" strokeWidth="2" />
          <text x="600" y={lowerBandY + 65} textAnchor="middle" fill="#0C2D4C" fontSize="19" fontWeight="750">{data.direction}</text>
        </>
      )}
    </>
  );
}

function IntercityPlatformSign({
  data,
  color,
  transfers,
  status,
  sizes,
}: {
  data: SignData;
  color: string;
  transfers: TransferLine[];
  status: StationStatus;
  sizes: SizeSettings;
}) {
  const stationSize = Math.max(68, 112 - Math.max(0, data.stationCn.length - 4) * 10);
  const hasCodeCard = Boolean(data.lineCode.trim() || data.stationCode.trim() || data.direction.trim());
  const previousTransfers = transfersAt(transfers, "previous");
  const currentTransfers = transfersAt(transfers, "current");
  const nextTransfers = transfersAt(transfers, "next");
  return (
    <>
      <rect width="1200" height="400" rx="14" fill="#F9FBFA" />
      <rect width="1200" height="76" rx="14" fill="#173C4A" />
      <rect y="64" width="1200" height="12" fill="#173C4A" />
      <rect x="38" y="17" width="112" height="42" rx="3" fill="#D83B32" />
      <text x="94" y="45" textAnchor="middle" fill="#fff" fontSize="21" fontWeight="800">广东城际</text>
      {data.operator && <text x="175" y="45" fill="#fff" fontSize="21" fontWeight="700">{data.operator}</text>}
      <text x="1140" y="45" textAnchor="end" fill="#DDE9E8" fontSize="20" fontWeight="650">{data.lineName}</text>
      <text x="64" y="188" fill="#152F39" fontSize={scaledSize(stationSize, sizes.stationText)} fontWeight="850" letterSpacing="7">{data.stationCn || "未命名站"}</text>
      <text x="68" y="232" fill={color} fontSize={scaledSize(29, sizes.stationText)} fontWeight="750">{data.stationEn}</text>
      {hasCodeCard && (
        <g>
          <rect x="948" y="105" width="182" height="92" rx="6" fill={color} />
          {(data.lineCode.trim() || data.stationCode.trim()) && <text x="1039" y="143" textAnchor="middle" fill="#fff" fontSize="23" fontWeight="800">{[data.lineCode.trim(), data.stationCode.trim()].filter(Boolean).join(" · ")}</text>}
          {data.direction.trim() && <text x="1039" y="174" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="650">{data.direction}</text>}
        </g>
      )}
      <TransferMarks lines={currentTransfers} x={755} y={226} labelColor="#596B72" compact sizeScale={sizes.transferBadge} />
      <StatusMark status={status} data={data} x={819} y={151} color={color} />
      <line x1="68" y1="286" x2="1132" y2="286" stroke={color} strokeWidth="12" />
      <circle cx="600" cy="286" r="27" fill="#fff" stroke={color} strokeWidth="10" />
      <circle cx="116" cy="286" r="16" fill={color} />
      <circle cx="1084" cy="286" r="16" fill={color} />
      <text x="116" y="333" textAnchor="middle" fill="#173C4A" fontSize={scaledSize(34, sizes.stationText)} fontWeight="800">{data.prevCn || "—"}</text>
      <text x="116" y="366" textAnchor="middle" fill="#60727A" fontSize={scaledSize(19, sizes.stationText)} fontWeight="700">{data.prevEn}</text>
      <TransferMarks lines={previousTransfers} x={286} y={340} labelColor="#60727A" compact sizeScale={sizes.transferBadge} />
      <text x="1084" y="333" textAnchor="middle" fill="#173C4A" fontSize={scaledSize(34, sizes.stationText)} fontWeight="800">{data.nextCn || "—"}</text>
      <text x="1084" y="366" textAnchor="middle" fill="#60727A" fontSize={scaledSize(19, sizes.stationText)} fontWeight="700">{data.nextEn}</text>
      <TransferMarks lines={nextTransfers} x={908} y={340} labelColor="#60727A" compact sizeScale={sizes.transferBadge} />
      <text x="600" y="337" textAnchor="middle" fill="#173C4A" fontSize="19" fontWeight="750">本站 · CURRENT</text>
      <text x="600" y="363" textAnchor="middle" fill="#60727A" fontSize="14" fontWeight="650">{data.stationCode}</text>
    </>
  );
}

function RailwayPlatformSign({
  data,
  color,
  transfers,
  status,
  sizes,
}: {
  data: SignData;
  color: string;
  transfers: TransferLine[];
  status: StationStatus;
  sizes: SizeSettings;
}) {
  const stationSize = Math.max(72, 130 - Math.max(0, data.stationCn.length - 4) * 12);
  const headerMeta = [data.lineName.trim(), data.stationCode.trim()].filter(Boolean).join(" · ");
  const previousTransfers = transfersAt(transfers, "previous");
  const currentTransfers = transfersAt(transfers, "current");
  const nextTransfers = transfersAt(transfers, "next");
  return (
    <>
      <rect width="1200" height="400" rx="12" fill={color} />
      <rect width="1200" height="15" fill="#D8362A" />
      <rect x="45" y="36" width="82" height="50" rx="3" fill="#D8362A" />
      <text x="86" y="69" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="850">CR</text>
      {data.operator && <text x="151" y="68" fill="#fff" fontSize="23" fontWeight="700">{data.operator}</text>}
      {headerMeta && <text x="1145" y="68" textAnchor="end" fill="#D9E4ED" fontSize="21" fontWeight="650">{headerMeta}</text>}
      <text x="600" y="188" textAnchor="middle" fill="#fff" fontSize={scaledSize(stationSize, sizes.stationText)} fontWeight="850" letterSpacing="10">{data.stationCn || "未命名站"}</text>
      <text x="600" y="235" textAnchor="middle" fill="#F4D056" fontSize={scaledSize(30, sizes.stationText)} fontWeight="750">{data.stationEn}</text>
      <TransferMarks lines={currentTransfers} x={600} y={264} labelColor="#D9E4ED" compact sizeScale={sizes.transferBadge} />
      <StatusMark status={status} data={data} x={1035} y={158} color={color} dark />
      <line x1="49" y1="296" x2="1151" y2="296" stroke="#88A1B8" strokeWidth="2" />
      <DirectionArrow x={58} y={350} direction="left" color="#fff" scale={0.86} />
      <text x="134" y="342" fill="#fff" fontSize={scaledSize(37, sizes.stationText)} fontWeight="800">{data.prevCn || "—"}</text>
      <text x="134" y="378" fill="#BFD0DE" fontSize={scaledSize(20, sizes.stationText)} fontWeight="700">{data.prevEn}</text>
      <TransferMarks lines={previousTransfers} x={320} y={356} labelColor="#D7E0E7" compact sizeScale={sizes.transferBadge} />
      <text x="600" y="346" textAnchor="middle" fill="#F4D056" fontSize="21" fontWeight="750">{data.direction}</text>
      <DirectionArrow x={1088} y={350} direction="right" color="#fff" scale={0.86} />
      <text x="1050" y="342" textAnchor="end" fill="#fff" fontSize={scaledSize(37, sizes.stationText)} fontWeight="800">{data.nextCn || "—"}</text>
      <text x="1050" y="378" textAnchor="end" fill="#BFD0DE" fontSize={scaledSize(20, sizes.stationText)} fontWeight="700">{data.nextEn}</text>
      <TransferMarks lines={nextTransfers} x={875} y={356} labelColor="#D7E0E7" compact sizeScale={sizes.transferBadge} />
    </>
  );
}

function HangingSign({
  styleId,
  data,
  color,
  transfers,
  status,
  sizes,
}: {
  styleId: StyleId;
  data: SignData;
  color: string;
  transfers: TransferLine[];
  status: StationStatus;
  sizes: SizeSettings;
}) {
  const dark = styleId === "railway";
  const header = dark ? "#153B63" : styleId === "guangzhou" ? color : STYLES[styleId].header;
  const background = dark ? "#102E4D" : "#F8F9F7";
  const ink = dark ? "#fff" : "#172B36";
  const muted = dark ? "#C4D3DF" : "#66737A";
  const lower = dark ? "#0A223B" : "#E8ECEB";
  const hasPlatform = Boolean(data.platformNumber.trim());
  const hasTrack = Boolean(data.trackNumber.trim());
  const hasRailMeta = hasPlatform || hasTrack;
  const previousTransfers = transfersAt(transfers, "previous");
  const currentTransfers = transfersAt(transfers, "current");
  const nextTransfers = transfersAt(transfers, "next");
  const hasCurrentTransfers = currentTransfers.length > 0;
  const stationX = hasRailMeta ? 690 : 600;
  const stationY = hasCurrentTransfers ? 228 : 246;
  const stationMeta = [data.stationCode.trim(), data.direction.trim()].filter(Boolean).join(" · ");
  const stationSize = Math.max(72, 108 - Math.max(0, data.stationCn.length - 4) * 9);
  return (
    <>
      <rect width="1200" height="600" rx="14" fill={background} />
      <rect width="1200" height="92" rx="14" fill={header} />
      <rect y="78" width="1200" height="14" fill={header} />
      <rect x="35" y="20" width="76" height="50" rx="4" fill={dark ? "#D6382D" : "#fff"} fillOpacity={dark ? 1 : 0.94} />
      <text x="73" y="45" dominantBaseline="middle" textAnchor="middle" fill={dark ? "#fff" : header} fontSize="22" fontWeight="850">{styleId === "railway" ? "CR" : data.lineCode || "R"}</text>
      {data.operator.trim() && <text x="135" y="46" dominantBaseline="middle" fill="#fff" fontSize="25" fontWeight="780">{data.operator}</text>}
      {data.lineName.trim() && <text x="1155" y="46" dominantBaseline="middle" textAnchor="end" fill="#fff" fontSize="22" fontWeight="700">{data.lineName}</text>}

      {hasRailMeta && (
        <g>
          <rect x="40" y="125" width="225" height="230" rx="9" fill={dark ? "#214D78" : "#fff"} stroke={dark ? "#507596" : "#D6DBD8"} strokeWidth="3" />
          <text x="152" y="158" textAnchor="middle" fill={muted} fontSize="15" fontWeight="750">乘车位置 · BOARDING</text>
          {hasPlatform && (
            <g transform={`translate(${hasTrack ? 96 : 152} 0)`}>
              <text y="202" textAnchor="middle" fill={muted} fontSize="16" fontWeight="750">站台</text>
              <text y="286" textAnchor="middle" fill={dark ? "#F4D056" : color} fontSize="92" fontWeight="880">{data.platformNumber}</text>
              <text y="322" textAnchor="middle" fill={muted} fontSize="14" fontWeight="700">PLATFORM</text>
            </g>
          )}
          {hasPlatform && hasTrack && <line x1="152" y1="190" x2="152" y2="326" stroke={dark ? "#507596" : "#D6DBD8"} strokeWidth="2" />}
          {hasTrack && (
            <g transform={`translate(${hasPlatform ? 207 : 152} 0)`}>
              <text y="202" textAnchor="middle" fill={muted} fontSize="16" fontWeight="750">股道</text>
              <text y="286" textAnchor="middle" fill={dark ? "#F4D056" : color} fontSize="92" fontWeight="880">{data.trackNumber}</text>
              <text y="322" textAnchor="middle" fill={muted} fontSize="14" fontWeight="700">TRACK</text>
            </g>
          )}
        </g>
      )}

      <text x={stationX} y={stationY} textAnchor="middle" fill={ink} fontSize={scaledSize(stationSize, sizes.stationText)} fontWeight="850" letterSpacing="8">{data.stationCn || "未命名站"}</text>
      {data.stationEn.trim() && <text x={stationX} y={stationY + 46} textAnchor="middle" fill={dark ? "#F4D056" : color} fontSize={scaledSize(31, sizes.stationText)} fontWeight="750">{data.stationEn}</text>}
      {stationMeta && <text x={stationX} y={stationY + 80} textAnchor="middle" fill={muted} fontSize="18" fontWeight="700">{stationMeta}</text>}
      {hasCurrentTransfers && <TransferMarks lines={currentTransfers} x={stationX} y={stationY + 118} labelColor={muted} compact sizeScale={sizes.transferBadge} />}
      <StatusMark status={status} data={data} x={1040} y={stationY - 16} color={color} dark={dark} />

      <rect y="410" width="1200" height="190" fill={lower} />
      <DirectionArrow x={54} y={510} direction="left" color={ink} />
      <text x="135" y="494" fill={ink} fontSize={scaledSize(39, sizes.stationText)} fontWeight="820">{data.prevCn || "—"}</text>
      <text x="135" y="536" fill={muted} fontSize={scaledSize(21, sizes.stationText)} fontWeight="700">{data.prevEn}</text>
      <TransferMarks lines={previousTransfers} x={350} y={514} labelColor={muted} compact sizeScale={sizes.transferBadge} />
      <DirectionArrow x={1092} y={510} direction="right" color={ink} />
      <text x="1052" y="494" textAnchor="end" fill={ink} fontSize={scaledSize(39, sizes.stationText)} fontWeight="820">{data.nextCn || "—"}</text>
      <text x="1052" y="536" textAnchor="end" fill={muted} fontSize={scaledSize(21, sizes.stationText)} fontWeight="700">{data.nextEn}</text>
      <TransferMarks lines={nextTransfers} x={854} y={514} labelColor={muted} compact sizeScale={sizes.transferBadge} />
      {data.direction.trim() && (
        <g>
          <rect x="482" y="474" width="236" height="74" rx="5" fill={dark ? "#F4D056" : color} />
          <text x="600" y="519" textAnchor="middle" fill={dark ? "#17344F" : "#fff"} fontSize="22" fontWeight="800">{data.direction}</text>
        </g>
      )}
    </>
  );
}

function EndBoardSign({
  styleId,
  data,
  color,
  transfers,
  status,
  sizes,
}: {
  styleId: StyleId;
  data: SignData;
  color: string;
  transfers: TransferLine[];
  status: StationStatus;
  sizes: SizeSettings;
}) {
  const header = styleId === "railway" ? "#153B63" : styleId === "guangzhou" ? color : STYLES[styleId].header;
  const ink = "#17313E";
  const muted = "#65747B";
  const previousTransfers = transfersAt(transfers, "previous").slice(0, 3);
  const currentTransfers = transfersAt(transfers, "current").slice(0, 3);
  const nextTransfers = transfersAt(transfers, "next").slice(0, 3);
  const stationSize = Math.max(72, 106 - Math.max(0, data.stationCn.length - 4) * 9);
  const currentTransferY = 380;
  const routeTop = currentTransfers.length ? 462 : 420;
  const routeBottom = 1040;
  const rowNameX = 310;
  const inlineTransferX = (name: string) => Math.min(700, rowNameX + Math.max(1, Math.min(name.length, 6)) * scaledSize(46, sizes.stationText) + scaledSize(110, sizes.transferBadge));
  const renderRouteRow = (cn: string, en: string, lines: TransferLine[], y: number) => {
    if (!cn.trim()) return null;
    return (
      <g>
        <circle cx="188" cy={y} r="14" fill={color} />
        <text x={rowNameX} y={y - 4} fill={ink} fontSize={scaledSize(42, sizes.stationText)} fontWeight="830">{cn}</text>
        {lines.length > 0 && <TransferMarks lines={lines} x={inlineTransferX(cn)} y={y - 17} labelColor={muted} compact sizeScale={sizes.transferBadge} />}
        {en.trim() && <text x={rowNameX} y={y + 31} fill={muted} fontSize={scaledSize(18, sizes.stationText)} fontWeight="680">{en}</text>}
      </g>
    );
  };
  return (
    <>
      <rect width="800" height="1200" rx="18" fill="#F8F9F7" />
      <rect width="800" height="102" rx="18" fill={header} />
      <rect y="86" width="800" height="16" fill={header} />
      <rect x="36" y="23" width="78" height="52" rx="4" fill={styleId === "railway" ? "#D6382D" : "#fff"} />
      <text x="75" y="58" textAnchor="middle" fill={styleId === "railway" ? "#fff" : header} fontSize="22" fontWeight="850">{styleId === "railway" ? "CR" : data.lineCode || "R"}</text>
      {data.operator.trim() && <text x="135" y="58" fill="#fff" fontSize="25" fontWeight="780">{data.operator}</text>}
      {data.lineName.trim() && <text x="756" y="58" textAnchor="end" fill="#fff" fontSize="21" fontWeight="700">{data.lineName}</text>}

      <text x="400" y="252" textAnchor="middle" fill={ink} fontSize={scaledSize(stationSize, sizes.stationText)} fontWeight="860" letterSpacing="7">{data.stationCn || "未命名站"}</text>
      {data.stationEn.trim() && <text x="400" y="304" textAnchor="middle" fill={color} fontSize={scaledSize(30, sizes.stationText)} fontWeight="760">{data.stationEn}</text>}
      {currentTransfers.length > 0 && <TransferMarks lines={currentTransfers} x={400} y={currentTransferY} labelColor={muted} compact sizeScale={sizes.transferBadge} />}

      <line x1="188" y1={routeTop} x2="188" y2={routeBottom} stroke="#C8CECB" strokeWidth="14" />
      <line x1="188" y1={routeTop} x2="188" y2={routeBottom} stroke={color} strokeWidth="6" />
      {renderRouteRow(data.prevCn, data.prevEn, previousTransfers, routeTop + 90)}
      <circle cx="188" cy={routeTop + 300} r="29" fill="#fff" stroke={color} strokeWidth="10" />
      <text x="188" y={routeTop + 308} textAnchor="middle" fill={color} fontSize="17" fontWeight="850">此</text>
      <text x="310" y={routeTop + 306} fill={color} fontSize="28" fontWeight="830">本站 · CURRENT</text>
      <StatusMark status={status} data={data} x={606} y={routeTop + 298} color={color} />
      {renderRouteRow(data.nextCn, data.nextEn, nextTransfers, routeTop + 510)}
      {data.direction.trim() && (
        <g>
          <rect x="88" y="1090" width="624" height="72" rx="5" fill={color} />
          <text x="400" y="1135" textAnchor="middle" fill="#fff" fontSize="27" fontWeight="820">{data.direction}</text>
        </g>
      )}
      <rect y="1182" width="800" height="18" fill={styleId === "railway" ? "#D6382D" : color} />
    </>
  );
}

function TransferGuideSign({ data, color, transfers, sizes }: { data: SignData; color: string; transfers: TransferLine[]; sizes: SizeSettings }) {
  const currentLines = transfersAt(transfers, "current");
  const leftLines = currentLines.filter((line) => line.side === "left").slice(0, 3);
  const rightLines = currentLines.filter((line) => line.side === "right").slice(0, 3);
  const stationSize = Math.max(54, 78 - Math.max(0, data.stationCn.length - 5) * 7);
  const renderDirectionRows = (lines: TransferLine[], side: TransferSide) => {
    const baseX = side === "left" ? 94 : 664;
    if (!lines.length) {
      return <text x={side === "left" ? 300 : 900} y="292" textAnchor="middle" fill="#7F8B92" fontSize="20" fontWeight="700">此方向暂无换乘线路</text>;
    }
    return lines.map((line, index) => {
      const y = 246 + index * 54;
      return (
        <g key={line.id}>
          <circle cx={baseX} cy={y} r={scaledSize(26, sizes.transferBadge)} fill={line.color} stroke="#fff" strokeWidth={scaledSize(3, sizes.transferBadge)} />
          <text x={baseX} y={y + scaledSize(7, sizes.transferBadge)} textAnchor="middle" fill="#fff" fontSize={scaledSize(line.code.length > 2 ? 14 : 20, sizes.transferBadge)} fontWeight="850">{line.code || "—"}</text>
          <text x={baseX + 45} y={y - 3} fill="#fff" fontSize="25" fontWeight="820">{line.name || `${line.code}号线`}</text>
          <text x={baseX + 45} y={y + 23} fill="#B8C5CC" fontSize="15" fontWeight="700">{line.destinationCn || "方向待设置"}　{line.destinationEn}</text>
        </g>
      );
    });
  };
  return (
    <>
      <rect width="1200" height="400" rx="14" fill="#17262F" />
      <rect width="1200" height="146" rx="14" fill="#F8F9F7" />
      <rect y="134" width="1200" height="12" fill={color} />
      <rect x="30" y="18" width="172" height="40" rx="20" fill={color} />
      <text x="116" y="44" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="820">当前位置 · HERE</text>
      <text x="600" y="82" textAnchor="middle" fill="#17262F" fontSize={scaledSize(stationSize, sizes.stationText)} fontWeight="860" letterSpacing="6">{data.stationCn || "未命名站"}</text>
      {data.stationEn.trim() && <text x="600" y="119" textAnchor="middle" fill="#5C686E" fontSize={scaledSize(25, sizes.stationText)} fontWeight="760">{data.stationEn}</text>}

      <line x1="600" y1="164" x2="600" y2="376" stroke="#344650" strokeWidth="2" />
      <DirectionArrow x={54} y={180} direction="left" color={color} scale={1.06} />
      <text x="137" y="176" fill="#fff" fontSize="29" fontWeight="840">向左换乘</text>
      <text x="137" y="203" fill="#AEBBC2" fontSize="15" fontWeight="700">TRANSFER LEFT</text>
      <DirectionArrow x={1088} y={180} direction="right" color={color} scale={1.06} />
      <text x="1054" y="176" textAnchor="end" fill="#fff" fontSize="29" fontWeight="840">向右换乘</text>
      <text x="1054" y="203" textAnchor="end" fill="#AEBBC2" fontSize="15" fontWeight="700">TRANSFER RIGHT</text>
      {renderDirectionRows(leftLines, "left")}
      {renderDirectionRows(rightLines, "right")}
      <rect y="388" width="1200" height="12" fill={color} />
    </>
  );
}

function StationSign({
  styleId,
  mode,
  data,
  color,
  transfers,
  status,
  sizes,
}: {
  styleId: StyleId;
  mode: SignMode;
  data: SignData;
  color: string;
  transfers: TransferLine[];
  status: StationStatus;
  sizes: SizeSettings;
}) {
  const spec = MODES[mode];
  return (
    <svg
      id="sign-preview"
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${data.stationCn}站牌预览`}
    >
      <title>{`${data.stationCn || "未命名"}站牌`}</title>
      {mode === "station" && styleId === "guangzhou" && (
        <GuangzhouPlatformSign data={data} color={color} transfers={transfers} status={status} sizes={sizes} />
      )}
      {mode === "station" && styleId === "dongguan" && (
        <DongguanPlatformSign data={data} color={color} transfers={transfers} status={status} sizes={sizes} />
      )}
      {mode === "station" && styleId === "intercity" && (
        <IntercityPlatformSign data={data} color={color} transfers={transfers} status={status} sizes={sizes} />
      )}
      {mode === "station" && styleId === "railway" && (
        <RailwayPlatformSign data={data} color={color} transfers={transfers} status={status} sizes={sizes} />
      )}
      {mode === "hanging" && (
        <HangingSign styleId={styleId} data={data} color={color} transfers={transfers} status={status} sizes={sizes} />
      )}
      {mode === "endboard" && (
        <EndBoardSign styleId={styleId} data={data} color={color} transfers={transfers} status={status} sizes={sizes} />
      )}
      {mode === "transfer" && (
        <TransferGuideSign data={data} color={color} transfers={transfers} sizes={sizes} />
      )}
    </svg>
  );
}

function SignArrow({ x, y, direction, color, scale = 1 }: { x: number; y: number; direction: ArrowDirection; color: string; scale?: number }) {
  const rotation = direction === "left" ? -90 : direction === "right" ? 90 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
      <line x1="0" y1="58" x2="0" y2="2" />
      <polyline points="-22,24 0,2 22,24" />
    </g>
  );
}

function FacilitySign({ data, color }: { data: FacilityData; color: string }) {
  const renderIcon = () => {
    if (data.type === "service") {
      return <g><circle cx="144" cy="184" r="70" fill="none" stroke="#fff" strokeWidth="12" /><text x="144" y="220" textAnchor="middle" fill="#fff" fontSize="105" fontWeight="850">i</text></g>;
    }
    if (data.type === "ticket") {
      return <g><path d="M76 126h136v116H76z" fill="none" stroke="#fff" strokeWidth="12" /><path d="M112 126v116M145 155h42M145 184h42M145 213h28" stroke="#fff" strokeWidth="9" strokeLinecap="round" /></g>;
    }
    return (
      <g>
        <path d="M82 252V104h124v148M102 252V126h82v126" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="143" cy="143" r="14" fill="#fff" />
        <path d="M143 166v42m0-24l-25 24m25-24l27 21m-27 3l-20 37m20-37l28 34" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <path d={data.type === "entrance" ? "M78 286h82m-24-22 24 22-24 22" : "M206 286h-82m24-22-24 22 24 22"} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  return (
    <svg id="sign-preview" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${data.titleCn}标识预览`}>
      <title>{data.titleCn}站内公共标识</title>
      <rect width="1200" height="400" rx="18" fill="#F8F9F7" />
      <rect width="286" height="400" rx="18" fill={color} />
      <rect x="268" width="18" height="400" fill={color} />
      {renderIcon()}
      <text x="350" y="170" fill="#17262F" fontSize="94" fontWeight="880">{data.titleCn || "未命名标识"}</text>
      <text x="354" y="222" fill={color} fontSize="32" fontWeight="800">{data.titleEn}</text>
      {(data.destinationCn.trim() || data.destinationEn.trim()) && (
        <g>
          <line x1="350" y1="266" x2="930" y2="266" stroke="#D5DAD7" strokeWidth="3" />
          <text x="354" y="317" fill="#34434A" fontSize="28" fontWeight="760">{data.destinationCn}</text>
          <text x="354" y="350" fill="#748087" fontSize="17" fontWeight="650">{data.destinationEn}</text>
        </g>
      )}
      {data.code.trim() && <g><rect x="1015" y="42" width="132" height="80" rx="8" fill={color} /><text x="1081" y="96" textAnchor="middle" fill="#fff" fontSize="48" fontWeight="880">{data.code}</text></g>}
      {data.arrow !== "none" && <SignArrow x={1100} y={274} direction={data.arrow === "up" ? "up" : data.arrow} color={color} scale={1.35} />}
      <rect y="384" width="1200" height="16" fill={color} />
    </svg>
  );
}

function RoadSign({ data }: { data: RoadData }) {
  const rows = data.destinations.slice(0, 4);
  const isJunction = data.type === "crossroad" || data.type === "tjunction";
  const renderCompactRow = (item: RoadDestination, index: number) => {
    const y = 595 + index * 92;
    return (
      <g key={item.id}>
        <rect x="54" y={y - 50} width="692" height="76" rx="5" fill="#fff" fillOpacity="0.08" />
        <SignArrow x={104} y={y - 10} direction={item.direction} color="#fff" scale={0.62} />
        <text x="166" y={y - 17} fill="#fff" fontSize="36" fontWeight="850">{item.nameCn || "未命名地点"}</text>
        <text x="168" y={y + 13} fill="#DCEAF7" fontSize="17" fontWeight="700">{item.nameEn}</text>
        <text x="710" y={y - 2} textAnchor="end" fill="#fff" fontSize="28" fontWeight="820">{item.distance}</text>
      </g>
    );
  };
  return (
    <svg id="sign-preview" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="道路方向牌预览">
      <title>道路方向与路口预告牌</title>
      <rect width="800" height="1000" rx="20" fill={data.color} />
      <rect x="22" y="22" width="756" height="956" rx="10" fill="none" stroke="#fff" strokeWidth="8" />
      <text x="54" y="80" fill="#fff" fontSize="33" fontWeight="820">{data.type === "boundary" ? "行政区域界" : data.roadName || "道路方向信息"}</text>
      {data.type !== "boundary" && data.roadNameEn.trim() && <text x="55" y="111" fill="#DCEAF7" fontSize="16" fontWeight="700">{data.roadNameEn}</text>}
      {data.roadCode.trim() && <g><rect x="617" y="45" width="128" height="64" rx="6" fill="#C93632" stroke="#fff" strokeWidth="4" /><text x="681" y="88" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="850">{data.roadCode}</text></g>}

      {isJunction && (
        <g>
          <text x="54" y="156" fill="#DCEAF7" fontSize="17" fontWeight="720">{data.type === "tjunction" ? "T 字路口预告" : "十字路口预告"}</text>
          {data.type === "crossroad" ? (
            <path d="M400 492V218M400 350H178M400 350H622" fill="none" stroke="#fff" strokeWidth="25" strokeLinecap="square" />
          ) : (
            <path d="M400 492V280M400 280H178M400 280H622" fill="none" stroke="#fff" strokeWidth="25" strokeLinecap="square" />
          )}
          {data.type === "crossroad" && <SignArrow x={400} y={205} direction="up" color="#fff" scale={1.05} />}
          <SignArrow x={164} y={data.type === "crossroad" ? 350 : 280} direction="left" color="#fff" scale={1.05} />
          <SignArrow x={636} y={data.type === "crossroad" ? 350 : 280} direction="right" color="#fff" scale={1.05} />
          <circle cx="400" cy="486" r="15" fill="#fff" />
          <text x="400" y="527" textAnchor="middle" fill="#DCEAF7" fontSize="16" fontWeight="720">车辆来向 · APPROACH</text>
          {rows.map(renderCompactRow)}
        </g>
      )}

      {data.type === "direction" && rows.map((item, index) => {
        const y = 205 + index * 184;
        return <g key={item.id}><rect x="54" y={y - 56} width="692" height="150" rx="6" fill="#fff" fillOpacity="0.07" /><SignArrow x={112} y={y + 17} direction={item.direction} color="#fff" scale={0.86} /><text x="198" y={y + 2} fill="#fff" fontSize="43" fontWeight="840">{item.nameCn || "未命名地点"}</text><text x="200" y={y + 39} fill="#DCEAF7" fontSize="19" fontWeight="690">{item.nameEn}</text><text x="704" y={y + 20} textAnchor="end" fill="#fff" fontSize="29" fontWeight="800">{item.distance}</text></g>;
      })}

      {data.type === "distance" && (
        <g>
          <text x="400" y="190" textAnchor="middle" fill="#fff" fontSize="46" fontWeight="840">前方地点距离</text>
          <text x="400" y="225" textAnchor="middle" fill="#DCEAF7" fontSize="18" fontWeight="700">DESTINATION DISTANCE</text>
          {rows.map((item, index) => {
            const y = 330 + index * 145;
            return <g key={item.id}><rect x="64" y={y - 60} width="672" height="112" rx="6" fill="#fff" fillOpacity="0.08" /><text x="102" y={y - 9} fill="#fff" fontSize="38" fontWeight="830">{item.nameCn || "未命名地点"}</text><text x="104" y={y + 26} fill="#DCEAF7" fontSize="17" fontWeight="690">{item.nameEn}</text><text x="700" y={y + 4} textAnchor="end" fill="#fff" fontSize="32" fontWeight="830">{item.distance}</text></g>;
          })}
        </g>
      )}

      {data.type === "boundary" && (
        <g>
          <circle cx="400" cy="238" r="46" fill="none" stroke="#fff" strokeWidth="10" />
          <path d="M400 204v68M376 228h48" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
          <text x="400" y="418" textAnchor="middle" fill="#fff" fontSize={Math.max(62, 108 - Math.max(0, data.roadName.length - 4) * 10)} fontWeight="880" letterSpacing="6">{data.roadName || "未命名地区"}</text>
          {data.roadNameEn.trim() && <text x="400" y="478" textAnchor="middle" fill="#DCEAF7" fontSize="28" fontWeight="760">{data.roadNameEn}</text>}
          <line x1="106" y1="555" x2="694" y2="555" stroke="#fff" strokeWidth="4" />
          {data.subtitleCn.trim() && <text x="400" y="656" textAnchor="middle" fill="#fff" fontSize="43" fontWeight="820">{data.subtitleCn}</text>}
          {data.subtitleEn.trim() && <text x="400" y="704" textAnchor="middle" fill="#DCEAF7" fontSize="20" fontWeight="700">{data.subtitleEn}</text>}
          <text x="400" y="898" textAnchor="middle" fill="#DCEAF7" fontSize="18" fontWeight="720">BOUNDARY / PLACE IDENTIFICATION</text>
        </g>
      )}
    </svg>
  );
}

export default function Home() {
  const [systemId] = useState<SystemId>("station");
  const [styleId, setStyleId] = useState<StyleId>("guangzhou");
  const [mode, setMode] = useState<SignMode>("station");
  const [data, setData] = useState<SignData>({ ...EXAMPLE_DATA });
  const [color, setColor] = useState(STYLES.guangzhou.color);
  const [transfers, setTransfers] = useState<TransferLine[]>(DEFAULT_TRANSFERS.map((line) => ({ ...line })));
  const [status, setStatus] = useState<StationStatus>("normal");
  const [sizes, setSizes] = useState<SizeSettings>({ ...DEFAULT_SIZE_SETTINGS });
  const [facility, setFacility] = useState<FacilityData>({ ...DEFAULT_FACILITY });
  const [road, setRoad] = useState<RoadData>({ ...DEFAULT_ROAD, destinations: DEFAULT_ROAD.destinations.map((item) => ({ ...item })) });
  const style = STYLES[styleId];
  const system = SYSTEMS[systemId];
  const activeSpec = systemId === "station" ? MODES[mode] : systemId === "facility" ? FACILITY_SPEC : ROAD_SPEC;
  const previewKey = systemId === "station" ? mode : systemId;
  const activeColor = systemId === "road" ? road.color : color;
  const activeTitle = systemId === "station" ? style.name : systemId === "facility" ? `${facility.titleCn || "公共设施"}标识` : road.type === "boundary" ? "地界与地点识别牌" : "道路指路标志体系";

  const filename = useMemo(() => {
    const sourceName = systemId === "station" ? data.stationCn : systemId === "facility" ? facility.titleCn : road.roadName;
    const safeName = sourceName.trim().replace(/[\\/:*?"<>|\s]+/g, "-") || "gafacraft-sign";
    return `${safeName}-${systemId}-${systemId === "station" ? mode : systemId === "facility" ? facility.type : road.type}.png`;
  }, [data.stationCn, facility.titleCn, facility.type, mode, road.roadName, road.type, systemId]);

  const update = (key: keyof SignData, value: string) => setData((current) => ({ ...current, [key]: value }));
  const updateSize = (key: keyof SizeSettings, value: number) => setSizes((current) => ({ ...current, [key]: value }));
  const updateFacility = (key: keyof FacilityData, value: string) => setFacility((current) => ({ ...current, [key]: value }));
  const changeStyle = (id: StyleId) => { setStyleId(id); setColor(STYLES[id].color); };
  const changeFacilityType = (type: FacilityType) => {
    const labels: Record<FacilityType, { cn: string; en: string; code: string }> = {
      exit: { cn: "出口", en: "EXIT", code: "B" },
      entrance: { cn: "入口", en: "ENTRANCE", code: "A" },
      ticket: { cn: "购票", en: "TICKETS", code: "" },
      service: { cn: "客户服务中心", en: "CUSTOMER SERVICE", code: "" },
    };
    setFacility((current) => ({ ...current, type, titleCn: labels[type].cn, titleEn: labels[type].en, code: labels[type].code }));
  };
  const updateRoad = (key: "roadName" | "roadNameEn" | "roadCode" | "subtitleCn" | "subtitleEn" | "color", value: string) => setRoad((current) => ({ ...current, [key]: value }));
  const updateRoadDestination = (id: number, key: keyof Omit<RoadDestination, "id">, value: string) => {
    setRoad((current) => ({ ...current, destinations: current.destinations.map((item) => item.id === id ? { ...item, [key]: value } : item) }));
  };
  const addRoadDestination = () => {
    setRoad((current) => {
      if (current.destinations.length >= 4) return current;
      const directions: ArrowDirection[] = ["straight", "left", "right", "up"];
      return { ...current, destinations: [...current.destinations, { id: Date.now(), nameCn: "新地点", nameEn: "NEW DESTINATION", distance: "1 km", direction: directions[current.destinations.length] }] };
    });
  };
  const removeRoadDestination = (id: number) => {
    setRoad((current) => current.destinations.length <= 1 ? current : { ...current, destinations: current.destinations.filter((item) => item.id !== id) });
  };

  const addTransfer = (station: StationSlot) => {
    const stationLines = transfersAt(transfers, station);
    if (stationLines.length >= 4) return;
    const palette = ["#D7A92B", "#E27A2B", "#B23A48", "#4A78C2", "#6B4BA1"];
    const number = stationLines.length + 1;
    setTransfers((current) => [...current, {
      id: Date.now(), code: String(number), name: `${number}号线`, color: palette[(current.length + 1) % palette.length],
      side: number % 2 === 0 ? "right" : "left", destinationCn: "方向待设置", destinationEn: "DESTINATION", station,
    }]);
  };
  const updateTransfer = (id: number, key: keyof Omit<TransferLine, "id">, value: string) => setTransfers((current) => current.map((line) => line.id === id ? { ...line, [key]: value } : line));
  const removeTransfer = (id: number) => setTransfers((current) => current.filter((line) => line.id !== id));
  const changeStatus = (nextStatus: StationStatus) => {
    setStatus(nextStatus);
    if (nextStatus === "terminus") setData((current) => ({ ...current, statusCn: "终点站", statusEn: "TERMINUS" }));
    if (nextStatus === "last") setData((current) => ({ ...current, statusCn: "尾站", statusEn: "END OF LINE" }));
  };

  const reset = () => {
    setData({ ...EXAMPLE_DATA });
    setColor(STYLES[styleId].color);
    setTransfers(DEFAULT_TRANSFERS.map((line) => ({ ...line })));
    setStatus("normal");
    setSizes({ ...DEFAULT_SIZE_SETTINGS });
    setFacility({ ...DEFAULT_FACILITY });
    setRoad({ ...DEFAULT_ROAD, destinations: DEFAULT_ROAD.destinations.map((item) => ({ ...item })) });
  };
  const swapStations = () => {
    setData((current) => ({ ...current, prevCn: current.nextCn, prevEn: current.nextEn, nextCn: current.prevCn, nextEn: current.prevEn }));
    setTransfers((current) => current.map((line) => ({ ...line, station: line.station === "previous" ? "next" : line.station === "next" ? "previous" : "current" })));
  };

  const downloadPng = () => {
    const svg = document.getElementById("sign-preview") as SVGSVGElement | null;
    if (!svg) return;
    const copy = svg.cloneNode(true) as SVGSVGElement;
    copy.setAttribute("width", String(activeSpec.exportWidth));
    copy.setAttribute("height", String(activeSpec.exportHeight));
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const source = new XMLSerializer().serializeToString(copy);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = activeSpec.exportWidth;
      canvas.height = activeSpec.exportHeight;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, activeSpec.exportWidth, activeSpec.exportHeight);
      canvas.toBlob((png) => {
        if (!png) return;
        const pngUrl = URL.createObjectURL(png);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    image.src = url;
  };

  const stationSlots: StationSlot[] = mode === "transfer" ? ["current"] : ["previous", "current", "next"];
  const slotName = (slot: StationSlot) => slot === "previous" ? (data.prevCn || "前一站") : slot === "current" ? (data.stationCn || "本站") : (data.nextCn || "后一站");

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><TrainFront size={21} strokeWidth={2.2} /></div>
          <div><div className="brand-title">GAFAcraft 标识工坊</div><div className="brand-subtitle">TRANSIT & WAYFINDING WORKSHOP · 12.0</div></div>
        </div>
        <div className="status-mark"><span /> 沉浸画框适配</div>
      </header>

      <div className="workspace-grid">
        <aside className="control-panel" aria-label="标识设置">
          <section className="control-section control-section-top">
            <div className="system-summary system-summary-active"><strong>{system.index}</strong><div><span>当前开放 · {system.short}</span>{system.name}</div></div>

            {systemId === "station" && <>
              <div className="field-stack"><Label htmlFor="mode-select">牌型</Label><Select value={mode} onValueChange={(value) => setMode(value as SignMode)}><SelectTrigger id="mode-select" className="control-select"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(MODES).map(([id, item]) => <SelectItem key={id} value={id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="field-stack"><Label htmlFor="style-select">视觉体系</Label><Select value={styleId} onValueChange={(value) => changeStyle(value as StyleId)}><SelectTrigger id="style-select" className="control-select"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STYLES).map(([id, item]) => <SelectItem key={id} value={id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
            </>}

            {systemId === "facility" && <>
              <div className="field-stack"><Label htmlFor="facility-type">标识类型</Label><Select value={facility.type} onValueChange={(value) => changeFacilityType(value as FacilityType)}><SelectTrigger id="facility-type" className="control-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="exit">出口标识</SelectItem><SelectItem value="entrance">入口标识</SelectItem><SelectItem value="ticket">购票标识</SelectItem><SelectItem value="service">客户服务中心</SelectItem></SelectContent></Select></div>
              <div className="field-stack"><Label htmlFor="facility-style">视觉体系</Label><Select value={styleId} onValueChange={(value) => changeStyle(value as StyleId)}><SelectTrigger id="facility-style" className="control-select"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STYLES).map(([id, item]) => <SelectItem key={id} value={id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
            </>}

            {systemId === "road" && <div className="field-stack"><Label htmlFor="road-type">道路牌型</Label><Select value={road.type} onValueChange={(value) => setRoad((current) => ({ ...current, type: value as RoadType }))}><SelectTrigger id="road-type" className="control-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="crossroad">十字路口预告</SelectItem><SelectItem value="tjunction">T 字路口预告</SelectItem><SelectItem value="direction">分方向导引牌</SelectItem><SelectItem value="distance">地点距离牌</SelectItem><SelectItem value="boundary">地界 / 地名牌</SelectItem></SelectContent></Select></div>}

            <div className="frame-note"><span>画框比例</span><strong>{activeSpec.ratio}</strong><small>推荐 {activeSpec.frame} · 每格按 256 px 导出 · 放大可用 {activeSpec.largerFrame}</small></div>
          </section>

          <section className="control-section grow-section">
            <div className="section-kicker">{system.index} / 内容与参数</div>

            {systemId === "station" && <Tabs defaultValue="station" className="editor-tabs">
              <TabsList className="editor-tabs-list editor-tabs-list-three"><TabsTrigger value="station">站点</TabsTrigger><TabsTrigger value="line">线路</TabsTrigger><TabsTrigger value="transfer">换乘 / 状态</TabsTrigger></TabsList>
              <TabsContent value="station" className="fields-area">
                <div className="subsection-label">本站名称</div>
                <Field id="station-cn" label="中文站名" value={data.stationCn} onChange={(value) => update("stationCn", value)} placeholder="留空则显示未命名站" />
                <Field id="station-en" label="英文站名" value={data.stationEn} onChange={(value) => update("stationEn", value.toUpperCase())} placeholder="可留空" />
                <div className="subsection-label">尺寸微调</div>
                <div className="size-controls">
                  <ScaleControl label="站名文字大小" value={sizes.stationText} onChange={(value) => updateSize("stationText", value)} />
                  <ScaleControl label="换乘图标大小" value={sizes.transferBadge} onChange={(value) => updateSize("transferBadge", value)} />
                </div>
                {mode !== "transfer" && <><div className="subsection-label">相邻车站</div><div className="two-column-fields"><Field id="prev-cn" label="前一站中文" value={data.prevCn} onChange={(value) => update("prevCn", value)} /><Field id="next-cn" label="后一站中文" value={data.nextCn} onChange={(value) => update("nextCn", value)} /></div><div className="two-column-fields"><Field id="prev-en" label="前一站英文" value={data.prevEn} onChange={(value) => update("prevEn", value.toUpperCase())} /><Field id="next-en" label="后一站英文" value={data.nextEn} onChange={(value) => update("nextEn", value.toUpperCase())} /></div></>}
                {mode === "transfer" && <div className="mode-note">换乘方向牌只读取本站名称和本站换乘线路。</div>}
              </TabsContent>
              <TabsContent value="line" className="fields-area">
                <div className="field-stack"><Label htmlFor="line-color">主识别色</Label><ColorInput id="line-color" value={color} onChange={setColor} /></div>
                {mode !== "transfer" && <><Field id="line-name" label="线路名称" value={data.lineName} onChange={(value) => update("lineName", value)} placeholder="留空则整行隐藏" /><div className="two-column-fields"><Field id="line-code" label="线路编号" value={data.lineCode} onChange={(value) => update("lineCode", value.toUpperCase())} /><Field id="station-code" label="车站编号" value={data.stationCode} onChange={(value) => update("stationCode", value.toUpperCase())} /></div><Field id="direction" label="运行方向" value={data.direction} onChange={(value) => update("direction", value)} placeholder="留空则整块隐藏" /><Field id="operator" label="运营单位" value={data.operator} onChange={(value) => update("operator", value)} placeholder="留空则整行隐藏" />{mode === "hanging" && <><div className="subsection-label">站台与股道 · 可独立留空</div><div className="two-column-fields"><Field id="platform-number" label="站台号" value={data.platformNumber} onChange={(value) => update("platformNumber", value)} placeholder="留空即移除" /><Field id="track-number" label="股道号" value={data.trackNumber} onChange={(value) => update("trackNumber", value)} placeholder="留空即移除" /></div></>}</>}
                {mode === "transfer" && <div className="mode-note">此牌型不显示运营单位、站台号、股道号和线路名称。</div>}
              </TabsContent>
              <TabsContent value="transfer" className="fields-area">
                <div className="mode-note">每个站点独立管理换乘。点击站名右侧的“＋”，即可只为该站添加线路。</div>
                <div className="station-transfer-list">
                  {stationSlots.map((slot) => {
                    const slotLines = transfersAt(transfers, slot);
                    return <div className="station-transfer-card" key={slot}><div className="station-transfer-head"><div><span>{slot === "previous" ? "前一站" : slot === "current" ? "本站" : "后一站"}</span><strong>{slotName(slot)}</strong><small>{slotLines.length} 条换乘</small></div><Button size="icon-sm" variant="outline" onClick={() => addTransfer(slot)} disabled={slotLines.length >= 4} aria-label={`为${slotName(slot)}添加换乘`}><Plus /></Button></div>{slotLines.length === 0 && <button type="button" className="transfer-add-empty" onClick={() => addTransfer(slot)}><Plus /> 添加该站换乘线路</button>}{slotLines.map((line, index) => <div className="transfer-row" key={line.id}><div className="transfer-index" style={{ backgroundColor: line.color }}>{line.code || index + 1}</div><div className="transfer-fields"><Input value={line.code} onChange={(event) => updateTransfer(line.id, "code", event.target.value.toUpperCase())} placeholder="编号" className="control-input" /><Input value={line.name} onChange={(event) => updateTransfer(line.id, "name", event.target.value)} placeholder="线路名称" className="control-input" /><ColorInput id={`transfer-color-${line.id}`} value={line.color} onChange={(value) => updateTransfer(line.id, "color", value)} />{mode === "transfer" && <><Select value={line.side} onValueChange={(value) => updateTransfer(line.id, "side", value)}><SelectTrigger className="control-select transfer-side-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">向左</SelectItem><SelectItem value="right">向右</SelectItem></SelectContent></Select><Input value={line.destinationCn} onChange={(event) => updateTransfer(line.id, "destinationCn", event.target.value)} placeholder="目的地方向" className="control-input" /><Input value={line.destinationEn} onChange={(event) => updateTransfer(line.id, "destinationEn", event.target.value.toUpperCase())} placeholder="DESTINATION" className="control-input transfer-destination-en" /></>}</div><Button size="icon-sm" variant="ghost" onClick={() => removeTransfer(line.id)} aria-label="删除换乘线路"><X /></Button></div>)}</div>;
                  })}
                </div>
                {mode !== "transfer" && <><div className="subsection-label">车站状态标识</div><div className="field-stack"><Label htmlFor="status-select">标识类型</Label><Select value={status} onValueChange={(value) => changeStatus(value as StationStatus)}><SelectTrigger id="status-select" className="control-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">普通车站 · 不显示</SelectItem><SelectItem value="terminus">终点站标识</SelectItem><SelectItem value="last">尾站 / 线路尽头标识</SelectItem></SelectContent></Select></div>{status !== "normal" && <div className="two-column-fields"><Field id="status-cn" label="标识中文" value={data.statusCn} onChange={(value) => update("statusCn", value)} /><Field id="status-en" label="标识英文" value={data.statusEn} onChange={(value) => update("statusEn", value.toUpperCase())} /></div>}</>}
              </TabsContent>
            </Tabs>}

            {systemId === "facility" && <div className="fields-area"><div className="subsection-label">主要文字</div><Field id="facility-cn" label="中文名称" value={facility.titleCn} onChange={(value) => updateFacility("titleCn", value)} /><Field id="facility-en" label="英文名称" value={facility.titleEn} onChange={(value) => updateFacility("titleEn", value.toUpperCase())} /><Field id="facility-code" label="出入口 / 分区编号" value={facility.code} onChange={(value) => updateFacility("code", value.toUpperCase())} placeholder="可留空" /><div className="subsection-label">指向地点</div><Field id="facility-destination-cn" label="地点中文" value={facility.destinationCn} onChange={(value) => updateFacility("destinationCn", value)} /><Field id="facility-destination-en" label="地点英文" value={facility.destinationEn} onChange={(value) => updateFacility("destinationEn", value.toUpperCase())} /><div className="two-column-fields"><div className="field-stack"><Label htmlFor="facility-arrow">箭头方向</Label><Select value={facility.arrow} onValueChange={(value) => updateFacility("arrow", value)}><SelectTrigger id="facility-arrow" className="control-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">向左</SelectItem><SelectItem value="right">向右</SelectItem><SelectItem value="up">直行 / 向上</SelectItem><SelectItem value="none">不显示</SelectItem></SelectContent></Select></div><div className="field-stack"><Label htmlFor="facility-color">主识别色</Label><ColorInput id="facility-color" value={color} onChange={setColor} /></div></div></div>}

            {systemId === "road" && <div className="fields-area">
              {road.type === "boundary" ? <>
                <div className="subsection-label">地界与地点名称</div>
                <Field id="road-name" label="地名中文" value={road.roadName} onChange={(value) => updateRoad("roadName", value)} />
                <Field id="road-name-en" label="地名英文" value={road.roadNameEn} onChange={(value) => updateRoad("roadNameEn", value.toUpperCase())} />
                <div className="two-column-fields"><Field id="road-subtitle-cn" label="欢迎语 / 行政区" value={road.subtitleCn} onChange={(value) => updateRoad("subtitleCn", value)} /><Field id="road-code" label="国道 / 区域编号" value={road.roadCode} onChange={(value) => updateRoad("roadCode", value.toUpperCase())} /></div>
                <Field id="road-subtitle-en" label="欢迎语英文" value={road.subtitleEn} onChange={(value) => updateRoad("subtitleEn", value.toUpperCase())} />
              </> : <>
                <div className="two-column-fields"><Field id="road-name" label="道路名称" value={road.roadName} onChange={(value) => updateRoad("roadName", value)} /><Field id="road-code" label="道路编号" value={road.roadCode} onChange={(value) => updateRoad("roadCode", value.toUpperCase())} /></div>
                <Field id="road-name-en" label="道路英文" value={road.roadNameEn} onChange={(value) => updateRoad("roadNameEn", value.toUpperCase())} />
              </>}
              <div className="field-stack"><Label htmlFor="road-color">道路牌底色</Label><ColorInput id="road-color" value={road.color} onChange={(value) => updateRoad("color", value)} /></div>
              {road.type !== "boundary" && <>
                <div className="road-editor-head"><div><div className="subsection-label subsection-label-tight">方向 / 地点</div><small>按需要添加 1—4 个方向</small></div><Button size="sm" variant="outline" onClick={addRoadDestination} disabled={road.destinations.length >= 4}><Plus /> 添加方向</Button></div>
                <div className="road-destination-list">{road.destinations.map((item, index) => <div className="road-destination-card" key={item.id}><div className="road-card-head"><strong>方向 {index + 1}</strong><Button size="icon-sm" variant="ghost" onClick={() => removeRoadDestination(item.id)} disabled={road.destinations.length <= 1} aria-label={`删除方向 ${index + 1}`}><X /></Button></div><div className="two-column-fields"><Field id={`road-cn-${item.id}`} label="中文地点" value={item.nameCn} onChange={(value) => updateRoadDestination(item.id, "nameCn", value)} /><Field id={`road-en-${item.id}`} label="英文地点" value={item.nameEn} onChange={(value) => updateRoadDestination(item.id, "nameEn", value.toUpperCase())} /></div><div className="two-column-fields"><Field id={`road-distance-${item.id}`} label="距离" value={item.distance} onChange={(value) => updateRoadDestination(item.id, "distance", value)} /><div className="field-stack"><Label htmlFor={`road-direction-${item.id}`}>箭头方向</Label><Select value={item.direction} onValueChange={(value) => updateRoadDestination(item.id, "direction", value)}><SelectTrigger id={`road-direction-${item.id}`} className="control-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="straight">直行</SelectItem><SelectItem value="left">向左</SelectItem><SelectItem value="right">向右</SelectItem><SelectItem value="up">向上</SelectItem></SelectContent></Select></div></div></div>)}</div>
              </>}
            </div>}
          </section>

          <div className={`control-actions ${systemId !== "station" || mode === "transfer" ? "control-actions-single" : ""}`}>
            {systemId === "station" && mode !== "transfer" && <Button variant="outline" onClick={swapStations} className="secondary-action"><ArrowLeftRight /> 对调前后站</Button>}
            {systemId !== "station" || mode === "transfer" ? <Button variant="outline" onClick={reset} className="secondary-action"><RotateCcw /> 恢复示例</Button> : <Button variant="ghost" onClick={reset} className="reset-action" aria-label="恢复示例"><RotateCcw /></Button>}
          </div>
        </aside>

        <section className="preview-panel" aria-label="标识预览">
          <div className="preview-toolbar"><div><div className="preview-eyebrow">LIVE PREVIEW / 实时预览</div><div className="preview-style-line"><span className="style-swatch" style={{ backgroundColor: activeColor }} />{activeTitle}<span className="style-code">{activeSpec.short}</span></div></div><Button onClick={downloadPng} className="download-button"><Download /> 下载 PNG</Button></div>
          <div className={`preview-stage preview-stage-${previewKey}`}><div className="stage-index stage-index-a">A</div><div className="stage-index stage-index-b">B</div><div className={`sign-frame sign-frame-${previewKey}`}>
            {systemId === "station" && <StationSign styleId={styleId} mode={mode} data={data} color={color} transfers={transfers} status={status} sizes={sizes} />}
            {systemId === "facility" && <FacilitySign data={facility} color={color} />}
            {systemId === "road" && <RoadSign data={road} />}
          </div><div className="dimension-line dimension-top"><span>{activeSpec.width}</span></div><div className="dimension-line dimension-side"><span>{activeSpec.height}</span></div></div>
          <div className="preview-footer"><div className="spec-block"><span>标识类型</span><strong>{activeSpec.name}</strong></div><div className="spec-block"><span>推荐画框 · {activeSpec.ratio}</span><strong>{activeSpec.frame}</strong><small>远距离可放大为 {activeSpec.largerFrame}</small></div><div className="spec-block"><span>导出尺寸</span><strong>{activeSpec.exportWidth} × {activeSpec.exportHeight} px</strong></div></div>
          <div className="legal-note"><span>非官方设计工具</span>用于 GAFAcraft 服务器内容创作；推荐尺寸按 Immersive Paintings 每格 256 px 整理。</div>
        </section>
      </div>
    </main>
  );
}
