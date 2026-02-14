import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { content } from "@/config/content";

interface LoveLetterProps {
  visible: boolean;
  onComplete?: () => void;
}

export default function LoveLetter({ visible, onComplete }: LoveLetterProps) {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paragraphs = content.loveLetter.paragraphs;

  useEffect(() => {
    if (visible && !started) {
      const t = setTimeout(() => setStarted(true), 600);
      return () => clearTimeout(t);
    }
  }, [visible, started]);

  useEffect(() => {
    if (!started || currentParagraph >= paragraphs.length) {
      if (currentParagraph >= paragraphs.length) onComplete?.();
      return;
    }

    const full = paragraphs[currentParagraph];
    if (displayedText.length < full.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText(full.slice(0, displayedText.length + 1));
      }, 45);
    } else {
      timeoutRef.current = setTimeout(() => {
        setCurrentParagraph((p) => p + 1);
        setDisplayedText("");
      }, 1200);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [started, displayedText, currentParagraph, paragraphs, onComplete]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="fixed inset-0 z-20 flex items-center justify-center px-6"
    >
      <div className="glass-panel max-w-lg w-full rounded-2xl border p-8 md:p-12">
        {/* Header decoration */}
        <div className="flex justify-center mb-8">
          <div
            className="h-px w-16 shimmer-line"
            style={{ background: "hsl(var(--cosmos-glow) / 0.3)" }}
          />
        </div>

        {paragraphs.slice(0, currentParagraph).map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="mb-5 text-base leading-[1.9] md:text-lg"
            style={{ color: "hsl(var(--cosmos-text))" }}
          >
            {p}
          </motion.p>
        ))}

        {currentParagraph < paragraphs.length && (
          <p
            className="mb-5 text-base leading-[1.9] md:text-lg"
            style={{ color: "hsl(var(--cosmos-text))" }}
          >
            {displayedText}
            <span
              className="inline-block w-0.5 ml-0.5 animate-pulse"
              style={{
                height: "1.1em",
                background: "hsl(var(--cosmos-glow))",
                verticalAlign: "text-bottom",
              }}
            />
          </p>
        )}
      </div>
    </motion.div>
  );
}
