description: Provides expert-level implementation guidance for Motion (Framer Motion) in React. Use this when the user needs to build complex animations, design interactive components, optimize animation performance, or integrate motion into data visualizations.


## Instructionsf

When asked to provide motion solutions, adhere to the following framework:

Architecture First: If the request involves complex sequences, start by defining the variants object to ensure the logic is declarative and maintainable.

Performance Check: Always consider if the animation can be handled using hardware-accelerated properties (transform, opacity). Suggest the layout prop for layout shifts and warn against animating properties that trigger reflow (like top, left, or width for non-SVG elements) if performance is a concern.

Data-Driven Animations: If the user is animating charts or dynamic lists, prioritize the use of AnimatePresence for lifecycle management and useSpring for physics-based fluidity.

Actionable Code: Provide clean, TypeScript-ready snippets. Use comments to explain why specific props (like staggerChildren or layoutId) were chosen to achieve the desired motion effect.

Contextual Awareness: Briefly highlight accessibility (e.g., respecting prefers-reduced-motion) or potential UX pitfalls if the animation could distract from core functionality

**Execution** RUN /motion/