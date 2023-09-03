import p5 from "p5";
const cosineLaw = (p5Instance: p5) => {
  const p = p5Instance as p5;

  let shoulder: p5.Vector;
  let elbow: p5.Vector;
  let hand: p5.Vector;

  let forearm: number;
  let upperarm: number;
  let arm: number;

  p.setup = () => {
    p.createCanvas(400, 400);

    shoulder = p.createVector(0, 0);
    elbow = p.createVector(100 - p.width / 2, 300 - p.height);
    hand = p.createVector(200 - p.width / 2, 150 - p.height);

    arm = shoulder.dist(hand);
    upperarm = shoulder.dist(elbow);
    forearm = elbow.dist(hand);
  };

  p.draw = () => {
    p.background(0);

    // Calcular el centro del lienzo
    let centerX = p.width / 2;
    let centerY = p.height / 2;

    // Tamaño de las celdas y líneas
    let cellSize = 100;

    // Dibujar líneas verticales centradas
    p.line(
      centerX - cellSize,
      centerY - cellSize,
      centerX - cellSize,
      centerY + cellSize
    );
    p.line(centerX, centerY - cellSize, centerX, centerY + cellSize);
    p.line(
      centerX + cellSize,
      centerY - cellSize,
      centerX + cellSize,
      centerY + cellSize
    );

    // Dibujar líneas horizontales centradas
    p.line(
      centerX - cellSize,
      centerY - cellSize,
      centerX + cellSize,
      centerY - cellSize
    );
    p.line(centerX - cellSize, centerY, centerX + cellSize, centerY);
    p.line(
      centerX - cellSize,
      centerY + cellSize,
      centerX + cellSize,
      centerY + cellSize
    );

    p.translate(p.width / 2, p.height);

    p.stroke(255);
    p.strokeWeight(2);
    p.line(shoulder.x, shoulder.y, elbow.x, elbow.y);
    p.line(elbow.x, elbow.y, hand.x, hand.y);

    p.strokeWeight(0.5);
    p.line(shoulder.x, shoulder.y, hand.x, hand.y);

    p.circle(elbow.x, elbow.y, 15);
    p.circle(hand.x, hand.y, 15);

    if (p.mouseIsPressed) {
      hand.set(p.mouseX - p.width / 2, p.mouseY - p.height);

      const { x, y } = inverse(shoulder, hand, forearm, upperarm, arm);
      elbow.set(x, y);
    }
  };

  function inverse(
    a: p5.Vector,
    b: p5.Vector,
    A: number,
    B: number,
    C: number
  ) {
    let th = p.acos((p.pow(B, 2) + p.pow(C, 2) - p.pow(A, 2)) / (2 * B * C));
    let phi = p.atan2(-(b.y - a.y), b.x - a.x);

    const pos = p.createVector(
      a.x + B * p.cos(th + phi),
      a.y - B * p.sin(th + phi)
    );

    return pos;
  }
};

new p5(cosineLaw, document.getElementById("cousine-law")!);

const armClass = (p5Instance: p5) => {
  const p = p5Instance as p5;

  class Segment {
    a: p5.Vector;
    b: p5.Vector;
    parent: Segment | null;

    constructor(
      x: number,
      y: number,
      private len: number,
      private angle: number,
      private id: number
    ) {
      this.a = p.createVector(x, y);
      this.b = p.createVector(0, 0);
      this.len = len;
      this.angle = angle;
      this.id = id;
      this.parent = null;
      this.reCalculate();
    }

    createParent(len: number, angle: number, id: number) {
      let parent = new Segment(0, 0, len, angle, id);
      this.parent = parent;
      parent.follow(this.a.x, this.a.y);
      return parent;
    }

    reCalculate() {
      let dx = p.cos(this.angle) * this.len;
      let dy = p.sin(this.angle) * this.len;
      this.b = p.createVector(this.a.x + dx, this.a.y + dy);

      p.textSize(25);
      let ang = this.angle;
      if (this.angle < 0) {
        ang = 3 + (3 + this.angle);
      }
      let txt = p.map(ang, 0, 3, 0, 180);
      p.fill(p.map(txt, 0, 360, 0, 255), 100, 100);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(p.round(txt) + "°", this.a.x + 15, this.a.y);
    }

    follow(tx: number, ty: number) {
      let target = p.createVector(tx, ty);
      let dir = p5.Vector.sub(target, this.a);
      this.angle = dir.heading();

      dir.setMag(this.len);
      dir.mult(-1);

      this.a = p5.Vector.add(target, dir);
    }

    update() {
      this.reCalculate();
    }

    show() {
      p.colorMode(p.HSB);
      const numSegs = 2;
      let clr = p.color(p.map(this.id, 0, numSegs, 0, 255), 255, 255);
      p.colorMode(p.RGB);
      p.stroke(clr);
      p.strokeWeight(4);
      p.line(this.a.x, this.a.y, this.b.x, this.b.y);
      p.noStroke();
      p.fill(51);
      p.strokeWeight(2);
      p.ellipse(this.a.x, this.a.y, 2, 2);
      p.ellipse(this.b.x, this.b.y, 2, 2);
    }
  }

  class Arm {
    base: p5.Vector;
    segs: Segment[];

    constructor(
      x: number,
      y: number,
      numSegs: number,
      segLen: number,
      angle: number
    ) {
      this.base = p.createVector(x, y);
      this.segs = [];
      this.segs[0] = new Segment(x, y, segLen, angle, 0);
      for (let i = 1; i < numSegs; i++) {
        this.addSegment(segLen, 0);
      }
    }

    addSegment(len: number, angle: number) {
      let c = this.segs[this.segs.length - 1];
      let s = new Segment(0, 0, len, angle, this.segs.length);
      c.parent = s;
      this.segs.push(s);
      s.follow(c.a.x, c.a.y);
      return s;
    }

    update() {
      for (let i = 0; i < this.segs.length; i++) {
        const seg = this.segs[i];
        seg.update();
        if (i === 0) {
          seg.follow(p.mouseX, p.mouseY);
        } else {
          const previous = this.segs[i - 1];
          seg.follow(previous.a.x, previous.a.y);
        }
      }

      const last = this.segs.length - 1;
      const s = this.segs[last];
      s.a.x = this.base.x;
      s.a.y = this.base.y;
      s.reCalculate();
      for (let i = last - 1; i >= 0; i--) {
        const seg = this.segs[i];
        const next = this.segs[i + 1];
        seg.a.x = next.b.x;
        seg.a.y = next.b.y;
        seg.reCalculate();
      }
    }

    show() {
      this.segs.forEach((s) => s.show());
    }
  }

  let arm: Arm;
  p.setup = () => {
    p.createCanvas(400, 400);
    arm = new Arm(p.width / 2, p.height, 2, 150, 270);
  };

  p.draw = () => {
    p.background(0);

    arm.update();
    arm.show();

    p.stroke(255);
    p.line(200, 250, 275, 250);
    p.line(200, 275, 275, 275);

    p.line(225, 225, 225, 300);
    p.line(250, 225, 250, 300);

    p.textSize(12);
    p.text(`(${p.mouseX}, ${p.mouseY})`, p.mouseX, p.mouseY);
  };
};

new p5(armClass, document.getElementById("arm-class")!);
