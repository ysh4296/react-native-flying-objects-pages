import Component from '@engine/lib/component/component';
import RigidBody from '@rigidbody/rigidbody';
import Vector from '@engine/lib/vector';
import Grid from './grid';
import Shape from '@engine/lib/rigidbody/shape';
import { SkillFrame } from '@engine/utils/skillEffects';

export default class HashGrid extends Grid {
  hashMap: Map<number, RigidBody[]>;
  frameHashMap: Map<number, Shape[]>;
  hashMapSize: number;
  p1Prime: number;
  p2Prime: number;
  components: Component[];
  skillFrames: SkillFrame[];
  objectsToCells: Map<ObjectCode, number[]>; // < object, hashMapKey >
  framesToCells: Map<Shape, number[]>;
  constructor(cellSize: number) {
    super(cellSize);
    this.hashMap = new Map();
    this.frameHashMap = new Map();
    this.objectsToCells = new Map(); // map<number,rigidBody[]>
    this.framesToCells = new Map();

    this.components = [];
    this.skillFrames = [];

    this.hashMapSize = 10000000;
    this.p1Prime = 125311;
    this.p2Prime = 588667;
  }

  initializeComponent(world: Vector, components: Component[], skillFrames: SkillFrame[]) {
    this.world = world;
    this.components = components;
    this.skillFrames = skillFrames;
  }

  refreshGrid(components: Component[], skillFrames: SkillFrame[]) {
    this.components = components;
    this.skillFrames = skillFrames;
    this.clearGrid();
    this.mapBodiesToCell();
    this.mapSkillsToCell();
  }

  clearGrid() {
    this.hashMap.clear();
    this.objectsToCells.clear();
    this.frameHashMap.clear();
    this.framesToCells.clear();
  }

  cellIndexToHash(x: number, y: number) {
    let hash = ((x * this.p1Prime) ^ (y * this.p2Prime)) % this.hashMapSize;
    return hash;
  }

  mapBodiesToCell() {
    this.components.forEach((component) => {
      for (let i = 0; i < component.objects.length; i++) {
        const objectCode: ObjectCode = `${component.id}:${component.objects[i].id}`;

        let boundingBox = component.objects[i].getShape().boundingBox;
        let left = boundingBox.topLeft.x;
        let right = boundingBox.bottomRight.x;
        let top = boundingBox.topLeft.y;
        let bottom = boundingBox.bottomRight.y;

        let leftCellIndex = parseInt(String(left / this.cellSize));
        let RightCellIndex = parseInt(String(right / this.cellSize));
        let topCellIndex = parseInt(String(top / this.cellSize));
        let bottomCellIndex = parseInt(String(bottom / this.cellSize));

        for (let x = leftCellIndex; x <= RightCellIndex; x++) {
          for (let y = topCellIndex; y <= bottomCellIndex; y++) {
            let hashIndex = this.cellIndexToHash(x, y);
            const entries = this.hashMap.get(hashIndex);
            if (entries === undefined) {
              let newArray = [component.objects[i]];
              this.hashMap.set(hashIndex, newArray);
            } else {
              entries.push(component.objects[i]);
            }

            const cells = this.objectsToCells.get(objectCode);
            if (cells === undefined) {
              let newArray = [hashIndex];
              this.objectsToCells.set(objectCode, newArray);
            } else {
              cells.push(hashIndex);
            }
          }
        }
      }
      for (let i = 0; i < component.effects.length; i++) {
        const objectCode: ObjectCode = `${component.id}:${component.effects[i].id}`;

        let boundingBox = component.effects[i].getShape().boundingBox;
        let left = boundingBox.topLeft.x;
        let right = boundingBox.bottomRight.x;
        let top = boundingBox.topLeft.y;
        let bottom = boundingBox.bottomRight.y;

        let leftCellIndex = parseInt(String(left / this.cellSize));
        let RightCellIndex = parseInt(String(right / this.cellSize));
        let topCellIndex = parseInt(String(top / this.cellSize));
        let bottomCellIndex = parseInt(String(bottom / this.cellSize));

        for (let x = leftCellIndex; x <= RightCellIndex; x++) {
          for (let y = topCellIndex; y <= bottomCellIndex; y++) {
            let hashIndex = this.cellIndexToHash(x, y);
            let entries = this.hashMap.get(hashIndex);
            if (entries === undefined) {
              let newArray = [component.effects[i]];
              this.hashMap.set(hashIndex, newArray);
            } else {
              entries.push(component.effects[i]);
            }

            const cells = this.objectsToCells.get(objectCode);
            if (cells === undefined) {
              let newArray = [hashIndex];
              this.objectsToCells.set(objectCode, newArray);
            } else {
              cells.push(hashIndex);
            }
          }
        }
      }
    });
  }

