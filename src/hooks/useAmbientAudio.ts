import { useRef, useCallback } from "react";
import { Howl } from "howler";
import { content } from "@/config/content";

/**
 * Manages ambient audio playback via Howler.js.
 * Returns play/stop controls. Handles missing files gracefully.
 */
export function useAmbientAudio() {
  const howlRef = useRef<Howl | null>(null);

  const play = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.play();
      return;
    }
    try {
      const howl = new Howl({
        src: [content.audio.ambient],
        loop: true,
        volume: 0.3,
        html5: true, // better mobile compat
        onloaderror: () => {
          // Placeholder file doesn't exist — fail silently
          console.info("[Audio] Ambient file not found, skipping.");
        },
      });
      howlRef.current = howl;
      howl.play();
    } catch {
      // Fail silently
    }
  }, []);

  const stop = useCallback(() => {
    howlRef.current?.fade(howlRef.current.volume(), 0, 2000);
  }, []);

  return { play, stop };
}
