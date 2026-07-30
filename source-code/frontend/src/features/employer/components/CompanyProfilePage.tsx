/**
 * CompanyProfilePage
 *
 * ═══════════════════════════════════════════════════════════════════
 * PRESENTATION LAYER – UI Component
 * ═══════════════════════════════════════════════════════════════════
 *
 * This is the page component for the Employer Company Profile (TSK-FE-EM-201).
 * It is responsible ONLY for rendering the UI and delegating form
 * logic to the useCompanyProfileForm hook. All styling follows the design
 * tokens and patterns defined in docs/design.md.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARY
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ UI rendering (JSX + TailwindCSS)
 *   - ✅ Hook delegation (calls useCompanyProfileForm)
 *   - ❌ No direct API calls
 *   - ❌ No business logic
 *   - ❌ No direct axios imports
 */

import { useCompanyProfileForm } from "../hooks/useCompanyProfileForm";

/* ───────────────────────────────────────────
   Page-level layout wrapper
   ─────────────────────────────────────────── */
/**
 * Full-page layout using the `paper` background as defined in the
 * design system (docs/design.md §3.1).
 */
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Form Input (design.md §5.4)
   ─────────────────────────────────────────── */

/**
 * Renders one form field using the exact markup from docs/design.md §5.4:
 *
 * ```html
 * <label class="block">
 *   <span class="font-body text-sm font-medium text-ink">Field label *</span>
 *   <input class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white
 *          px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30
 *          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
 *   <span class="mt-1 block font-body text-xs text-danger">Error message</span>
 * </label>
 * ```
 */
function FormField({
  label,
  id,
  error,
  required,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="font-body text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block font-body text-xs text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

/**
 * Renders a text input with the exact classes from docs/design.md §5.4.
 * Accepts React Hook Form register spread props.
 */
function InputField({
  id,
  type = "text",
  placeholder,
  error,
  ...registerProps
}: {
  id: string;
  type?: string;
  placeholder?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
        error ? "border-danger" : "border-ink/15"
      }`}
      {...registerProps}
    />
  );
}

/* ───────────────────────────────────────────
   Notifications (design.md §8 – Accessibility)
   ─────────────────────────────────────────── */

/**
 * Success notification banner — follows the accessibility guideline
 * that error/success states always have visible text (NFR-22).
 */
function SuccessBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="mb-6 rounded-lg border border-primary/20 bg-primary-light px-4 py-3"
      role="alert"
    >
      <div className="flex items-center justify-between">
        <p className="font-body text-sm font-medium text-primary">
          Hồ sơ công ty đã được cập nhật thành công.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 font-body text-sm text-primary hover:text-primary-dark"
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Error notification banner.
 */
function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
      role="alert"
    >
      <div className="flex items-center justify-between">
        <p className="font-body text-sm font-medium text-danger">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 font-body text-sm text-danger hover:text-danger/80"
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   CompanyProfilePage
   ─────────────────────────────────────────── */

/**
 * Company Profile page — follows the design system from docs/design.md.
 *
 * **Typography (design.md §3.2):**
 * - H1 uses `font-display font-semibold`, scaled for page heading context
 * - Body text uses `font-body`
 *
 * **Card (design.md §5.2):**
 * - `rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5`
 *
 * **Button (design.md §5.1):**
 * - Primary  → `rounded-seal bg-primary px-6 py-2.5 font-body font-medium
 *                text-white shadow-card transition hover:bg-primary-dark`
 * - Disabled → `rounded-seal bg-sage px-6 py-2.5 font-body text-ink/40
 *                cursor-not-allowed`
 *
 * **Form Input (design.md §5.4):**
 * - `<label class="block">` wrapping label text + input + error span
 */
export default function CompanyProfilePage() {
  const { form, onSubmit, isSubmitting, isSuccess, error, resetStatus } =
    useCompanyProfileForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <PageLayout>
      {/* ── Page header ────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
          Hồ sơ Doanh nghiệp
        </h1>
        <p className="mt-1 font-body text-sm text-ink/60">
          Quản lý thông tin giới thiệu công ty của bạn
        </p>
      </div>

      {/* ── Status banners ─────────────────────────────── */}
      {isSuccess && <SuccessBanner onDismiss={resetStatus} />}
      {error && <ErrorBanner message={error} onDismiss={resetStatus} />}

      {/* ── Profile form card ──────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 md:p-8"
      >
        <div className="space-y-6">
          <FormField
            label="Tên công ty"
            id="companyName"
            required
            error={errors.companyName?.message}
          >
            <InputField
              id="companyName"
              placeholder="Công ty TNHH ABC"
              {...register("companyName")}
              error={errors.companyName?.message}
            />
          </FormField>

          <FormField
            label="Mô tả"
            id="description"
            error={errors.description?.message}
          >
            <textarea
              id="description"
              rows={4}
              placeholder="Giới thiệu ngắn gọn về công ty..."
              className={`mt-1.5 w-full rounded-lg border bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.description ? "border-danger" : "border-ink/15"
              }`}
              {...register("description")}
            />
          </FormField>

          <FormField
            label="Website"
            id="website"
            error={errors.website?.message}
          >
            <InputField
              id="website"
              type="url"
              placeholder="https://example.com"
              {...register("website")}
              error={errors.website?.message}
            />
          </FormField>

          <FormField
            label="Logo URL"
            id="logoUrl"
            error={errors.logoUrl?.message}
          >
            <InputField
              id="logoUrl"
              placeholder="https://example.com/logo.png"
              {...register("logoUrl")}
              error={errors.logoUrl?.message}
            />
          </FormField>
        </div>

        {/* ── Submit button (design.md §5.1) ────────────── */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-sage disabled:text-ink/40"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </PageLayout>
  );
}
