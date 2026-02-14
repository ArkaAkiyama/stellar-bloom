import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
import { content } from "@/config/content";

interface VoiceMessageProps {
  visible: boolean;
}

/**
 * Hidden voice message player. Reveals a play button on interaction,
 * plays audio via Howler.js with a pulsing waveform visual.
 */
export default function VoiceMessage({ visible }: VoiceMessageProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    if (!howlRef.current) return;
    const seek = howlRef.current.seek() as number;
    const duration = howlRef.current.duration();
    if (duration > 0) setProgress(seek / duration);
    rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const handlePlay = () => {
    if (playing && howlRef.current) {
      howlRef.current.pause();
      setPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    if (howlRef.current) {
      howlRef.current.play();
      setPlaying(true);
      rafRef.current = requestAnimationFrame(updateProgress);
      return;
    }

    try {
      const howl = new Howl({
        src: [content.audio.voiceMessage],
        volume: 0.8,
        html5: true,
        onplay: () => {
          setPlaying(true);
          rafRef.current = requestAnimationFrame(updateProgress);
        },
        onend: () => {
          setPlaying(false);
          setProgress(0);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
        },
        onloaderror: () => {
          console.info("[Audio] Voice message file not found, skipping.");
        },
      });
      howlRef.current = howl;
      howl.play();
    } catch {
      // Fail silently
    }
  };

  if (!visible) return null;

  // Generate waveform bars
  const barCount = 24;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const baseHeight = 0.3 + Math.sin(i * 0.6) * 0.3;
    const activeHeight = playing
      ? baseHeight + Math.sin(Date.now() * 0.005 + i * 0.8) * 0.3
      : baseHeight;
    return Math.max(0.15, Math.min(1, activeHeight));
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="fixed inset-0 z-20 flex items-center justify-center px-6"
    >
      <div
        className="max-w-sm w-full rounded-2xl border p-8 md:p-10"
        style={{
          background: "hsla(250, 30%, 8%, 0.6)",
          borderColor: "hsla(270, 20%, 30%, 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <p
          className="mb-6 text-center font-serif text-sm uppercase tracking-[0.25em]"
          style={{ color: "hsl(270, 15%, 50%)" }}
        >
          A message for you
        </p>

        {/* Waveform visualization */}
        <div className="flex items-center justify-center gap-[2px] h-16 mb-6">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              animate={{ scaleY: h }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-1 rounded-full origin-center"
              style={{
                height: "100%",
                background:
                  i / barCount <= progress
                    ? "hsl(270, 45%, 70%)"
                    : "hsl(270, 15%, 25%)",
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Play/Pause button */}
        <div className="flex justify-center">
          <button
            onClick={handlePlay}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-500"
            style={{
              borderColor: "hsl(270, 25%, 35%)",
              background: "hsla(270, 30%, 12%, 0.6)",
            }}
          >
            {playing ? (
              <div className="flex gap-1">
                <span
                  className="block w-1 h-4 rounded-full"
                  style={{ background: "hsl(270, 40%, 75%)" }}
                />
                <span
                  className="block w-1 h-4 rounded-full"
                  style={{ background: "hsl(270, 40%, 75%)" }}
                />
              </div>
            ) : (
              <span
                className="block ml-1"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderLeft: "14px solid hsl(270, 40%, 75%)",
                }}
              />
            )}

            {/* Pulse ring when playing */}
            <AnimatePresence>
              {playing && (
                <motion.span
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: "hsl(270, 35%, 50%)" }}
                />
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
