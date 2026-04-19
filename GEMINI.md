# Digital Whiteboard Project Status

## Current Status (April 19, 2026)
- **Engine Revamp:** Completely removed Tldraw dependencies due to UI restrictiveness and overlapping issues.
- **Custom React/Canvas Engine:** Built a bespoke React+Zustand infinite canvas allowing exact granular control.
  - Custom vector stroke engine with perfect-freehand (sketchy and solid styles).
  - Infinite pan/zoom scaling.
  - Native Eraser functionality (Stroke/Radius splitting mode & Entity deletion mode).
  - Custom DOM overlay system for Graphs and TextBoxes.
- **Math & Science Modes:** Rebuilt the `TextBox` component wrapping MathLive. 
  - "Math" and "Science" are now global toggle states determining the type of box spawned. 
  - Auto-formatting units, Desmos-style input (virtual keyboards completely suppressed). 
  - The `chem-unit` backgrounds and strikethroughs trigger flawlessly.
- **Graphing:** Embedded Desmos calculators remain fully resizable and draggable via top handle.
- **Animations:** Thanos snap pixel dust effect correctly partitions existing DOM pixels into 3x3 particles with varied delay physics.

## Next Steps / Focus
- Further optimize stroke splitting algorithm for partial radius erasing on large shapes.
- Expand Science mode unit libraries if requested.
