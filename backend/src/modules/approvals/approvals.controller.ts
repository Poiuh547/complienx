import type { RequestHandler } from "express";
import { HttpError } from "../../utils/http-error";
import { decideApprovalSchema } from "./approvals.schemas";
import {
  approveDocumentApproval,
  listPendingApprovals,
  rejectDocumentApproval,
  submitDocumentForApproval
} from "./approvals.service";

export const getPendingApprovals: RequestHandler = async (_req, res, next) => {
  try {
    const approvals = await listPendingApprovals();
    res.json({ approvals });
  } catch (error) {
    next(error);
  }
};

export const postSubmitDocumentApproval: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const approval = await submitDocumentForApproval(req.params.documentId, req.user.id);
    res.status(201).json({ approval });
  } catch (error) {
    next(error);
  }
};

export const postApproveApproval: RequestHandler = async (req, res, next) => {
  try {
    const input = decideApprovalSchema.parse(req.body);
    const approval = await approveDocumentApproval(req.params.approvalId, input);
    res.json({ approval });
  } catch (error) {
    next(error);
  }
};

export const postRejectApproval: RequestHandler = async (req, res, next) => {
  try {
    const input = decideApprovalSchema.parse(req.body);
    const approval = await rejectDocumentApproval(req.params.approvalId, input);
    res.json({ approval });
  } catch (error) {
    next(error);
  }
};
