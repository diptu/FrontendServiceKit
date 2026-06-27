# TypeScript Production Master Skill & Best Practices

Provides advanced guidance on TypeScript configuration, type safety, and architectural patterns. Use this when the user needs help with complex type definitions, refactoring to TS, debugging type errors, or designing scalable domain models.

---

## 1. Type Safety First
Prioritize clear, explicit typing over `any`. When faced with complex data structures, define robust interfaces or types that reflect the domain model accurately.

* **Discriminated Unions**: Prefer over boolean flags to represent state.
    ```typescript
    type RequestState = 
      | { status: 'loading' }
      | { status: 'success'; data: T }
      | { status: 'error'; error: Error };
    ```
* **Branded Types**: Enforce domain-specific constraints at the type level.
    ```typescript
    type OrderId = string & { readonly __brand: unique symbol };
    ```

## 2. Advanced Patterns
Leverage the language's power to minimize boilerplate and ensure safety.

* **Generics**: Create reusable, type-safe components.
    ```typescript
    function mapResults<T, U>(items: T[], mapper: (item: T) => U): U[] {
      return items.map(mapper);
    }
    ```
* **Utility Types**: Reduce redundancy with built-in utilities like `Pick`, `Omit`, `Partial`, and `Record`.
* **Mapped & Conditional Types**: Use these for complex type transformations and strict API contracts.

## 3. Strictness & Configuration
Assume `strict: true` (or higher) in `tsconfig.json`. When resolving type errors, explain the underlying constraint—**never** use `as any` as a permanent solution.

* **`unknown` vs `any`**: Always prefer `unknown` for data from external sources (API responses, event data) and use type guards or Zod schemas to refine the type.

## 4. Refactoring Advice
Promote "TypeScript-idiomatic" approaches:
* Use **Discriminated Unions** instead of boolean flags.
* Use `as const` objects instead of legacy `Enum` patterns for sets of constants.
* Prefer interfaces for object shapes and types for unions/intersections.

## 5. Documentation & Maintenance
Encourage **TSDoc** (`/** ... */`) for exported functions and complex types. This ensures the codebase remains self-documenting and IDE-friendly, facilitating long-term scalability.

---

### Execution Framework
When addressing TypeScript challenges, follow these steps:
1.  **Analyze**: Evaluate the existing type definition or error.
2.  **Constraint**: Identify which strict compiler setting or type safety rule is being violated.
3.  **Refactor**: Implement a solution using the patterns above.
4.  **Validate**: Explain how the fix improves type safety and prevents future runtime errors.

---
*Execution: Run `/typescript` for specialized architectural advice or debugging assistance.*