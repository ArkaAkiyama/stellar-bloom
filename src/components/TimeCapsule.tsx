import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { content } from "@/config/content";

interface TimeCapsuleProps {
  visible: boolean;
}

/**
 * Time capsule: animated day counter, message count, "still loading forever".
 */
export default function TimeCapsule({ visible }: TimeCapsuleProps) {
  const [days, setDays] = useState(0);
  const [messages, setMessages] = useState(0);
  const animatedRef = useRef(false);

  const actualDays = Math.floor(
    (Date.now() - new Date(content.timeCapsule.startDate).getTime()) / 86400000
  );

  // Animate counters on mount
  useEffect(() => {
    if (!visible || animatedRef.current) return;
    animatedRef.current = true;

    const duration = 2000;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDays(Math.floor(eased * actualDays));
      setMessages(Math.floor(eased * content.timeCapsule.mockMessageCount));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, actualDays]);

  if (!visible) return null;

  const stats = [
    { label: "Days together", value: days.toLocaleString() },
    { label: "Messages exchanged", value: messages.toLocaleString() },
    { label: "Love", value: "Still loading forever..." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="fixed inset-0 z-20 flex items-center justify-center px-6"
    >
      <div
        className="max-w-md w-full rounded-2xl border p-8 md:p-10"
        style={{
          background: "hsla(250, 30%, 8%, 0.6)",
          borderColor: "hsla(270, 20%, 30%, 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.3, duration: 0.8 }}
              className="text-center"
            >
              <p
                className="font-mono text-3xl font-light tracking-wider md:text-4xl"
                style={{ color: "hsl(270, 40%, 80%)" }}
              >
                {stat.value}
              </p>
              <p
                className="mt-1 text-xs uppercase tracking-[0.25em]"
                style={{ color: "hsl(270, 15%, 50%)" }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
