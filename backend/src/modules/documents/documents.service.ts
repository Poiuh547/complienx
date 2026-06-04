import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import type {
  CreateCategoryInput,
  CreateDocumentInput,
  CreateDocumentVersionInput,
  UpdateDocumentInput
} from "./documents.schemas";

const toPublicVersion = (version: any) => ({
  ...version,
  id: version.id.toString(),
  documentId: version.documentId.toString(),
  uploadedBy: version.uploadedBy?.toString() ?? null
});

const toPublicCategory = (category: any) => ({
  ...category,
  id: category.id.toString(),
  companyId: category.companyId?.toString()
});

const toPublicDocument = (document: any) => ({
  ...document,
  id: document.id.toString(),
  companyId: document.companyId?.toString(),
  categoryId: document.categoryId?.toString() ?? null,
  ownerId: document.ownerId?.toString() ?? null,
  currentVersionId: document.currentVersionId?.toString() ?? null,
  category: document.category ? toPublicCategory(document.category) : null,
  owner: document.owner
    ? {
        id: document.owner.id.toString(),
        name: document.owner.name,
        email: document.owner.email
      }
    : null,
  currentVersion: document.currentVersion ? toPublicVersion(document.currentVersion) : null
});

const parseOptionalBigInt = (value?: string | null) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return BigInt(value);
};

const documentInclude = {
  category: true,
  currentVersion: true,
  owner: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
};

export const listDocuments = async (companyId: string) => {
  const documents = await prisma.document.findMany({
    where: { companyId: BigInt(companyId) },
    orderBy: { createdAt: "desc" },
    include: documentInclude
  });

  return documents.map(toPublicDocument);
};

export const getDocumentById = async (id: string, companyId: string) => {
  const document = await prisma.document.findFirst({
    where: {
      id: BigInt(id),
      companyId: BigInt(companyId)
    },
    include: {
      ...documentInclude,
      versions: {
        orderBy: { createdAt: "desc" }
      },
      approvals: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!document) {
    throw new HttpError(404, "Document not found");
  }

  return {
    ...toPublicDocument(document),
    versions: document.versions.map(toPublicVersion),
    approvals: document.approvals.map((approval) => ({
      ...approval,
      id: approval.id.toString(),
      documentId: approval.documentId.toString(),
      documentVersionId: approval.documentVersionId.toString(),
      approverId: approval.approverId.toString()
    }))
  };
};

export const createDocument = async (input: CreateDocumentInput, ownerId: string, companyId: string) => {
  const document = await prisma.document.create({
    data: {
      companyId: BigInt(companyId),
      title: input.title,
      description: input.description,
      categoryId: parseOptionalBigInt(input.categoryId),
      ownerId: BigInt(ownerId),
      reviewDueDate: input.reviewDueDate ? new Date(input.reviewDueDate) : null
    },
    include: documentInclude
  });

  return toPublicDocument(document);
};

export const updateDocument = async (id: string, companyId: string, input: UpdateDocumentInput) => {
  await getDocumentById(id, companyId);

  const document = await prisma.document.update({
    where: { id: BigInt(id) },
    data: {
      title: input.title,
      description: input.description,
      categoryId: input.categoryId === undefined ? undefined : parseOptionalBigInt(input.categoryId),
      status: input.status,
      reviewDueDate:
        input.reviewDueDate === undefined
          ? undefined
          : input.reviewDueDate
            ? new Date(input.reviewDueDate)
            : null
    },
    include: documentInclude
  });

  return toPublicDocument(document);
};

export const createDocumentVersion = async (
  documentId: string,
  companyId: string,
  input: CreateDocumentVersionInput,
  uploadedBy: string
) => {
  await getDocumentById(documentId, companyId);

  const result = await prisma.$transaction(async (tx) => {
    const version = await tx.documentVersion.create({
      data: {
        documentId: BigInt(documentId),
        versionNumber: input.versionNumber,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        fileType: input.fileType,
        uploadedBy: BigInt(uploadedBy),
        changeNotes: input.changeNotes
      }
    });

    if (input.setAsCurrent) {
      await tx.document.update({
        where: { id: BigInt(documentId) },
        data: {
          currentVersionId: version.id,
          status: "draft"
        }
      });
    }

    return version;
  });

  return toPublicVersion(result);
};

export const listDocumentVersions = async (documentId: string, companyId: string) => {
  await getDocumentById(documentId, companyId);

  const versions = await prisma.documentVersion.findMany({
    where: { documentId: BigInt(documentId) },
    orderBy: { createdAt: "desc" }
  });

  return versions.map(toPublicVersion);
};

export const setCurrentDocumentVersion = async (documentId: string, companyId: string, versionId: string) => {
  await getDocumentById(documentId, companyId);

  const version = await prisma.documentVersion.findFirst({
    where: {
      id: BigInt(versionId),
      documentId: BigInt(documentId)
    }
  });

  if (!version) {
    throw new HttpError(404, "Document version not found");
  }

  const document = await prisma.document.update({
    where: { id: BigInt(documentId) },
    data: { currentVersionId: BigInt(versionId) },
    include: documentInclude
  });

  return toPublicDocument(document);
};

export const createCategory = async (input: CreateCategoryInput, companyId: string) => {
  const category = await prisma.documentCategory.create({
    data: {
      companyId: BigInt(companyId),
      name: input.name,
      description: input.description
    }
  });

  return toPublicCategory(category);
};

export const listCategories = async (companyId: string) => {
  const categories = await prisma.documentCategory.findMany({
    where: { companyId: BigInt(companyId) },
    orderBy: { name: "asc" }
  });

  return categories.map(toPublicCategory);
};
