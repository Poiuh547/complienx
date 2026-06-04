import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import type { DecideApprovalInput } from "./approvals.schemas";

const toPublicDocument = (document: any) => ({
  ...document,
  id: document.id.toString(),
  companyId: document.companyId?.toString(),
  categoryId: document.categoryId?.toString() ?? null,
  ownerId: document.ownerId?.toString() ?? null,
  currentVersionId: document.currentVersionId?.toString() ?? null,
  category: document.category
    ? {
        ...document.category,
        id: document.category.id.toString(),
        companyId: document.category.companyId?.toString()
      }
    : null,
  owner: document.owner
    ? {
        id: document.owner.id.toString(),
        name: document.owner.name,
        email: document.owner.email
      }
    : null
});

const toPublicVersion = (version: any) => ({
  ...version,
  id: version.id.toString(),
  documentId: version.documentId.toString(),
  uploadedBy: version.uploadedBy?.toString() ?? null
});

const toPublicApproval = (approval: any) => ({
  ...approval,
  id: approval.id.toString(),
  documentId: approval.documentId.toString(),
  documentVersionId: approval.documentVersionId.toString(),
  approverId: approval.approverId.toString(),
  document: approval.document ? toPublicDocument(approval.document) : null,
  documentVersion: approval.documentVersion ? toPublicVersion(approval.documentVersion) : null,
  approver: approval.approver
    ? {
        id: approval.approver.id.toString(),
        name: approval.approver.name,
        email: approval.approver.email
      }
    : null
});

const approvalInclude = {
  document: {
    include: {
      category: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  },
  documentVersion: true,
  approver: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
};

export const listPendingApprovals = async (companyId: string) => {
  const approvals = await prisma.documentApproval.findMany({
    where: {
      status: "pending",
      document: {
        companyId: BigInt(companyId)
      }
    },
    orderBy: { createdAt: "desc" },
    include: approvalInclude
  });

  return approvals.map(toPublicApproval);
};

export const submitDocumentForApproval = async (documentId: string, approverId: string, companyId: string) => {
  const document = await prisma.document.findFirst({
    where: {
      id: BigInt(documentId),
      companyId: BigInt(companyId)
    }
  });

  if (!document) {
    throw new HttpError(404, "Document not found");
  }

  if (!document.currentVersionId) {
    throw new HttpError(400, "Document must have a current version before approval");
  }

  const existingPendingApproval = await prisma.documentApproval.findFirst({
    where: {
      documentId: BigInt(documentId),
      documentVersionId: document.currentVersionId,
      status: "pending"
    }
  });

  if (existingPendingApproval) {
    throw new HttpError(409, "Document already has a pending approval");
  }

  const approval = await prisma.$transaction(async (tx) => {
    const createdApproval = await tx.documentApproval.create({
      data: {
        documentId: BigInt(documentId),
        documentVersionId: document.currentVersionId as bigint,
        approverId: BigInt(approverId),
        status: "pending"
      },
      include: approvalInclude
    });

    await tx.document.update({
      where: { id: BigInt(documentId) },
      data: { status: "in_review" }
    });

    return createdApproval;
  });

  return toPublicApproval(approval);
};

export const approveDocumentApproval = async (approvalId: string, companyId: string, input: DecideApprovalInput) => {
  return decideApproval(approvalId, companyId, "approved", input);
};

export const rejectDocumentApproval = async (approvalId: string, companyId: string, input: DecideApprovalInput) => {
  return decideApproval(approvalId, companyId, "rejected", input);
};

const decideApproval = async (
  approvalId: string,
  companyId: string,
  status: "approved" | "rejected",
  input: DecideApprovalInput
) => {
  const approval = await prisma.documentApproval.findFirst({
    where: {
      id: BigInt(approvalId),
      document: {
        companyId: BigInt(companyId)
      }
    }
  });

  if (!approval) {
    throw new HttpError(404, "Approval not found");
  }

  if (approval.status !== "pending") {
    throw new HttpError(400, "Approval has already been decided");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedApproval = await tx.documentApproval.update({
      where: { id: BigInt(approvalId) },
      data: {
        status,
        comment: input.comment,
        decidedAt: new Date()
      },
      include: approvalInclude
    });

    await tx.document.update({
      where: { id: approval.documentId },
      data: {
        status: status === "approved" ? "approved" : "rejected"
      }
    });

    return updatedApproval;
  });

  return toPublicApproval(result);
};
