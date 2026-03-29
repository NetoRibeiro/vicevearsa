import { useCallback, useEffect, useRef, useState } from "react";
import { extend } from "@pixi/react";
import { Container, Graphics, Text, Sprite } from "pixi.js";
import type { Agent } from "@/types/state";
import type { Graphics as PixiGraphics, TextStyleOptions, Texture } from "pixi.js";
import { COLORS, CELL_W, CELL_H, TILE, CHARACTER_VARIANTS } from "./palette";
import { drawDeskArea, drawWorkstationBack, drawWorkstationFront, drawScreenGlow, drawDeskAccessories } from "./drawDesk";
import { getCharacterTextures } from "./textures";

extend({ Container, Graphics, Text, Sprite });

export { CELL_W, CELL_H };

export const GRID_OFFSET_X = TILE * 3;
export const GRID_OFFSET_Y = TILE * 4;  // was TILE * 3 — extra space for name cards

interface AgentDeskProps {
  agent: Agent;
  agentIndex: number;
  onDeskClick?: (agentId: string) => void;
}

export function AgentDesk({ agent, agentIndex, onDeskClick }: AgentDeskProps) {
  const x = GRID_OFFSET_X + (agent.desk.col - 1) * CELL_W;
  const y = GRID_OFFSET_Y + (agent.desk.row - 1) * CELL_H;

  const [frame, setFrame] = useState(0);
  const frameRef = useRef<number>(0);

  // Track approval flash state (escalates from monitor flash to desk flash at 10 seconds)
  const [flashIntensity, setFlashIntensity] = useState<"none" | "monitor" | "desk" | "system">("none");
  const approvalStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (agent.status !== "working") {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % 2;
      setFrame(frameRef.current);
    }, 250);
    return () => clearInterval(interval);
  }, [agent.status]);

  // Handle approval flash animation
  useEffect(() => {
    if (!agent.approval?.needed) {
      approvalStartTimeRef.current = null;
      setFlashIntensity("none");
      return;
    }

    if (!approvalStartTimeRef.current) {
      approvalStartTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      if (!approvalStartTimeRef.current) return;
      const elapsed = Date.now() - approvalStartTimeRef.current;

      if (elapsed < 10000) {
        // 0-10 seconds: monitor flash (gold)
        setFlashIntensity("monitor");
      } else if (elapsed < 10 * 60 * 1000) {
        // 10 seconds - 10 minutes: desk escalation (red)
        setFlashIntensity("desk");
      } else {
        // 10+ minutes: system escalation (all desks red)
        setFlashIntensity("system");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [agent.approval?.needed, agent.approval?.requestedAt]);

  const variant = CHARACTER_VARIANTS[agentIndex % CHARACTER_VARIANTS.length];
  const textures = getCharacterTextures(agentIndex, variant);

  let currentTexture: Texture;
  switch (agent.status) {
    case "working":
    case "delivering":
      currentTexture = textures.working[frame % 2];
      break;
    case "done":
      currentTexture = textures.done;
      break;
    default:
      currentTexture = textures.idle;
  }

  const drawStationBack = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      drawDeskArea(g, 0, 0);
      drawWorkstationBack(g, 0, 0);
      if (agent.status === "working" || agent.status === "delivering") {
        drawScreenGlow(g, 0, 0);
      }

      // Draw approval flash effects
      if (agent.approval?.needed && flashIntensity !== "none") {
        if (flashIntensity === "monitor") {
          // Gold monitor flash border (1s cycle pulse)
          const pulse = 0.3 + 0.3 * Math.sin((Date.now() / 1000) * Math.PI * 2);
          const goldColor = 0xFFD700;

          // Monitor border (thicker for visibility)
          g.rect(6, 4, 116, 56); // Monitor bounds
          g.stroke({ color: goldColor, width: 3, alpha: pulse });

          // Inner glow
          g.rect(8, 6, 112, 52);
          g.stroke({ color: goldColor, width: 1, alpha: pulse * 0.5 });
        } else if (flashIntensity === "desk" || flashIntensity === "system") {
          // Red desk/system escalation glow
          const pulse = 0.3 + 0.3 * Math.sin((Date.now() / 1000) * Math.PI * 2);
          const redColor = 0xFF0000;

          // Desk area glow background
          g.rect(0, 0, CELL_W, CELL_H);
          g.fill({ color: redColor, alpha: pulse * 0.2 });

          // Outer red border
          g.rect(-2, -2, CELL_W + 4, CELL_H + 4);
          g.stroke({ color: redColor, width: 2, alpha: pulse });
        }
      }
    },
    [agent.status, agent.approval?.needed, flashIntensity]
  );

  const drawStationFront = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      drawWorkstationFront(g, 0, 0);
      drawDeskAccessories(g, 0, 0, agentIndex);
    },
    [agentIndex]
  );

  const drawNameCard = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      // Measure approximate card width
      const cardW = 24 + 16 + agent.name.length * 7 + 12;
      const cardH = 20;
      const cardX = (CELL_W - cardW) / 2;
      const cardY = -24;

      // Shadow
      g.roundRect(cardX + 1, cardY + 2, cardW, cardH, 8);
      g.fill({ color: 0x000000, alpha: 0.3 });

      // Card background
      g.roundRect(cardX, cardY, cardW, cardH, 8);
      g.fill({ color: COLORS.nameCardBg, alpha: 0.92 });

      // Pointer triangle (PixiJS 8 — use poly() for closed shapes)
      const triX = CELL_W / 2;
      g.poly([triX - 5, cardY + cardH, triX, cardY + cardH + 5, triX + 5, cardY + cardH]);
      g.fill({ color: COLORS.nameCardBg, alpha: 0.92 });

      // Status dot
      const dotColor = agent.status === "waiting_approval" ? 0xFFD700 // Gold for approval
        : agent.status === "working" ? COLORS.statusWorking
        : agent.status === "done" ? COLORS.statusDone
        : agent.status === "checkpoint" ? COLORS.statusCheckpoint
        : COLORS.statusIdle;
      const dotX = cardX + cardW - 14;
      const dotY = cardY + cardH / 2;
      // Glow (for active states + waiting approval)
      if (agent.status === "working" || agent.status === "done" || agent.status === "checkpoint" || agent.status === "waiting_approval") {
        g.circle(dotX, dotY, 5);
        g.fill({ color: dotColor, alpha: 0.25 });
      }
      g.circle(dotX, dotY, 3.5);
      g.fill({ color: dotColor });
    },
    [agent.name, agent.status]
  );

  const handleClick = () => {
    if (agent.approval?.needed && onDeskClick) {
      onDeskClick(agent.id);
    }
  };

  return (
    <pixiContainer
      x={x}
      y={y}
      interactive={agent.approval?.needed}
      cursor={agent.approval?.needed ? "pointer" : "default"}
      onPointerDown={handleClick}
    >
      {/* Layer 1: chair + monitor (behind character) */}
      <pixiGraphics draw={drawStationBack} />

      {/* Layer 2: character sprite */}
      <pixiSprite texture={currentTexture} x={40} y={58} width={48} height={48} />

      {/* Layer 3: desk surface + keyboard + accessories (in front of character) */}
      <pixiGraphics draw={drawStationFront} />

      {/* Layer 4: name card (floating above cell) */}
      <pixiGraphics draw={drawNameCard} />
      <pixiText
        text={agent.icon || "🤖"}
        style={{ fontSize: 11 } as TextStyleOptions}
        x={(CELL_W - (24 + 16 + agent.name.length * 7 + 12)) / 2 + 6}
        y={-22}
      />
      <pixiText
        text={agent.name}
        style={{
          fontSize: 11,
          fill: COLORS.nameCardText,
          fontFamily: "-apple-system, 'Segoe UI', sans-serif",
          fontWeight: "600",
        } as TextStyleOptions}
        x={(CELL_W - (24 + 16 + agent.name.length * 7 + 12)) / 2 + 24}
        y={-22}
      />
    </pixiContainer>
  );
}
