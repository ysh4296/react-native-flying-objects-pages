type EventName = 'MOUSE' | 'JOINT' | 'CREATE';

type NoneType = 'NONE';

type MouseType = NoneType | 'DRAG' | 'JOINT' | 'CREATE' | 'EDIT';

type JointType = NoneType | 'FORCE' | 'SPRING' | 'REVERSE' | 'FIXED' | 'HINGE';

type CreateType =
  | NoneType
  | 'RECTANGLE'
  | 'CIRCLE'
  | 'WATERBLOCK'
  | 'BACONBLOCK'
  | 'BREADBLOCK'
  // | 'ESCALATOR'
  | 'SPRING'
  | 'GRILL'
  | 'WHEEL';

type EventType = NoneType | MouseType | JointType | CreateType;

type CameraType = {
  x: number;
  y: number;
  scale: number;
};

type defaultRegistryType = {
  createdId: number;
  selectedObjectId: number;
  mouseEventType: MouseType;
  setMouseEventType: (mouseType: MouseType) => void;
  jointEventType: JointType;
  createEventType: CreateType;
  animationOffset: number;
  gamePhase: GamePhase;
};

type GamePhase = 'play' | 'pause';
