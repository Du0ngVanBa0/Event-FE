export interface ZoneShape {
  id: string;
  type: 'rectangle' | 'square' | 'circle' | 'triangle' | 'polygon';
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  color: string;
  borderColor: string;
  borderWidth: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  labelVisible: boolean;
  labelPosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
  templateId?: string; // Reference to template
  properties?: {
    radius?: number;
    points?: number[];
    cornerRadius?: number;
  };
}

export interface ZoneCanvas {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface ZoneDesignData {
  eventId: string;
  canvasSettings: ZoneCanvas;
  zones: ZoneShape[];
  version: number;
  lastModified: Date;
}

export interface KhuVucTemplate {
  maKhuVucMau: string;
  tenKhuVuc: string;
  moTa: string;
  mauSac: string;
  hinhDang: string;
  thuTuHienThi: number;
  hoatDong: boolean;
  toaDoXMacDinh?: number;
  toaDoYMacDinh?: number;
  chieuRongMacDinh?: number;
  chieuCaoMacDinh?: number;
  tenTuyChon?: string;
  moTaTuyChon?: string;
  mauSacTuyChon?: string;
}