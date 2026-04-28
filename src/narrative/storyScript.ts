import type { ChessColor, PieceType } from "./narrative.types";

export type StoryTrigger =
  | "game_start"
  | "move_5"
  | "first_capture_player"
  | "first_capture_opponent"
  | "castling"
  | "check_given"
  | "check_received"
  | "move_10"
  | "pawn_promotion_player"
  | "pawn_promotion_opponent"
  | "move_20"
  | "knight_strike"
  | "move_30"
  | "queen_captured_player"
  | "queen_captured_opponent"
  | "checkmate_win"
  | "checkmate_loss"
  | "stalemate";

export interface StoryMoment {
  id: string;
  trigger: StoryTrigger;
  character: string;
  title: string;
  faction: "aurora" | "nova";
  pieceType: PieceType;
  pieceColor: ChessColor;
  dialogue: string;
  caption?: string;
  mood: "cold" | "intense" | "quiet" | "shock" | "dark" | "hopeful" | "broken";
}

export const STORY_SCRIPT: StoryMoment[] = [
  {
    id: "start_valent",
    trigger: "game_start",
    character: "Директор Валент Кейн",
    title: "Директор Протокола",
    faction: "aurora",
    pieceType: "king",
    pieceColor: "white",
    dialogue: "Протокол «Судный День» активирован.\nНикакой пощады. Никаких переговоров.",
    caption: "Война за Оракул началась.",
    mood: "cold",
  },

  {
    id: "move5_pawn",
    trigger: "move_5",
    character: "Страж Протокола",
    title: "Рядовой состав",
    faction: "aurora",
    pieceType: "pawn",
    pieceColor: "white",
    dialogue: "Я иду вперёд.\nНе потому что не боюсь.\nА потому что моя семья смотрит.",
    mood: "quiet",
  },

  {
    id: "first_capture_player",
    trigger: "first_capture_player",
    character: "Командор Аэла Вост",
    title: "Командор Первого Удара",
    faction: "aurora",
    pieceType: "queen",
    pieceColor: "white",
    dialogue: "Первая кровь.\nТак просто.",
    caption: "Она не смотрит на то, что упало.",
    mood: "cold",
  },

  {
    id: "first_capture_opponent",
    trigger: "first_capture_opponent",
    character: "Призрак Кира",
    title: "Легенда Подполья",
    faction: "nova",
    pieceType: "queen",
    pieceColor: "black",
    dialogue: "Вы только что потеряли бойца.\nПомните его имя.",
    caption: "Каждый потерянный — был человеком.",
    mood: "dark",
  },

  {
    id: "castling",
    trigger: "castling",
    character: "Директор Валент Кейн",
    title: "Директор Протокола",
    faction: "aurora",
    pieceType: "king",
    pieceColor: "white",
    dialogue: "Система защищает меня.\nЯ неуязвим.",
    caption: "Или так только кажется.",
    mood: "cold",
  },

  {
    id: "check_given",
    trigger: "check_given",
    character: "Призрак Кира",
    title: "Легенда Подполья",
    faction: "nova",
    pieceType: "queen",
    pieceColor: "black",
    dialogue: "Ваш Король знает, что я рядом.\nПусть боится.",
    mood: "intense",
  },

  {
    id: "check_received",
    trigger: "check_received",
    character: "Командор Аэла Вост",
    title: "Командор Первого Удара",
    faction: "aurora",
    pieceType: "queen",
    pieceColor: "white",
    dialogue: "Шах.\nЭто предупреждение.\nСледующий раз — мат.",
    mood: "shock",
  },

  {
    id: "move10_zed",
    trigger: "move_10",
    character: "Патриарх Зед Аркан",
    title: "Основатель Новы",
    faction: "nova",
    pieceType: "king",
    pieceColor: "black",
    dialogue: "Десять ходов.\nВойна только начинается,\nдочка.",
    caption: "Он слишком стар, чтобы бежать.",
    mood: "quiet",
  },

  {
    id: "knight_strike",
    trigger: "knight_strike",
    character: "Тень Флэш",
    title: "Партизан-Мотоциклист",
    faction: "nova",
    pieceType: "knight",
    pieceColor: "black",
    dialogue: "Мы не атакуем по прямой.\nПрямая — это ловушка.",
    mood: "intense",
  },

  {
    id: "promotion_player",
    trigger: "pawn_promotion_player",
    character: "Страж Протокола",
    title: "Получил Имя",
    faction: "aurora",
    pieceType: "pawn",
    pieceColor: "white",
    dialogue: "Я дошёл.\nСтраж получил имя.\nТеперь я — нечто большее.",
    caption: "Пешка, дошедшая до края, уже не пешка.",
    mood: "hopeful",
  },

  {
    id: "promotion_opponent",
    trigger: "pawn_promotion_opponent",
    character: "Ребёнок Нижнего Яруса",
    title: "Нова · Рядовой состав",
    faction: "nova",
    pieceType: "pawn",
    pieceColor: "black",
    dialogue: "Нам уже нечего терять.\nПоэтому нам не страшно.\nДаже здесь.",
    caption: "Клетка из золота — всё равно клетка.",
    mood: "hopeful",
  },

  {
    id: "move20_prophet",
    trigger: "move_20",
    character: "Пророк Нихт",
    title: "Слепой Информатор",
    faction: "nova",
    pieceType: "bishop",
    pieceColor: "black",
    dialogue: "Я вижу конец.\nОн близко.\nИ он не таков, каким вы его представляли.",
    mood: "dark",
  },

  {
    id: "move30_flash",
    trigger: "move_30",
    character: "Тень Дарт",
    title: "Партизан-Мотоциклист",
    faction: "nova",
    pieceType: "knight",
    pieceColor: "black",
    dialogue: "Почти конец.\nНепредсказуемые всегда\nприходят последними.",
    mood: "intense",
  },

  {
    id: "queen_cap_aurora",
    trigger: "queen_captured_player",
    character: "Командор Аэла Вост",
    title: "Командор Первого Удара",
    faction: "aurora",
    pieceType: "queen",
    pieceColor: "white",
    dialogue: "Маска треснула.\nОна не ожидала этого.",
    caption: "Впервые — без маски.",
    mood: "broken",
  },

  {
    id: "queen_cap_nova",
    trigger: "queen_captured_opponent",
    character: "Призрак Кира",
    title: "Легенда Подполья",
    faction: "nova",
    pieceType: "queen",
    pieceColor: "black",
    dialogue: "Я погибла.\nМеня заменит она.",
    caption: "Легенда не умирает вместе с человеком.",
    mood: "broken",
  },

  {
    id: "checkmate_win",
    trigger: "checkmate_win",
    character: "Патриарх Зед Аркан",
    title: "Основатель Новы",
    faction: "nova",
    pieceType: "king",
    pieceColor: "black",
    dialogue: "Добро пожаловать на Нижний Ярус.\nЗдесь начинается настоящая жизнь.",
    caption: "Эдем-0 услышал их.",
    mood: "quiet",
  },

  {
    id: "checkmate_loss",
    trigger: "checkmate_loss",
    character: "Директор Валент Кейн",
    title: "Директор Протокола",
    faction: "aurora",
    pieceType: "king",
    pieceColor: "white",
    dialogue: "...Я не думал,\nчто это возможно.",
    caption: "Первый раз за двадцать лет — тишина.",
    mood: "broken",
  },

  {
    id: "stalemate",
    trigger: "stalemate",
    character: "Патриарх Зед Аркан",
    title: "Основатель Новы",
    faction: "nova",
    pieceType: "king",
    pieceColor: "black",
    dialogue: "Иногда ничья —\nэто тоже победа.\nНад страхом.",
    mood: "quiet",
  },
];
