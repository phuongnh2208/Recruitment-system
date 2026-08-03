/**
 * Database Seed Script
 *
 * Creates demo data for the Recruitment System:
 * - 1 Administrator
 * - 1 Employer (verified)
 * - 1 Student
 * - CVs for the student (real PDF files written to disk)
 * - Job postings (draft, pending, approved, closed) across industries/locations
 * - Applications
 *
 * Run with: npx prisma db seed
 * or: npm run seed
 */

import { PrismaClient, Role, JobState, ApplicationState } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const UPLOAD_ROOT = join(__dirname, "..", "uploads");

/**
 * Minimal, valid, single-page PDF file content.
 * Written to disk so CV "view" links always resolve to a real file.
 */
function minimalPdfBuffer(title: string): Buffer {
  const text = `CV - ${title}`;
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length ${text.length + 40}>>stream
BT /F1 18 Tf 72 700 Td (${text}) Tj ET
endstream
endobj
xref
0 6
0000000000 65535 f
trailer<</Size 6/Root 1 0 R>>
startxref
0
%%EOF`;
  return Buffer.from(content, "utf-8");
}

/** Writes a seed CV PDF to disk and returns its relative storage path. */
function writeSeedCv(studentId: string, label: string): { storagePath: string; fileSize: number } {
  const dir = join(UPLOAD_ROOT, "cv", studentId);
  mkdirSync(dir, { recursive: true });
  const fileName = `${randomUUID()}.pdf`;
  const buffer = minimalPdfBuffer(label);
  writeFileSync(join(dir, fileName), buffer);
  return { storagePath: `cv/${studentId}/${fileName}`, fileSize: buffer.length };
}

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
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const employerPasswordHash = await bcrypt.hash("Employer@123", 10);
  const studentPasswordHash = await bcrypt.hash("Student@123", 10);

  // 1. Administrator
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@trusthire.local",
      passwordHash: adminPasswordHash,
      role: Role.ADMINISTRATOR,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("Created admin:", adminUser.email);

  // 2. Employer
  const employerUser = await prisma.user.create({
    data: {
      email: "employer@trusthire.local",
      passwordHash: employerPasswordHash,
      role: Role.EMPLOYER,
      isActive: true,
      emailVerified: true,
      employerProfile: {
        create: {
          companyName: "Công ty Công nghệ TrustHire",
          companyDescription:
            "Công ty công nghệ hàng đầu tại Việt Nam, chuyên phát triển phần mềm và giải pháp số cho doanh nghiệp.",
          website: "https://trusthire.local",
          address: "Hà Nội, Việt Nam",
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
      email: "student@trusthire.local",
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      isActive: true,
      emailVerified: true,
      studentProfile: {
        create: {
          fullName: "Nguyễn Văn A",
          phone: "0912345678",
          address: "Hà Nội, Việt Nam",
          university: "Đại học Bách Khoa Hà Nội",
          major: "Kỹ thuật phần mềm",
          graduationYear: 2025,
        },
      },
    },
    include: { studentProfile: true },
  });
  console.log("Created student:", studentUser.email);

  // 4. CVs for Student — real PDF files written to uploads/cv/<studentId>/
  const studentProfileId = studentUser.studentProfile!.id;
  const cv1File = writeSeedCv(studentProfileId, "Nguyen Van A - Backend");
  const cv2File = writeSeedCv(studentProfileId, "Nguyen Van A - Frontend");

  const cv1 = await prisma.cV.create({
    data: {
      studentId: studentProfileId,
      fileName: "CV_NguyenVanA_Backend.pdf",
      originalFileName: "CV_NguyenVanA_Backend.pdf",
      filePath: cv1File.storagePath,
      fileSize: cv1File.fileSize,
      mimeType: "application/pdf",
      isDefault: true,
    },
  });

  const cv2 = await prisma.cV.create({
    data: {
      studentId: studentProfileId,
      fileName: "CV_NguyenVanA_Frontend.pdf",
      originalFileName: "CV_NguyenVanA_Frontend.pdf",
      filePath: cv2File.storagePath,
      fileSize: cv2File.fileSize,
      mimeType: "application/pdf",
      isDefault: false,
    },
  });
  console.log("Created 2 CVs for student (real PDF files on disk)");

  // Update default CV
  await prisma.studentProfile.update({
    where: { id: studentProfileId },
    data: { defaultCvId: cv1.id },
  });

  // 5. Job Postings — varied industries, locations, salaries, states
  const employerId = employerUser.employerProfile!.id;

  const job1 = await prisma.jobPosting.create({
    data: {
      employerId,
      title: "Backend Developer Intern",
      description:
        "Chúng tôi đang tìm kiếm thực tập sinh phát triển Backend Node.js. Bạn sẽ làm việc với Express, MySQL và các công nghệ hiện đại.",
      requirements: "Kiến thức cơ bản về Node.js, JavaScript, REST API. Khả năng học hỏi nhanh và làm việc nhóm.",
      location: "Hà Nội, Việt Nam",
      jobType: "Internship",
      salaryRange: "5-8 triệu VNĐ",
      state: JobState.APPROVED,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
      approvedBy: adminUser.id,
    },
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      employerId,
      title: "Frontend Developer (React)",
      description:
        "Tìm kiếm lập trình viên Frontend có kinh nghiệm với React và TypeScript. Làm việc trong môi trường Agile.",
      requirements: "2+ năm kinh nghiệm React, TypeScript, TailwindCSS. Hiểu về REST API và GraphQL.",
      location: "Hồ Chí Minh, Việt Nam",
      jobType: "Full-time",
      salaryRange: "15-25 triệu VNĐ",
      state: JobState.APPROVED,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
      approvedBy: adminUser.id,
    },
  });

  const job3 = await prisma.jobPosting.create({
    data: {
      employerId,
      title: "DevOps Engineer",
      description: "Quản lý hạ tầng, CI/CD, Docker, Kubernetes. Làm việc với AWS và Azure.",
      requirements: "Kinh nghiệm Docker, Kubernetes, CI/CD. Chứng chỉ AWS là một lợi thế.",
      location: "Đà Nẵng, Việt Nam",
      jobType: "Full-time",
      salaryRange: "20-35 triệu VNĐ",
      state: JobState.PENDING,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  const job4 = await prisma.jobPosting.create({
    data: {
      employerId,
      title: "Mobile Developer (Flutter)",
      description: "Phát triển ứng dụng di động bằng Flutter cho iOS và Android.",
      requirements: "Kinh nghiệm Flutter, Dart. Hiểu về state management và REST API.",
      location: "Hà Nội, Việt Nam",
      jobType: "Full-time",
      salaryRange: "12-20 triệu VNĐ",
      state: JobState.DRAFT,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const job5 = await prisma.jobPosting.create({
    data: {
      employerId,
      title: "Data Analyst",
      description: "Phân tích dữ liệu kinh doanh, xây dựng báo cáo và dashboard hỗ trợ ra quyết định.",
      requirements: "Thành thạo SQL, Excel, Power BI hoặc Tableau. Tư duy phân tích tốt.",
      location: "Hồ Chí Minh, Việt Nam",
      jobType: "Full-time",
      salaryRange: "12-18 triệu VNĐ",
      state: JobState.APPROVED,
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
      approvedBy: adminUser.id,
    },
  });

  const job6 = await prisma.jobPosting.create({
    data: {
      employerId,
      title: "QA Engineer (Manual & Automation)",
      description: "Kiểm thử phần mềm thủ công và tự động cho các sản phẩm web/mobile.",
      requirements: "Kinh nghiệm viết test case, Selenium/Cypress là lợi thế.",
      location: "Đà Nẵng, Việt Nam",
      jobType: "Part-time",
      salaryRange: "8-14 triệu VNĐ",
      state: JobState.CLOSED,
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      approvedBy: adminUser.id,
    },
  });

  console.log("Created 6 job postings (3 approved, 1 pending, 1 draft, 1 closed)");

  // 6. Applications
  await prisma.application.create({
    data: {
      jobId: job1.id,
      studentId: studentProfileId,
      cvId: cv1.id,
      coverLetter:
        "Tôi rất quan tâm đến vị trí thực tập sinh Backend tại công ty. Tôi có kiến thức về Node.js và mong muốn phát triển kỹ năng.",
      state: ApplicationState.UNDER_REVIEW,
    },
  });

  await prisma.application.create({
    data: {
      jobId: job2.id,
      studentId: studentProfileId,
      cvId: cv2.id,
      coverLetter: "Tôi ứng tuyển vị trí Frontend Developer. Tôi có kinh nghiệm với React và TypeScript.",
      state: ApplicationState.APPLIED,
    },
  });
  console.log("Created 2 applications");

  console.log("Seed completed successfully!");
  console.log("");
  console.log("Demo Accounts:");
  console.log("  Admin:     admin@trusthire.local / Admin@123");
  console.log("  Employer:  employer@trusthire.local / Employer@123");
  console.log("  Student:   student@trusthire.local / Student@123");

  void job3;
  void job4;
  void job5;
  void job6;
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
