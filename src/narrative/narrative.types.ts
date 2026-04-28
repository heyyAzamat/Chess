export type FactionId = "aurora" | "nova";
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type ChessColor = "white" | "black";

export type TriggerEvent =
  | "game_start"
  | "move_number"
  | "piece_captured"
  | "checkmate";

export type DialogueStyle =
  | "cold" | "quiet" | "whisper" | "calm"
  | "cracked" | "broken" | "cold-broken" | "lost" | "sad";

export interface FactionTheme {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

export interface Faction {
  id: FactionId;
  name: string;
  tagline: string;
  motto: string;
  description: string;
  theme: FactionTheme;
  aesthetic: string;
  logo: string;
}

export interface PieceVisual {
  colors: string[];
  icon: string;
  glowColor: string;
}

export interface PieceCharacter {
  type: PieceType;
  faction: FactionId;
  name?: string;
  names?: string[];
  title: string;
  quote: string;
  bio: string;
  personality: string[];
  promotionQuote?: string;
  visual: PieceVisual;
}

export interface Dialogue {
  character: string;
  faction: FactionId;
  bubble: string;
  style: DialogueStyle;
}

export interface PanelVisual {
  layout: string;
  description: string;
  mood: string;
  colorDominant: string;
}

export interface ComicPanel {
  index: number;
  visual: PanelVisual;
  caption: string | null;
  dialogues: Dialogue[];
  isFinale?: boolean;
}

export interface TriggerCondition {
  move?: number;
  piece?: PieceType;
}

export interface PanelTrigger {
  event: TriggerEvent;
  condition: TriggerCondition | null;
}

export interface ComicScene {
  id: string;
  trigger: PanelTrigger;
  title: string;
  panelCount: number;
  panels: ComicPanel[];
}

export interface FontConfig {
  headline: string[];
  dialogue: string[];
  system: string[];
  caption: string[];
}

export interface EffectsConfig {
  neonGlow: boolean;
  glowBlur: string;
  paperTexture: boolean;
  paperOpacity: number;
  flatColors: boolean;
  noGradients: boolean;
  hardShadows: boolean;
}

export interface BubbleStyle {
  borderWidth: string;
  borderColor: string;
  tailStyle: string;
  fontSizeDialogue: string;
  fontSizeCaption: string;
  letterSpacing: string;
  lineHeight: number;
}

export interface VisualStyle {
  name: string;
  outlineWidth: string;
  outlineColor: string;
  halftonePattern: boolean;
  halftoneOpacity: number;
  speedLinesOnCapture: boolean;
  panelBorderStyle: string;
  fonts: FontConfig;
  colorPalette: Record<string, string>;
  effects: EffectsConfig;
  panelTransition: string;
  bubbleStyle: BubbleStyle;
}

export interface CaptureFlavorTexts {
  pawn: string[];
  knight: string[];
  bishop: string[];
  rook: string[];
  queen: string[];
  king: string[];
}

export interface NarrativeData {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  factions: Record<ChessColor, Faction>;
  pieces: Record<ChessColor, Record<PieceType, PieceCharacter>>;
  comicPanels: ComicScene[];
  captureFlavorTexts: CaptureFlavorTexts;
  visualStyle: VisualStyle;
}
