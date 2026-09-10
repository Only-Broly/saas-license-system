import { useEffect, useRef } from "react";
import { createPlayground } from "@/widget";
import type { PlaygroundConfig, PlaygroundInstance } from "@/widget";

export interface PlaygroundEmbedProps {
  /** Everything except `target`, which this component provides itself. */
  config: Omit<PlaygroundConfig, "target">;
  className?: string;
  /** Called once the underlying instance has been created. */
  onReady?: (instance: PlaygroundInstance) => void;
}

/**
 * This component is intentionally "dumb": it owns a `<div>` and delegates
 * 100% of playground behaviour to the widget via `createPlayground()`,
 * exactly the way a third-party React app would. No editor, execution, or
 * preview logic lives here — that would defeat the point of the demo.
 */
export default function PlaygroundEmbed({ config, className, onReady }: PlaygroundEmbedProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<PlaygroundInstance | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const instance = createPlayground({ ...config, target: hostRef.current });
    instanceRef.current = instance;
    onReady?.(instance);
    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className={className} />;
}
