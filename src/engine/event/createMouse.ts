import BaconBlock from '@engine/lib/block/baconBlock';
import BreadBlock from '@engine/lib/block/breadBlock';
import Spring from '@engine/lib/block/mover/spring';
import WaterBlock from '@engine/lib/block/waterBlock';
import Circle from '@engine/lib/rigidbody/circle';
import Engine from '@engine/lib/engine';
import getMousePosition from '@engine/lib/getMousePosition';
import { registry } from '@engine/lib/main';
import Rectangle from '@rigidbody/rectangle';
import RigidBody from '@rigidbody/rigidbody';
import Vector, { subVector } from '@engine/lib/vector';
import { assertUnreachableChecker } from '@utils/typeChecker';
import Fan from '@engine/lib/component/fan';
import Heater from '@engine/lib/component/heater';
import Pressure from '@engine/lib/component/pressure';
import Component from '@engine/lib/component/component';
import Escalator from '@engine/lib/component/escalator';
import Grinder from '@engine/lib/component/grinder';
import Matter from '@engine/lib/matter';
import Charactor from '@engine/lib/game/charactor';
import { skillData } from '@engine/lib/game/data/skillData';

export default class CreateMouse {
  start: Vector;
  end: Vector;
  mousePosition: Vector;
  isEdit: boolean;
  target: RigidBody;
  // for some special creation / ex) escalator
  additionalTarget: Vector;
  additionalTargetSelected: boolean;

  constructor() {
    this.start = new Vector({ x: 0, y: 0 });
    this.end = new Vector({ x: 0, y: 0 });

    this.target = new RigidBody(new Circle(new Vector({ x: 0, y: 0 }), 5, 'black'), 0);
    this.mousePosition = new Vector({ x: 0, y: 0 });
    this.isEdit = false;
    this.additionalTargetSelected = false;
    this.additionalTarget = new Vector({ x: 0, y: 0 });
  }

  mouseMove(e: MouseEvent, canvas: HTMLCanvasElement, engine: Engine) {
    let mousePosition: Vector = getMousePosition(canvas, e);
    this.mousePosition = mousePosition;

    if (this.mousePosition.isOut()) return;
    this.target.shape.move(
      subVector(
        engine.GameBoard.cellIdToCenteroid(
          engine.GameBoard.getCellIdFromPosition(this.mousePosition),
        ),
        this.target.shape.centroid,
      ),
    );
  }

  mouseDown(e: MouseEvent, canvas: HTMLCanvasElement, engine: Engine) {
    this.start = this.mousePosition;
    this.isEdit = true;
  }

  mouseUp(e: MouseEvent, canvas: HTMLCanvasElement, engine: Engine) {
    this.end = this.mousePosition;
    let component;
    switch (registry.createEventType) {
      case 'NONE':
        break;
      case 'RECTANGLE':
        component = new Component(new Vector(this.target.shape.centroid));
        component.objects.push(
          new RigidBody(
            new Rectangle(
              new Vector(this.target.shape.centroid),
              registry.engine.GameBoard.cellSize,
              registry.engine.GameBoard.cellSize,
              'green',
            ),
            1,
          ),
        );
        registry.engine.components.push(component);
        break;
      case 'WATERBLOCK':
        component = new Component(new Vector(this.target.shape.centroid));
        component.objects.push(
          new WaterBlock(
            new Vector(this.target.shape.centroid),
            registry.engine.GameBoard.cellSize,
            registry.engine.GameBoard.cellSize,
            'blue',
          ),
        );
        registry.engine.components.push(component);
        break;
      case 'CIRCLE':
        component = new Component(new Vector(this.target.shape.centroid));
        const circle = new RigidBody(
          new Circle(
            new Vector(this.target.shape.centroid),
            registry.engine.GameBoard.cellSize / 4,
            'green',
          ),
          0,
        );

        circle.matter = new Matter(0.8, 0);

        component.objects.push(circle);
        registry.engine.components.push(component);
        break;
      case 'BACONBLOCK':
        component = new Component(new Vector(this.target.shape.centroid));
        component.objects.push(
          new BaconBlock(
            new Vector(this.target.shape.centroid),
            registry.engine.GameBoard.cellSize,
            registry.engine.GameBoard.cellSize,
            'blue',
          ),
        );
        registry.engine.components.push(component);
        break;
      case 'BREADBLOCK':
        component = new Component(new Vector(this.target.shape.centroid));
        component.objects.push(
          new BreadBlock(
            new Vector(this.target.shape.centroid),
            registry.engine.GameBoard.cellSize,
            registry.engine.GameBoard.cellSize,
            'blue',
          ),
        );
        registry.engine.components.push(component);
        break;
      case 'SPRING':
        component = new Component(new Vector(this.target.shape.centroid));
        component.objects.push(
          new Spring(
            new Vector(this.target.shape.centroid),
            registry.engine.GameBoard.cellSize,
            registry.engine.GameBoard.cellSize,
            'purple',
          ),
        );
        registry.engine.components.push(component);
        break;
      case 'HEATER':
        new Heater(this.target.shape.centroid).addComponent();
        break;
      case 'WHEEL':
        new Escalator(new Vector(this.target.shape.centroid)).addComponent();

        // if (this.additionalTargetSelected) {
        //   const creator = new Escalators(this.additionalTarget, this.target.shape.centroid);
        //   creator.addComponent();
        //   this.additionalTargetSelected = false;
        //   break;
        // }
        // this.additionalTarget = new Vector({ ...this.target.shape.centroid });
        // this.additionalTargetSelected = true;
        break;
      case 'FAN':
        new Fan(new Vector(this.target.shape.centroid)).addComponent();
        break;
      case 'PRESSURE':
        new Pressure(this.target.shape.centroid).addComponent();
        break;
      case 'GRINDER':
        new Grinder(this.target.shape.centroid).addComponent();
        break;
      case 'MAGICIAN':
        const magician = new RigidBody(
          new Circle(new Vector(this.target.shape.centroid), 25, 'blue'),
        );
        const spriteConfiguration: spriteConfiguration = {
          source: 'charactor',
          width: 72,
          height: 72,
          row: 0,
          column: 0,
        };
        magician.shape.draw = () => {
          registry.sprite.newDrawSprite(magician, spriteConfiguration);
        };
        component = new Component(this.target.shape.centroid);
        component.objects.push(magician);

        registry.engine.components.push(component);
        const magicianCharactor = new Charactor(
          magician.id,
          {
            STR: 5,
            VIT: 5,
            INT: 5,
            DEX: 5,
            LCK: 5,
            AGI: 5,
            SPI: 5,
          },
          skillData[0],
          magician,
        );
        // magicianCharactor.battleStat.MP = 1000000;
        registry.engine.charactorMap.set(magician.id, magicianCharactor);
        break;
      default:
        assertUnreachableChecker(registry.createEventType);
    }
    this.isEdit = false;
  }

  drawCreate() {
    if (this.target.shape.centroid.x === 0 && this.target.shape.centroid.y === 0) return;

    this.target.shape.draw();

    /** blur item */
    registry.engine.drawUtils.fillRect(
      new Vector({
        x: +this.target.shape.centroid.x,
        y: +this.target.shape.centroid.y,
      }),
      new Vector({
        x: registry.engine.GameBoard.cellSize,
        y: registry.engine.GameBoard.cellSize,
      }),
      'rgba(255,255,255,0.6)',
    );
  }
}
