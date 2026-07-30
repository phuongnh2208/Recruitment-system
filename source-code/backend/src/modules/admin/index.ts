export { PrismaAdminRepository } from "./infrastructure";
export {
  IAdminRepository,
  DashboardStats,
  PendingEmployer,
  PendingJob,
  UserListItem,
  PaginatedResult,
} from "./domain";
export {
  VerifyEmployerUseCase,
  ApproveJobPostingUseCase,
  RejectJobPostingUseCase,
  ManageUserAccountUseCase,
  GetDashboardStatsUseCase,
} from "./application";
export type {
  VerifyEmployerCommand,
  VerifyEmployerResult,
  ApproveJobPostingCommand,
  ApproveJobPostingResult,
  RejectJobPostingCommand,
  RejectJobPostingResult,
  ManageUserAccountCommand,
  ManageUserAccountResult,
  GetDashboardStatsResult,
} from "./application";
export { AdminController, createAdminRouter } from "./presentation";
export { createAdminModule } from "./composition";
export type { AdminModuleDependencies, AdminModuleOutput } from "./composition";
