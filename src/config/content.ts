/**
 * Personal Content Configuration
 * Edit this file to customize all text, dates, names, and media.
 * No need to touch any component code.
 */

export const content = {
  // — Intro —
  intro: {
    line: "This space exists for one person. You.",
    buttonText: "Enter",
  },

  // — Partner info (used for easter egg) —
  partner: {
    name: "Her",
    secretMessage: "You found it. You always find your way to me.",
  },

  // — Love Letter —
  loveLetter: {
    paragraphs: [
      "I never believed in forever until I met you.",
      "Every moment with you feels like the universe conspired just for us.",
      "You are the calm in my chaos, the light in my dark.",
      "This is not just love. This is home.",
    ],
  },

  // — Time Capsule —
  timeCapsule: {
    startDate: "2023-06-15", // YYYY-MM-DD — when you started
    mockMessageCount: 12483,
  },

  // — Memories (placeholder images for now) —
  memories: [
    { src: "/placeholder.svg", caption: "The day it all began" },
    { src: "/placeholder.svg", caption: "Our first adventure" },
    { src: "/placeholder.svg", caption: "That quiet evening" },
    { src: "/placeholder.svg", caption: "Dancing in the rain" },
    { src: "/placeholder.svg", caption: "Where we belong" },
  ],

  // — Ending —
  ending: {
    line: "I'm choosing you. Every day.",
    signature: "— Yours, always",
  },

  // — Audio (placeholder paths — replace with real files) —
  audio: {
    ambient: "/audio/ambient.mp3",
    voiceMessage: "/audio/voice.mp3",
  },
} as const;
