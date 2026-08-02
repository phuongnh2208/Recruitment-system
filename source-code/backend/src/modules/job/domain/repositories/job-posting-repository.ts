import { JobPosting } from "../entities/job-posting";
import { JobStateValue } from "../value-objects/job-state";

/**
 * Search criteria for querying job postings.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY NOT USE PARTIAL<JobPostingProps>?
 * ═══════════════════════════════════════════════════════════════════
 *
 * A dedicated search criteria interface keeps the repository contract
 * explicit and stable. Changes to the entity shape should not
 * automatically leak into search capabilities.
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export interface JobSearchCriteria {
  /** Free-text search in title, description, and requirements. */
  keyword?: string;
  /** Filter by location. */
  location?: string;
  /** Filter by employer ID. */
  employerId?: string;
  /** Filter by job state. */
  state?: JobStateValue;
  /** Filter by minimum salary. */
  salaryMin?: number;
  /** Filter by maximum salary. */
  salaryMax?: number;
}

/**
 * Paginated result wrapper.
 */
export interface PaginatedJobResult {
  items: JobPosting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Repository Pattern for Job Domain
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY REPOSITORY PATTERN?
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Repository Pattern abstracts data access behind an interface
 * defined in the Domain Layer. This enables:
 *
 * 1. **Dependency Inversion**: Use Cases depend on the interface,
 *    not on concrete implementations (e.g. PrismaJobPostingRepository).
 * 2. **Testability**: Use Cases can be tested with mock repositories.
 * 3. **Persistence Ignorance**: The Domain Layer is completely
 *    unaware of the underlying database technology.
 * 4. **Swappable Implementations**: The same interface can have
 *    Prisma, in-memory, or test implementations.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION
 * ═══════════════════════════════════════════════════════════════════
 *
 *   Application Layer (Use Cases)
 *         │  depends on
 *         ▼
 *   IJobPostingRepository ←── interface (this file) [Domain Layer]
 *         ▲  implements
 *         │
 *   PrismaJobPostingRepository [Infrastructure Layer]
 *
 * The Use Case never imports PrismaJobPostingRepository. It only
 * knows IJobPostingRepository.
 *
 * @interface IJobPostingRepository
 * @implements Repository Pattern
 * @implements Domain Layer
 * @implements Dependency Inversion
 * @summary Contract for Job Posting Repository
 */
export interface IJobPostingRepository {
  /**
   * Find a job posting by its ID.
   * @param id - The job posting ID.
   * @returns The job posting, or null if not found.
   */
  findById(id: string): Promise<JobPosting | null>;

  /**
   * Find all job postings belonging to an employer.
   * @param employerId - The employer's user ID.
   * @returns Array of job postings.
   */
  findByEmployerId(employerId: string): Promise<JobPosting[]>;

  /**
   * Find approved job postings with pagination.
   * Only returns postings in APPROVED state.
   * @param page - The page number (1-based).
   * @param limit - The number of items per page.
   * @returns Paginated result of approved job postings.
   */
  findApproved(page: number, limit: number): Promise<PaginatedJobResult>;

  /**
   * Search job postings by criteria with pagination.
   * Supports free-text search, location, salary range, and state filters.
   * @param criteria - The search criteria.
   * @param page - The page number (1-based, default: 1).
   * @param limit - The number of items per page (default: 10).
   * @returns Paginated result of matching job postings.
   */
  search(criteria: JobSearchCriteria, page?: number, limit?: number): Promise<PaginatedJobResult>;

  /**
   * Persist a new job posting.
   * @param job - The job posting entity to create.
   */
  create(job: JobPosting): Promise<void>;

  /**
   * Update an existing job posting.
   * @param job - The job posting entity with updated values.
   */
  update(job: JobPosting): Promise<void>;

  /**
   * Delete a job posting by its ID.
   * @param id - The job posting ID.
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a job posting exists by its ID.
   * @param id - The job posting ID.
   * @returns True if the job posting exists.
   */
  exists(id: string): Promise<boolean>;
}
