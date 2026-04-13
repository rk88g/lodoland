"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

type Tone = "tone-gold" | "tone-pink" | "tone-blue" | "tone-teal" | "tone-burn";

type Asset = {
  id: string;
  tone: Tone;
  url?: string | null;
  altText?: string | null;
};

type Slot = {
  id: string;
  left: string;
  top: string;
  width: string;
  height: string;
  rotation: string;
  zIndex: number;
  duration: string;
  delay: string;
};

const ASSET_POOL: Asset[] = [
  { id: "asset-a", tone: "tone-gold" },
  { id: "asset-b", tone: "tone-pink" },
  { id: "asset-c", tone: "tone-blue" },
  { id: "asset-d", tone: "tone-teal" },
  { id: "asset-e", tone: "tone-burn" },
  { id: "asset-f", tone: "tone-gold" },
  { id: "asset-g", tone: "tone-blue" },
  { id: "asset-h", tone: "tone-pink" },
  { id: "asset-i", tone: "tone-teal" },
  { id: "asset-j", tone: "tone-burn" },
  { id: "asset-k", tone: "tone-gold" },
  { id: "asset-l", tone: "tone-blue" }
];

const DESKTOP_SLOTS: Slot[] = [
  { id: "slot-a", left: "2%", top: "2%", width: "18%", height: "28%", rotation: "-7deg", zIndex: 2, duration: "15s", delay: "0s" },
  { id: "slot-b", left: "17%", top: "0%", width: "20%", height: "28%", rotation: "4deg", zIndex: 3, duration: "18s", delay: "-4s" },
  { id: "slot-c", left: "34%", top: "1%", width: "18%", height: "24%", rotation: "-3deg", zIndex: 4, duration: "17s", delay: "-8s" },
  { id: "slot-d", left: "50%", top: "6%", width: "18%", height: "26%", rotation: "5deg", zIndex: 5, duration: "21s", delay: "-6s" },
  { id: "slot-e", left: "69%", top: "2%", width: "16%", height: "24%", rotation: "-6deg", zIndex: 2, duration: "16s", delay: "-10s" },
  { id: "slot-f", left: "0%", top: "34%", width: "17%", height: "27%", rotation: "7deg", zIndex: 4, duration: "19s", delay: "-2s" },
  { id: "slot-g", left: "20%", top: "28%", width: "24%", height: "34%", rotation: "-4deg", zIndex: 7, duration: "22s", delay: "-5s" },
  { id: "slot-h", left: "41%", top: "40%", width: "18%", height: "24%", rotation: "6deg", zIndex: 6, duration: "18s", delay: "-7s" },
  { id: "slot-i", left: "57%", top: "31%", width: "16%", height: "22%", rotation: "-5deg", zIndex: 5, duration: "20s", delay: "-9s" },
  { id: "slot-j", left: "73%", top: "36%", width: "18%", height: "30%", rotation: "3deg", zIndex: 4, duration: "17s", delay: "-11s" },
  { id: "slot-k", left: "8%", top: "66%", width: "18%", height: "24%", rotation: "-4deg", zIndex: 3, duration: "23s", delay: "-3s" },
  { id: "slot-l", left: "28%", top: "69%", width: "17%", height: "21%", rotation: "5deg", zIndex: 4, duration: "16s", delay: "-12s" },
  { id: "slot-m", left: "49%", top: "64%", width: "20%", height: "26%", rotation: "-6deg", zIndex: 6, duration: "19s", delay: "-1s" },
  { id: "slot-n", left: "71%", top: "67%", width: "17%", height: "22%", rotation: "4deg", zIndex: 3, duration: "21s", delay: "-14s" }
];

