import type { Request, RequestHandler } from "express";
import { HttpError } from "../../utils/http-error";
import { decideApprovalSchema } from "./approvals.schemas";
import {
  approveDocumentApproval,
  listApprovalHistory,
  listPendingApprovals,
  rejectDocumentApproval,
  submitDocumentForApproval
} from "./approvals.service";

const getCompanyId = (req: Request) => {
  if (!req.user?.companyId) {
    throw new HttpError(403, "Company context is required");
  }

  return req.user.companyId;
};

export const getPendingApprovals: RequestHandler = async (req, res, next) => {
  try {
    const approvals = await listPendingApprovals(getCompanyId(req));
    res.json({ approvals });
  } catch (error) {
    next(error);
  }
};

export const getApprovalHistory: RequestHandler = async (req, res, next) => {
  try {
    const approvals = await listApprovalHistory(getCompanyId(req));
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

    const approval = await submitDocumentForApproval(req.params.documentId, req.user.id, getCompanyId(req));
    res.status(201).json({ approval });
  } catch (error) {
    next(error);
  }
};

export const postApproveApproval: RequestHandler = async (req, res, next) => {
  try {
    const input = decideApprovalSchema.parse(req.body);
    const approval = await approveDocumentApproval(req.params.approvalId, getCompanyId(req), input);
    res.json({ approval });
  } catch (error) {
    next(error);
  }
};

export const postRejectApproval: RequestHandler = async (req, res, next) => {
  try {
    const input = decideApprovalSchema.parse(req.body);
    const approval = await rejectDocumentApproval(req.params.approvalId, getCompanyId(req), input);
    res.json({ approval });
  } catch (error) {
    next(error);
  }
};
