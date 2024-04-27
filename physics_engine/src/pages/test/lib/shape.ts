import Calculator from "../utils/calculator";
import Draw from "../utils/draw";
import Vector from "./vector";

export default class Shape {
  vertices: Vector[];
  ctx: CanvasRenderingContext2D;
  drawUtils: Draw;
  calculatorUtils: Calculator;
  centroid: Vector;
  color: string;

  constructor(
    ctx: CanvasRenderingContext2D,
    vertices: Vector[],
    color: string
  ) {
    this.ctx = ctx;
    this.drawUtils = Draw.getInstance();
    this.calculatorUtils = Calculator.getInstance();
    this.vertices = vertices;
    this.centroid = new Vector({ x: 0, y: 0 });
    this.color = color;
    if (new.target === Shape) {
      throw new TypeError(
        "Cannot construct abstract instances directly of Class 'Shape'"
      );
    }
  }

  setCentroid(position: Vector) {
    this.centroid = position;
  }

  setColor(color: string) {
    this.ctx.strokeStyle = color;
    this.color = color;
  }

  draw() {
    for (let i = 1; i < this.vertices.length; i++) {
      this.drawUtils.drawLine(
        this.vertices[i - 1],
        this.vertices[i],
        this.color
      );
    }
    this.drawUtils.drawLine(
      this.vertices[this.vertices.length - 1],
      this.vertices[0],
      this.color
    );
    this.drawUtils.drawPoint(this.centroid, 5, this.color);
  }

  move(delta: Vector) {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].add(delta);
    }
    this.centroid.add(delta);
  }

  rotate(radian: number) {
    for (let i = 0; i < this.vertices.length; i++) {
      let rotatedVertice = this.calculatorUtils.rotateAroundPoint(
        this.vertices[i],
        this.centroid,
        radian
      );
      this.vertices[i] = rotatedVertice;
    }
  }
}