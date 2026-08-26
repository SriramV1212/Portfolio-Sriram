"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { useReducedMotion } from "@/lib/useReducedMotion";

const PILL_HEIGHT = 44;
const PILL_PADDING_X = 24;
const DROP_STAGGER_MS = 130;

export default function SkillsPhysics({ skills }: { skills: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [started, setStarted] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || started) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    const container = containerRef.current;
    if (!started || !container || reducedMotion) return;

    const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Events } =
      Matter;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const engine = Engine.create();
    engine.gravity.y = 1;
    // More solver iterations so fast-moving pills can't tunnel through the
    // walls when flung hard.
    engine.positionIterations = 12;
    engine.velocityIterations = 8;

    // Thick walls (reduces tunneling from a hard shake) enclosing the box.
    // The ceiling is deliberately NOT added yet — pills still need to fall
    // in from above the container first. It's added once they've all
    // landed, below, so a shake afterward can't fling one out the top.
    const WALL_THICKNESS = 80;
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Bodies.rectangle(
      width / 2,
      height + WALL_THICKNESS / 2,
      width * 2,
      WALL_THICKNESS,
      wallOptions
    );
    const ceiling = Bodies.rectangle(
      width / 2,
      -WALL_THICKNESS / 2,
      width * 2,
      WALL_THICKNESS,
      wallOptions
    );
    const leftWall = Bodies.rectangle(
      -WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height * 2,
      wallOptions
    );
    const rightWall = Bodies.rectangle(
      width + WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height * 2,
      wallOptions
    );
    Composite.add(engine.world, [ground, leftWall, rightWall]);

    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      // Soft, damped drag so whipping the cursor around doesn't fling a
      // pill at full force — it lags behind the cursor instead.
      constraint: { stiffness: 0.1, damping: 0.5, render: { visible: false } },
    });
    Composite.add(engine.world, mouseConstraint);

    // Normalizes body.angle to (-PI, PI] — Matter accumulates it unbounded
    // (e.g. after many spins), so a raw comparison against 0 would be wrong.
    const normalizeAngle = (angle: number) => {
      const twoPi = Math.PI * 2;
      let normalized = angle % twoPi;
      if (normalized > Math.PI) normalized -= twoPi;
      if (normalized < -Math.PI) normalized += twoPi;
      return normalized;
    };

    const STRAIGHTEN_EPSILON = 0.02; // ~1.1 degrees — close enough to call it straight
    const straighteningBodies = new Set<Matter.Body>();

    // Picking up a pill that isn't already straight queues it to slowly
    // rotate upright (handled per-tick below) so its label stays readable.
    // A pill that's already straight is left alone.
    Events.on(mouseConstraint, "startdrag", (event) => {
      // Matter passes { mouse, body } at runtime for this event, but the
      // published types only declare the generic IEvent<MouseConstraint>.
      const body = (event as unknown as { body?: Matter.Body }).body;
      if (!body) return;
      if (Math.abs(normalizeAngle(body.angle)) > STRAIGHTEN_EPSILON) {
        straighteningBodies.add(body);
      }
    });

    // Matter binds its own "wheel" listener (to stop page scroll from moving
    // the mouse point mid-drag) that calls preventDefault() unconditionally,
    // which blocks normal page scrolling whenever the cursor is over the
    // widget — remove it so scrolling past the section still works. (Matter
    // registers this on the modern "wheel" event, not the legacy
    // "mousewheel"/"DOMMouseScroll" names, so it must be removed by that
    // name to actually take effect.)
    const mousewheelHandler = (mouse as unknown as { mousewheel: (e: Event) => void })
      .mousewheel;
    container.removeEventListener("wheel", mousewheelHandler);

    const bodies = pillRefs.current.map((el, i) => {
      const pillWidth = el ? el.offsetWidth : 100;
      const startX = Math.random() * (width - pillWidth - 20) + pillWidth / 2 + 10;
      const body = Bodies.rectangle(
        startX,
        -100 - i * 60,
        pillWidth,
        PILL_HEIGHT,
        {
          chamfer: { radius: PILL_HEIGHT / 2 },
          restitution: 0.25,
          friction: 0.4,
          frictionAir: 0.03,
          density: 0.002,
        }
      );
      Body.setAngle(body, (Math.random() - 0.5) * 0.6);
      return body;
    });

    // Belt-and-suspenders cap on how fast any pill can ever move, so a hard
    // shake stays light and (combined with the thicker walls above) a body
    // can never cross a wall in a single step.
    const MAX_SPEED = 18;
    const MAX_ANGULAR_SPEED = 0.2;
    Events.on(engine, "beforeUpdate", () => {
      for (const body of bodies) {
        const speed = Body.getSpeed(body);
        if (speed > MAX_SPEED) {
          Body.setVelocity(body, {
            x: (body.velocity.x / speed) * MAX_SPEED,
            y: (body.velocity.y / speed) * MAX_SPEED,
          });
        }
        if (Math.abs(body.angularVelocity) > MAX_ANGULAR_SPEED) {
          Body.setAngularVelocity(
            body,
            Math.sign(body.angularVelocity) * MAX_ANGULAR_SPEED
          );
        }
      }

      // Ease any queued pill's rotation gradually toward upright (0) instead
      // of snapping — a fraction of the remaining angle closes each tick.
      const STRAIGHTEN_EASE = 0.06;
      for (const body of straighteningBodies) {
        const angle = normalizeAngle(body.angle);
        if (Math.abs(angle) <= STRAIGHTEN_EPSILON) {
          Body.setAngle(body, 0);
          straighteningBodies.delete(body);
          continue;
        }
        Body.setAngle(body, angle * (1 - STRAIGHTEN_EASE));
        Body.setAngularVelocity(body, 0);
      }
    });

    const runner = Runner.create();
    let frameId: number;
    let dropIndex = 0;

    const dropNext = () => {
      if (dropIndex >= bodies.length) {
        // Everyone's in — seal the top so a shake can't fling one back out.
        setTimeout(() => Composite.add(engine.world, ceiling), 1200);
        return;
      }
      Composite.add(engine.world, bodies[dropIndex]);
      dropIndex += 1;
      setTimeout(dropNext, DROP_STAGGER_MS);
    };
    dropNext();

    Runner.run(runner, engine);

    const syncPositions = () => {
      bodies.forEach((body, i) => {
        const el = pillRefs.current[i];
        if (!el) return;
        const w = el.offsetWidth;
        el.style.transform = `translate(${body.position.x - w / 2}px, ${
          body.position.y - PILL_HEIGHT / 2
        }px) rotate(${body.angle}rad)`;
      });
      frameId = requestAnimationFrame(syncPositions);
    };
    frameId = requestAnimationFrame(syncPositions);

    return () => {
      cancelAnimationFrame(frameId);
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, [started, reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="flex flex-wrap gap-2 rounded-xl border-2 border-white p-6">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border-4 border-emerald-500 bg-white px-4 py-2 font-mono text-sm font-semibold text-black"
          >
            {skill}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[280px] w-full touch-none overflow-hidden rounded-xl border-2 border-white sm:h-[320px]"
    >
      {skills.map((skill, i) => (
        <div
          key={skill}
          ref={(el) => {
            pillRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 flex select-none items-center justify-center whitespace-nowrap rounded-full border-4 border-emerald-500 bg-white font-mono text-sm font-semibold text-black will-change-transform"
          style={{
            height: PILL_HEIGHT,
            paddingLeft: PILL_PADDING_X,
            paddingRight: PILL_PADDING_X,
            transform: `translate(-9999px, -9999px)`,
          }}
        >
          {skill}
        </div>
      ))}
    </div>
  );
}
