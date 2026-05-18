import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import type { DecideApprovalInput } from "./approvals.schemas";

const toPublicApproval = (approval: any) => ({
  ...approval,
  id: approval.id.toString(),
  documentId: approval.documentId.toString(),
  documentVersionId: approval.documentVersionId.toString(),
  approverId: approval.approverId.toString(),
  document: approval.document
    ? {
        ...approval.document,
        id: approval.document.id.toString(),
        categoryId: approval.document.categoryId?.toString() ?? null,
        ownerId: approval.document.ownerId?.toString() ?? null,
        currentVersionId: approval.document.currentVersionId?.toString() ?? null,
        category: approval.document.category
          ? {
              ...approval.document.category,
              id: approval.document.category.id.toString()
            }
          : null,
        owner: approval.document.owner
          ? {
              id: approval.document.owner.id.toString(),
              name: approval.document.owner.name,
              email: approval.document.owner.email
            }
          : null
      }
    : null,
  documentVersion: approval.documentVersion
    ? {
        ...approval.documentVersion,
        id: approval.documentVersion.id.toString(),
        documentId: approval.documentVersion.documentId.toString(),
        uploadedBy: approval.documentVersion.uploadedBy?.toString() ?? null
      }
    : null,
  approver: approval.approver
    ? {
        id: approval.approver.id.toString(),
        name: approval.approver.name,
        email: approval.approver.email
      }
    : null
});

export const listPendingApprovals = async () => {
  const approvals = await prisma.documentApproval.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    include: {
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
    }
  });

  return approvals.map(toPublicApproval);
};

export const submitDocumentForApproval = async (documentId: string, approverId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: BigInt(documentId) }
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
      include: {
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
      }
    });

    await tx.document.update({
      where: { id: BigInt(documentId) },
      data: { status: "in_review" }
    });

    return createdApproval;
  });

  return toPublicApproval(approval);
};

export const approveDocumentApproval = async (approvalId: string, input: DecideApprovalInput) => {
  return decideApproval(approvalId, "approved", input);
};

export const rejectDocumentApproval = async (approvalId: string, input: DecideApprovalInput) => {
  return decideApproval(approvalId, "rejected", input);
};

const decideApproval = async (
  approvalId: string,
  status: "approved" | "rejected",
  input: DecideApprovalInput
) => {
  const approval = await prisma.documentApproval.findUnique({
    where: { id: BigInt(approvalId) }
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
      include: {
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
      }
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