  mapSkillsToCell() {
    // console.log('maps  start');
    this.skillFrames.forEach((skillFrames) => {
      skillFrames.user;
      skillFrames.frame.effectRanges.forEach((range, index) => {
        const { topLeft, bottomRight } = range.boundingBox;
        const { centroid } = skillFrames.user.object.shape;
        let leftCellIndex = parseInt(String((topLeft.x + centroid.x) / this.cellSize));
        let RightCellIndex = parseInt(String((bottomRight.x + centroid.x) / this.cellSize));
        let topCellIndex = parseInt(String((topLeft.y + centroid.y) / this.cellSize));
        let bottomCellIndex = parseInt(String((bottomRight.y + centroid.y) / this.cellSize));

        for (let x = leftCellIndex; x <= RightCellIndex; x++) {
          for (let y = topCellIndex; y <= bottomCellIndex; y++) {
            let hashIndex = this.cellIndexToHash(x, y);

            // const entries = this.frameHashMap.get(hashIndex);
            // if (entries === undefined) {
            //   let newArray = [range];
            //   this.frameHashMap.set(hashIndex, newArray);
            // } else {
            //   entries.push(range);
            // }

            const cells = this.framesToCells.get(range);
            // console.log('index  ', hashIndex);
            if (cells === undefined) {
              let newArray = [hashIndex];
              this.framesToCells.set(range, newArray);
            } else {
              cells.push(hashIndex);
            }
          }
        }

        // console.log(
        //   'range',
        //   skillFrames.user.id,
        //   '  ',
        //   index,
        //   '  :  ',
        //   this.framesToCells.get(range),
        // );
      });
    });
  }

  getNeighborObject(objectCode: ObjectCode, object: RigidBody) {
    let occupiedCells = this.objectsToCells.get(objectCode) ?? [];
    let neighborObjects: RigidBody[] = [];
    for (let i = 0; i < occupiedCells.length; i++) {
      let occupiedCellHashIndex = occupiedCells[i];
      let occupiedCell = this.hashMap.get(occupiedCellHashIndex);
      if (occupiedCell) {
        for (let j = 0; j < occupiedCell.length; j++) {
          let objectInCell = occupiedCell[j];
          if (objectInCell != object) {
            neighborObjects.push(objectInCell);
          }
        }
      }
    }
    return neighborObjects.filter((item, index) => neighborObjects.indexOf(item) === index);
  }

  getNeighborSkill(effectRange: Shape) {
    // gridBox는 skill의 현 위치를 계산하기 위해 스킬 프레임과 유저 위치를 조합해서 mapping하고 있습니다.
    let occupiedCells = this.framesToCells.get(effectRange) ?? [];

    let neighborObjects: RigidBody[] = [];
    for (let i = 0; i < occupiedCells.length; i++) {
      let occupiedCellHashIndex = occupiedCells[i];
      let occupiedCell = this.hashMap.get(occupiedCellHashIndex);
      if (occupiedCell) {
        for (let j = 0; j < occupiedCell.length; j++) {
          let objectInCell = occupiedCell[j];
          neighborObjects.push(objectInCell);
        }
      }
    }
    return neighborObjects.filter((item, index) => neighborObjects.indexOf(item) === index);
  }

  getContentOfCell(id: number) {
    let content = this.hashMap.get(id);
    if (content === null || content === undefined) return [];
    return content;
  }

  getCellIdFromPosition(pos: Vector) {
    let x = parseInt(String(pos.x / this.cellSize));
    let y = parseInt(String(pos.y / this.cellSize));
    return this.cellIndexToHash(x, y);
  }
}
