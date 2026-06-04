import { Router } from "express";
import { requireAuth, requireCompany } from "../../middlewares/auth.middleware";
import { uploadDocumentFile } from "../../middlewares/upload.middleware";
import {
  getCategories,
  getDocument,
  getDocuments,
  getDocumentVersions,
  patchCurrentDocumentVersion,
  patchDocument,
  postCategory,
  postDocument,
  postDocumentVersion,
  postDocumentVersionUpload
} from "./documents.controller";

export const documentsRouter = Router();

documentsRouter.use(requireAuth, requireCompany);

documentsRouter.get("/categories", getCategories);
documentsRouter.post("/categories", postCategory);

documentsRouter.get("/", getDocuments);
documentsRouter.post("/", postDocument);
documentsRouter.get("/:id", getDocument);
documentsRouter.patch("/:id", patchDocument);
documentsRouter.get("/:id/versions", getDocumentVersions);
documentsRouter.post("/:id/versions", postDocumentVersion);
documentsRouter.post("/:id/versions/upload", uploadDocumentFile.single("file"), postDocumentVersionUpload);
documentsRouter.patch("/:id/versions/:versionId/current", patchCurrentDocumentVersion);
