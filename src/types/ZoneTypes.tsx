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
  properties?: {
    radius?: number; // for circle
    points?: number[]; // for triangle/polygon
    cornerRadius?: number; // for rounded rectangle
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