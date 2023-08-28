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
    p.createCanvas(600, 600);

    shoulder = p.createVector(p.width / 2, p.height);
    elbow = p.createVector(200 - p.width / 2, 400 - p.height);
    hand = p.createVector(300 - p.width / 2, 250 - p.height);

    arm = shoulder.dist(hand);
    upperarm = shoulder.dist(elbow);
    forearm = elbow.dist(hand);
  };

  p.draw = () => {
    p.background(0);
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
      if (
        p.dist(p.mouseX - p.width / 2, p.mouseY - p.height, hand.x, hand.y) < 20
      ) {
        hand.set(p.mouseX - p.width / 2, p.mouseY - p.height);

        const { x, y } = inverse(shoulder, hand, forearm, upperarm, arm);
        elbow.set(x, y);
      }
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