const MOBILE_SLOTS: Slot[] = [
  { id: "mobile-a", left: "5%", top: "9%", width: "40%", height: "24%", rotation: "-5deg", zIndex: 2, duration: "0s", delay: "0s" },
  { id: "mobile-b", left: "49%", top: "8%", width: "32%", height: "19%", rotation: "4deg", zIndex: 3, duration: "0s", delay: "0s" },
  { id: "mobile-c", left: "10%", top: "36%", width: "30%", height: "18%", rotation: "6deg", zIndex: 3, duration: "0s", delay: "0s" },
  { id: "mobile-d", left: "44%", top: "34%", width: "42%", height: "23%", rotation: "-6deg", zIndex: 4, duration: "0s", delay: "0s" },
  { id: "mobile-e", left: "8%", top: "63%", width: "36%", height: "20%", rotation: "4deg", zIndex: 2, duration: "0s", delay: "0s" },
  { id: "mobile-f", left: "52%", top: "66%", width: "28%", height: "16%", rotation: "-4deg", zIndex: 3, duration: "0s", delay: "0s" }
];

function shuffleAssets(items: Asset[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }

  return copy;
}

function buildSelection(slotCount: number, assetPool: Asset[]) {
  if (!assetPool.length) {
    return [];
  }

  if (assetPool.length >= slotCount) {
    return shuffleAssets(assetPool).slice(0, slotCount);
  }

  const repeated: Asset[] = [];

  while (repeated.length < slotCount) {
    repeated.push(...shuffleAssets(assetPool));
  }

  return repeated.slice(0, slotCount);
}

type InfluencerCollageProps = {
  images?: Array<{
    id?: string;
    url: string;
    altText?: string | null;
  }>;
};

const TONES: Tone[] = ["tone-gold", "tone-pink", "tone-blue", "tone-teal", "tone-burn"];

function buildAssetPool(images?: InfluencerCollageProps["images"]) {
  if (!images?.length) {
    return ASSET_POOL;
  }

  return images.map((image, index) => ({
    id: image.id || `cms-image-${index + 1}`,
    url: image.url,
    altText: image.altText || null,
    tone: TONES[index % TONES.length]
  }));
}

export function InfluencerCollage({ images }: InfluencerCollageProps) {
  const assetPool = useMemo(() => buildAssetPool(images), [images]);
  const [isMobile, setIsMobile] = useState(false);
  const [desktopAssets, setDesktopAssets] = useState(() => buildSelection(DESKTOP_SLOTS.length, assetPool));
  const [mobileAssets, setMobileAssets] = useState(() => buildSelection(MOBILE_SLOTS.length, assetPool));

  const activeSlots = useMemo(() => (isMobile ? MOBILE_SLOTS : DESKTOP_SLOTS), [isMobile]);
  const activeAssets = isMobile ? mobileAssets : desktopAssets;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 780px)");
    const syncMode = () => setIsMobile(mediaQuery.matches);

    syncMode();
    mediaQuery.addEventListener("change", syncMode);

    return () => {
      mediaQuery.removeEventListener("change", syncMode);
    };
  }, []);

  useEffect(() => {
    setDesktopAssets(buildSelection(DESKTOP_SLOTS.length, assetPool));
    setMobileAssets(buildSelection(MOBILE_SLOTS.length, assetPool));
  }, [assetPool]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isMobile) {
        setMobileAssets(buildSelection(MOBILE_SLOTS.length, assetPool));
        return;
      }

      setDesktopAssets(buildSelection(DESKTOP_SLOTS.length, assetPool));
    }, isMobile ? 3800 : 7600);

    return () => {
      window.clearInterval(interval);
    };
  }, [assetPool, isMobile]);

  return (
    <div className="collage-bg collage-scrapbook">
      {activeSlots.map((slot, index) => {
        const asset = activeAssets[index];

        return (
          <div
            className={`scrap-photo-frame ${asset?.tone || "tone-gold"} ${isMobile ? "is-mobile" : ""}`}
            key={`${slot.id}-${asset?.id || "empty"}`}
            style={
              {
                left: slot.left,
                top: slot.top,
                width: slot.width,
                height: slot.height,
                rotate: slot.rotation,
                zIndex: slot.zIndex,
                "--float-duration": slot.duration,
                "--float-delay": slot.delay
              } as CSSProperties
            }
          >
            <div className="scrap-photo-inner">
              <div
                aria-label={asset?.altText || "Imagen collage"}
                className="scrap-photo-shot"
                role="img"
                style={
                  asset?.url
                    ? {
                        backgroundImage: `url(${asset.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }
                    : undefined
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
