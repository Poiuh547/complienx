import type { RequestHandler } from "express";
import { HttpError } from "../../utils/http-error";
import {
  createCategorySchema,
  createDocumentSchema,
  createDocumentVersionSchema,
  updateDocumentSchema
} from "./documents.schemas";
import {
  createCategory,
  createDocument,
  createDocumentVersion,
  getDocumentById,
  listCategories,
  listDocuments,
  listDocumentVersions,
  setCurrentDocumentVersion,
  updateDocument
} from "./documents.service";

const getCompanyId = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user?.companyId) {
    throw new HttpError(403, "Company context is required");
  }

  return req.user.companyId;
};

export const getDocuments: RequestHandler = async (req, res, next) => {
  try {
    const documents = await listDocuments(getCompanyId(req));
    res.json({ documents });
  } catch (error) {
    next(error);
  }
};

export const getDocument: RequestHandler = async (req, res, next) => {
  try {
    const document = await getDocumentById(req.params.id, getCompanyId(req));
    res.json({ document });
  } catch (error) {
    next(error);
  }
};

export const postDocument: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const input = createDocumentSchema.parse(req.body);
    const document = await createDocument(input, req.user.id, getCompanyId(req));

    res.status(201).json({ document });
  } catch (error) {
    next(error);
  }
};

export const patchDocument: RequestHandler = async (req, res, next) => {
  try {
    const input = updateDocumentSchema.parse(req.body);
    const document = await updateDocument(req.params.id, getCompanyId(req), input);

    res.json({ document });
  } catch (error) {
    next(error);
  }
};

export const getDocumentVersions: RequestHandler = async (req, res, next) => {
  try {
    const versions = await listDocumentVersions(req.params.id, getCompanyId(req));
    res.json({ versions });
  } catch (error) {
    next(error);
  }
};

export const postDocumentVersion: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const input = createDocumentVersionSchema.parse(req.body);
    const version = await createDocumentVersion(req.params.id, getCompanyId(req), input, req.user.id);

    res.status(201).json({ version });
  } catch (error) {
    next(error);
  }
};

export const postDocumentVersionUpload: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    if (!req.file) {
      throw new HttpError(400, "File is required");
    }

    const versionNumber = typeof req.body.versionNumber === "string" ? req.body.versionNumber : "";

    if (!versionNumber.trim()) {
      throw new HttpError(400, "Version number is required");
    }

    const input = createDocumentVersionSchema.parse({
      versionNumber,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      changeNotes: typeof req.body.changeNotes === "string" ? req.body.changeNotes : undefined,
      setAsCurrent: req.body.setAsCurrent === undefined ? true : req.body.setAsCurrent === "true"
    });

    const version = await createDocumentVersion(req.params.id, getCompanyId(req), input, req.user.id);

    res.status(201).json({ version });
  } catch (error) {
    next(error);
  }
};

export const patchCurrentDocumentVersion: RequestHandler = async (req, res, next) => {
  try {
    const document = await setCurrentDocumentVersion(req.params.id, getCompanyId(req), req.params.versionId);
    res.json({ document });
  } catch (error) {
    next(error);
  }
};

export const getCategories: RequestHandler = async (req, res, next) => {
  try {
    const categories = await listCategories(getCompanyId(req));
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export const postCategory: RequestHandler = async (req, res, next) => {
  try {
    const input = createCategorySchema.parse(req.body);
    const category = await createCategory(input, getCompanyId(req));

    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};
