import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  getPendingApprovals,
  postApproveApproval,
  postRejectApproval,
  postSubmitDocumentApproval
} from "./approvals.controller";

export const approvalsRouter = Router();

approvalsRouter.use(requireAuth);

approvalsRouter.get("/pending", getPendingApprovals);
approvalsRouter.post("/documents/:documentId/submit", postSubmitDocumentApproval);
approvalsRouter.post("/:approvalId/approve", postApproveApproval);
approvalsRouter.post("/:approvalId/reject", postRejectApproval);
