import type { RequestHandler } from "express";
import { HttpError } from "../../utils/http-error";
import {
  createCategorySchema,
  createDocumentSchema,
  updateDocumentSchema
} from "./documents.schemas";
import {
  createCategory,
  createDocument,
  getDocumentById,
  listCategories,
  listDocuments,
  updateDocument
} from "./documents.service";

export const getDocuments: RequestHandler = async (_req, res, next) => {
  try {
    const documents = await listDocuments();
    res.json({ documents });
  } catch (error) {
    next(error);
  }
};

export const getDocument: RequestHandler = async (req, res, next) => {
  try {
    const document = await getDocumentById(req.params.id);
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
    const document = await createDocument(input, req.user.id);

    res.status(201).json({ document });
  } catch (error) {
    next(error);
  }
};

export const patchDocument: RequestHandler = async (req, res, next) => {
  try {
    const input = updateDocumentSchema.parse(req.body);
    const document = await updateDocument(req.params.id, input);

    res.json({ document });
  } catch (error) {
    next(error);
  }
};

export const getCategories: RequestHandler = async (_req, res, next) => {
  try {
    const categories = await listCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export const postCategory: RequestHandler = async (req, res, next) => {
  try {
    const input = createCategorySchema.parse(req.body);
    const category = await createCategory(input);

    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};
