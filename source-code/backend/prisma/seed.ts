/**
 * Database Seed Script
 *
 * Creates demo data for the Recruitment System:
 * - 1 Administrator
 * - 1 Employer (verified)
 * - 1 Student
 * - CVs for the student
 * - Job postings (draft, pending, approved)
 * - Applications
 *
 * Run with: npx prisma db seed
 * or: npm run seed
 */

import { PrismaClient, Role, JobState, ApplicationState } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data (order matters due to FK constraints)
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.application.deleteMany();
  await prisma.cV.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Administrator
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@recruitment.com",
      passwordHash,
      role: Role.ADMINISTRATOR,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("Created admin:", adminUser.email);

  // 2. Employer
  const employerUser = await prisma.user.create({
    data: {
      email: "employer@company.com",
      passwordHash,
      role: Role.EMPLOYER,
      isActive: true,
      emailVerified: true,
      employerProfile: {
        create: {
          companyName: "TechCorp Vietnam",
          companyDescription: "Cong ty cong nghe hang dau tai Viet Nam, chuyen ve phat trien phan mem va giai phap so.",
          website: "https://techcorp.vn",
          address: "Ha Noi, Viet Nam",
          verified: true,
          verifiedAt: new Date(),
          verifiedBy: adminUser.id,
        },
      },
    },
    include: { employerProfile: true },
  });
  console.log("Created employer:", employerUser.email);

  // 3. Student
  const studentUser = await prisma.user.create({
    data: {
      email: "student@university.edu",
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      emailVerified: true,
      studentProfile: {
        create: {
          fullName: "Nguyen Van A",
          phone: "0123456789",
          address: "Ha Noi, Viet Nam",
          university: "Dai hoc Bach Khoa Ha Noi",
          major: "Ky thuat phan mem",
          graduationYear: 2025,
        },
      },
    },
    include: { studentProfile: true },
  });
  console.log("Created student:", studentUser.email);

  // 4. CVs for Student
  const cv1 = await prisma.cV.create({
    data: {
      studentId: studentUser.studentProfile!.id,
      fileName: "CV_NguyenVanA_2025.pdf",
      filePath: "/uploads/cv1.pdf",
      fileSize: 245678,
      mimeType: "application/pdf",
      isDefault: true,
    },
  });

  const cv2 = await prisma.cV.create({
    data: {
      studentId: studentUser.studentProfile!.id,
      fileName: "CV_NguyenVanA_Intern.pdf",
      filePath: "/uploads/cv2.pdf",
      fileSize: 198432,
      mimeType: "application/pdf",
      isDefault: false,
    },
  });
  console.log("Created 2 CVs for student");

  // Update default CV
  await prisma.studentProfile.update({
    where: { id: studentUser.studentProfile!.id },
    data: { defaultCvId: cv1.id },
  });

  // 5. Job Postings
  const job1 = await prisma.jobPosting.create({
    data: {
      employerId: employerUser.employerProfile!.id,
      title: "Backend Developer Intern",
      description: "Chung toi dang tim kiem thuc tap sinh phat trien Backend Node.js. Ban se lam viec voi Express, PostgreSQL va cac cong nghe hien dai.",
      requirements: "Kien thuc co ban ve Node.js, JavaScript, REST API. Kha nang hoc hoi nhanh va lam viec nhom.",
      location: "Ha Noi, Viet Nam",
      jobType: "Internship",
      salaryRange: "5-8 trieu VND",
      state: JobState.APPROVED,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
      approvedBy: adminUser.id,
    },
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      employerId: employerUser.employerProfile!.id,
      title: "Frontend Developer (React)",
      description: "Tim kiem lap trinh vien Frontend co kinh nghiem voi React va TypeScript. Lam viec trong moi truong agile.",
      requirements: "2+ nam kinh nghiem React, TypeScript, TailwindCSS. Hieu ve REST API va GraphQL.",
      location: "Ho Chi Minh, Viet Nam",
      jobType: "Full-time",
      salaryRange: "15-25 trieu VND",
      state: JobState.APPROVED,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
      approvedBy: adminUser.id,
    },
  });

  const job3 = await prisma.jobPosting.create({
    data: {
      employerId: employerUser.employerProfile!.id,
      title: "DevOps Engineer",
      description: "Quan ly infrastructure, CI/CD, Docker, Kubernetes. Lam viec voi AWS va Azure.",
      requirements: "Kinh nghiem Docker, Kubernetes, CI/CD. AWS certification la mot loi the.",
      location: "Da Nang, Viet Nam",
      jobType: "Full-time",
      salaryRange: "20-35 trieu VND",
      state: JobState.PENDING,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  const job4 = await prisma.jobPosting.create({
    data: {
      employerId: employerUser.employerProfile!.id,
      title: "Mobile Developer (Flutter)",
      description: "Phat trien ung dung mobile bang Flutter cho iOS va Android.",
      requirements: "Kinh nghiem Flutter, Dart. Hieu ve state management va REST API.",
      location: "Ha Noi, Viet Nam",
      jobType: "Full-time",
      salaryRange: "12-20 trieu VND",
      state: JobState.DRAFT,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("Created 4 job postings (2 approved, 1 pending, 1 draft)");

  // 6. Applications
  await prisma.application.create({
    data: {
      jobId: job1.id,
      studentId: studentUser.studentProfile!.id,
      cvId: cv1.id,
      coverLetter: "Toi rat quan tam den vi tri thuc tap sinh Backend tai TechCorp. Toi co kien thuc ve Node.js va muon phat trien ky nang.",
      state: ApplicationState.UNDER_REVIEW,
    },
  });

  await prisma.application.create({
    data: {
      jobId: job2.id,
      studentId: studentUser.studentProfile!.id,
      cvId: cv2.id,
      coverLetter: "Toi ung tuyen vi tri Frontend Developer. Toi co kinh nghiem voi React va TypeScript.",
      state: ApplicationState.APPLIED,
    },
  });
  console.log("Created 2 applications");

  console.log("Seed completed successfully!");
  console.log("");
  console.log("Demo Accounts:");
  console.log("  Admin:     admin@recruitment.com / Password123!");
  console.log("  Employer:  employer@company.com / Password123!");
  console.log("  Student:   student@university.edu / Password123!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
