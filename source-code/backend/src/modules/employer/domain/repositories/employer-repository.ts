import { EmployerProfile } from "../employer-profile";

/**
 * @interface IEmployerRepository
 * @description Repository Pattern for Employer Domain
 * @implements Repository Pattern
 * @implements Domain Layer
 * @implements Dependency Inversion
 * @summary Contract for Employer Repository
 */
export interface IEmployerRepository {
  findById(id: string): Promise<EmployerProfile | null>;
  findByUserId(userId: string): Promise<EmployerProfile | null>;
  create(profile: EmployerProfile): Promise<EmployerProfile>;
  update(profile: EmployerProfile): Promise<EmployerProfile>;
  delete(id: string): Promise<void>;
  existsByUserId(userId: string): Promise<boolean>;
}
