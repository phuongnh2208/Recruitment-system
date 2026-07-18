/**
 * Student Module Composition Root barrel export.
 *
 * ═══════════════════════════════════════════════════════════════════
 * COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Composition Root is the single entry point where all dependencies
 * for the Student module are wired together. It is the **only** place
 * permitted to use the `new` keyword to instantiate concrete classes.
 *
 * All layers (Infrastructure, Domain, Application, Presentation) are
 * assembled here following Clean Architecture principles.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARY ENFORCEMENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * - Controllers, Routers, Use Cases, and Repositories do NOT create
 *   their own dependencies — they receive them via constructor injection.
 * - No Service Locator, no global variables, no IoC framework.
 * - Only constructor injection is used.
 *
 * @category Composition Root
 */
export { createStudentModule } from "./student-module";
