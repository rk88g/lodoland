"use client";

import { useEffect, useRef, useState } from "react";

type CollageItem = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  vx: number;
  vy: number;
  tone: string;
};

type MobileSlot = {
  left: string;
  top: string;
  width: string;
  height: string;
  radius: string;
  angle: string;
};

const INITIAL_ITEMS: CollageItem[] = [
  { id: "a", x: 0.04, y: 0.08, width: 0.17, height: 0.29, radius: 38, vx: 0.012, vy: 0.009, tone: "tone-gold" },
  { id: "b", x: 0.25, y: 0.06, width: 0.14, height: 0.24, radius: 28, vx: -0.013, vy: 0.011, tone: "tone-pink" },
  { id: "c", x: 0.43, y: 0.05, width: 0.16, height: 0.21, radius: 32, vx: 0.01, vy: 0.012, tone: "tone-blue" },
  { id: "d", x: 0.66, y: 0.06, width: 0.15, height: 0.27, radius: 34, vx: -0.012, vy: 0.009, tone: "tone-teal" },
  { id: "e", x: 0.84, y: 0.07, width: 0.12, height: 0.2, radius: 26, vx: -0.009, vy: 0.008, tone: "tone-burn" },
  { id: "f", x: 0.07, y: 0.4, width: 0.14, height: 0.22, radius: 30, vx: 0.009, vy: -0.011, tone: "tone-pink" },
  { id: "g", x: 0.25, y: 0.36, width: 0.21, height: 0.27, radius: 40, vx: -0.01, vy: 0.008, tone: "tone-gold" },
  { id: "h", x: 0.51, y: 0.33, width: 0.11, height: 0.18, radius: 22, vx: 0.013, vy: -0.008, tone: "tone-blue" },
  { id: "i", x: 0.66, y: 0.36, width: 0.2, height: 0.24, radius: 34, vx: -0.008, vy: 0.01, tone: "tone-burn" },
  { id: "j", x: 0.87, y: 0.34, width: 0.1, height: 0.17, radius: 20, vx: 0.011, vy: -0.009, tone: "tone-teal" },
  { id: "k", x: 0.05, y: 0.7, width: 0.13, height: 0.18, radius: 24, vx: 0.008, vy: 0.012, tone: "tone-blue" },
  { id: "l", x: 0.22, y: 0.67, width: 0.12, height: 0.17, radius: 20, vx: -0.012, vy: -0.008, tone: "tone-pink" },
  { id: "m", x: 0.38, y: 0.64, width: 0.16, height: 0.26, radius: 34, vx: 0.009, vy: 0.007, tone: "tone-teal" },
  { id: "n", x: 0.58, y: 0.66, width: 0.14, height: 0.2, radius: 26, vx: -0.01, vy: 0.009, tone: "tone-gold" },
  { id: "o", x: 0.75, y: 0.63, width: 0.2, height: 0.23, radius: 36, vx: 0.011, vy: -0.01, tone: "tone-burn" },
  { id: "p", x: 0.9, y: 0.68, width: 0.09, height: 0.15, radius: 18, vx: -0.008, vy: 0.011, tone: "tone-blue" }
];

const MOBILE_SLOTS: MobileSlot[] = [
  { left: "6%", top: "8%", width: "42%", height: "25%", radius: "28px", angle: "-5deg" },
  { left: "52%", top: "10%", width: "34%", height: "20%", radius: "22px", angle: "6deg" },
  { left: "12%", top: "36%", width: "30%", height: "18%", radius: "18px", angle: "8deg" },
  { left: "48%", top: "36%", width: "40%", height: "24%", radius: "30px", angle: "-8deg" },
  { left: "8%", top: "64%", width: "38%", height: "22%", radius: "24px", angle: "4deg" },
  { left: "54%", top: "66%", width: "28%", height: "17%", radius: "18px", angle: "-6deg" }
];

function shuffleItems(items: CollageItem[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }

  return copy;
}

