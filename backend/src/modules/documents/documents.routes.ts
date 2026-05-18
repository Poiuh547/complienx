import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  getCategories,
  getDocument,
  getDocuments,
  getDocumentVersions,
  patchCurrentDocumentVersion,
  patchDocument,
  postCategory,
  postDocument,
  postDocumentVersion
} from "./documents.controller";

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

documentsRouter.get("/categories", getCategories);
documentsRouter.post("/categories", postCategory);

documentsRouter.get("/", getDocuments);
documentsRouter.post("/", postDocument);
documentsRouter.get("/:id", getDocument);
documentsRouter.patch("/:id", patchDocument);
documentsRouter.get("/:id/versions", getDocumentVersions);
documentsRouter.post("/:id/versions", postDocumentVersion);
documentsRouter.patch("/:id/versions/:versionId/current", patchCurrentDocumentVersion);
