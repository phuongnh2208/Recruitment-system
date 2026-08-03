/**
 * JobFormPage
 *
 * ═══════════════════════════════════════════════════════════════════
 * PRESENTATION LAYER – UI Component
 * ═══════════════════════════════════════════════════════════════════
 *
 * This is the page component for creating/editing a Job Posting (TSK-FE-JOB-201).
 * It is responsible ONLY for rendering the UI and delegating form
 * logic to the useJobForm hook. All styling follows the design
 * tokens and patterns defined in docs/design.md.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARY
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ UI rendering (JSX + TailwindCSS)
 *   - ✅ Hook delegation (calls useJobForm)
 *   - ❌ No direct API calls
 *   - ❌ No business logic
 *   - ❌ No direct axios imports
 */

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useJobForm, type JobFormMode } from "../hooks/useJobForm";
import type { JobFormValues } from "../schemas/job.schema";

/* ───────────────────────────────────────────
   Page-level layout wrapper
   ─────────────────────────────────────────── */
/**
 * Full-page layout using the `paper` background as defined in the
 * design system (docs/design.md §3.1).
 */
function PageLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">{subtitle}</p>
        </div>
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
 * <label class="block">
 *   <span class="font-body text-sm font-medium text-ink">Field label *</span>
 *   <input class="mt-1.5 w-full rounded-lg border border-ink/15 bg-white
 *          px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30
 *          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
 *   <span class="mt-1 block font-body text-xs text-danger">Error message</span>
 * </label>
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
        <span className="mt-1 block font-body text-xs text-danger" role="alert">
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

/**
 * Renders a textarea with the same styling as InputField.
 */
function TextAreaField({
  id,
  placeholder,
  error,
  rows = 4,
  ...registerProps
}: {
  id: string;
  placeholder?: string;
  error?: string;
  rows?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  return (
    <textarea
      id={id}
      rows={rows}
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
function SuccessBanner({
  onDismiss,
  mode,
}: {
  onDismiss: () => void;
  mode: JobFormMode;
}) {
  return (
    <div
      className="mb-6 rounded-lg border border-primary/20 bg-primary-light px-4 py-3"
      role="alert"
    >
      <div className="flex items-center justify-between">
        <p className="font-body text-sm font-medium text-primary">
          {mode === "create"
            ? "Tạo tin tuyển dụng thành công."
            : "Cập nhật tin tuyển dụng thành công."}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 font-body text-sm text-primary hover:text-primary-dark"
          aria-label="Đóng thông báo"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
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
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   JobFormPage
   ─────────────────────────────────────────── */

/**
 * Job Form page — follows the design system from docs/design.md.
 *
 * Supports both create and edit modes via the `mode` prop.
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
export default function JobFormPage({
  mode = "create",
  jobId,
  defaultValues,
}: {
  mode?: JobFormMode;
  jobId?: string;
  defaultValues?: Partial<JobFormValues>;
}) {
  const { form, onSubmit, isSubmitting, isSuccess, error, resetStatus } =
    useJobForm(mode, jobId, defaultValues);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const isEdit = mode === "edit";

  return (
    <PageLayout
      title={isEdit ? "Chỉnh sửa tin tuyển dụng" : "Tạo tin tuyển dụng"}
      subtitle={
        isEdit
          ? "Cập nhật thông tin tin tuyển dụng"
          : "Đăng tin tuyển dụng mới cho doanh nghiệp"
      }
    >
      {/* ── Status banners ─────────────────────────────── */}
      {isSuccess && <SuccessBanner onDismiss={resetStatus} mode={mode} />}
      {error && <ErrorBanner message={error} onDismiss={resetStatus} />}

      {/* ── Job form card ──────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 md:p-8"
      >
        <div className="space-y-6">
          <FormField
            label="Tiêu đề"
            id="title"
            required
            error={errors.title?.message}
          >
            <InputField
              id="title"
              placeholder="Ví dụ: Backend Developer Intern"
              {...register("title")}
              error={errors.title?.message}
            />
          </FormField>

          <FormField
            label="Mô tả"
            id="description"
            required
            error={errors.description?.message}
          >
            <TextAreaField
              id="description"
              placeholder="Mô tả chi tiết về công việc, môi trường làm việc..."
              rows={4}
              {...register("description")}
              error={errors.description?.message}
            />
          </FormField>

          <FormField
            label="Yêu cầu"
            id="requirements"
            required
            error={errors.requirements?.message}
          >
            <TextAreaField
              id="requirements"
              placeholder="Kỹ năng, kinh nghiệm, bằng cấp yêu cầu..."
              rows={4}
              {...register("requirements")}
              error={errors.requirements?.message}
            />
          </FormField>

          <FormField
            label="Địa điểm"
            id="location"
            required
            error={errors.location?.message}
          >
            <InputField
              id="location"
              placeholder="Ví dụ: Hà Nội, Việt Nam"
              {...register("location")}
              error={errors.location?.message}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="Lương tối thiểu (VND)"
              id="salaryMin"
              error={errors.salaryMin?.message}
            >
              <InputField
                id="salaryMin"
                type="number"
                placeholder="Ví dụ: 5000000"
                {...register("salaryMin")}
                error={errors.salaryMin?.message}
              />
            </FormField>

            <FormField
              label="Lương tối đa (VND)"
              id="salaryMax"
              error={errors.salaryMax?.message}
            >
              <InputField
                id="salaryMax"
                type="number"
                placeholder="Ví dụ: 10000000"
                {...register("salaryMax")}
                error={errors.salaryMax?.message}
              />
            </FormField>
          </div>

          <FormField
            label="Hạn nộp hồ sơ"
            id="expiresAt"
            required
            error={errors.expiresAt?.message}
          >
            <InputField
              id="expiresAt"
              type="date"
              {...register("expiresAt")}
              error={errors.expiresAt?.message}
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
            {isSubmitting
              ? "Đang lưu..."
              : isEdit
                ? "Cập nhật tin tuyển dụng"
                : "Tạo tin tuyển dụng"}
          </button>
        </div>
      </form>
    </PageLayout>
  );
}