export function InfluencerCollage() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSelection, setMobileSelection] = useState(() =>
    shuffleItems(INITIAL_ITEMS).slice(0, MOBILE_SLOTS.length)
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 780px)");
    const syncScreenMode = () => setIsMobile(mediaQuery.matches);

    syncScreenMode();
    mediaQuery.addEventListener("change", syncScreenMode);

    return () => {
      mediaQuery.removeEventListener("change", syncScreenMode);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setMobileSelection(shuffleItems(INITIAL_ITEMS).slice(0, MOBILE_SLOTS.length));
    }, 3600);

    return () => {
      window.clearInterval(interval);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      return undefined;
    }

    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = Math.min(time - lastTime, 32);
      lastTime = time;

      setItems((currentItems) => {
        const nextItems = currentItems.map((item) => ({ ...item }));

        nextItems.forEach((item) => {
          item.x += item.vx * delta;
          item.y += item.vy * delta;

          if (item.x <= 0) {
            item.x = 0;
            item.vx *= -1;
          }

          if (item.y <= 0) {
            item.y = 0;
            item.vy *= -1;
          }

          if (item.x + item.width >= 1) {
            item.x = 1 - item.width;
            item.vx *= -1;
          }

          if (item.y + item.height >= 1) {
            item.y = 1 - item.height;
            item.vy *= -1;
          }
        });

        for (let leftIndex = 0; leftIndex < nextItems.length; leftIndex += 1) {
          for (let rightIndex = leftIndex + 1; rightIndex < nextItems.length; rightIndex += 1) {
            const leftItem = nextItems[leftIndex];
            const rightItem = nextItems[rightIndex];

            const overlapX =
              Math.min(leftItem.x + leftItem.width, rightItem.x + rightItem.width) -
              Math.max(leftItem.x, rightItem.x);
            const overlapY =
              Math.min(leftItem.y + leftItem.height, rightItem.y + rightItem.height) -
              Math.max(leftItem.y, rightItem.y);

            if (overlapX <= 0 || overlapY <= 0) {
              continue;
            }

            if (overlapX < overlapY) {
              const push = overlapX / 2 + 0.003;

              if (leftItem.x < rightItem.x) {
                leftItem.x -= push;
                rightItem.x += push;
              } else {
                leftItem.x += push;
                rightItem.x -= push;
              }

              const leftVelocity = leftItem.vx;
              leftItem.vx = rightItem.vx;
              rightItem.vx = leftVelocity;
            } else {
              const push = overlapY / 2 + 0.003;

              if (leftItem.y < rightItem.y) {
                leftItem.y -= push;
                rightItem.y += push;
              } else {
                leftItem.y += push;
                rightItem.y -= push;
              }

              const leftVelocity = leftItem.vy;
              leftItem.vy = rightItem.vy;
              rightItem.vy = leftVelocity;
            }

            leftItem.x = Math.max(0, Math.min(1 - leftItem.width, leftItem.x));
            leftItem.y = Math.max(0, Math.min(1 - leftItem.height, leftItem.y));
            rightItem.x = Math.max(0, Math.min(1 - rightItem.width, rightItem.x));
            rightItem.y = Math.max(0, Math.min(1 - rightItem.height, rightItem.y));
          }
        }

        return nextItems;
      });

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    animationFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile]);

  return (
    <div className="collage-bg" ref={frameRef}>
      {isMobile
        ? mobileSelection.map((item, index) => {
            const slot = MOBILE_SLOTS[index];

            return (
              <div
                className={`collage-photo-mobile ${item.tone}`}
                key={`${item.id}-${index}`}
                style={{
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  height: slot.height,
                  borderRadius: slot.radius,
                  transform: `rotate(${slot.angle})`
                }}
              />
            );
          })
        : items.map((item) => (
            <div
              className={`collage-photo-drift ${item.tone}`}
              key={item.id}
              style={{
                left: `${item.x * 100}%`,
                top: `${item.y * 100}%`,
                width: `${item.width * 100}%`,
                height: `${item.height * 100}%`,
                borderRadius: `${item.radius}px`
              }}
            />
          ))}
    </div>
  );
}
