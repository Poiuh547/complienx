import { prisma } from "../../config/prisma";

type TaskSeverity = "low" | "medium" | "high" | "critical";

type DashboardTask = {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: TaskSeverity;
  dueDate: string | null;
  relatedEntityType: "document" | "approval" | "action";
  relatedEntityId: string;
  href: string;
};

const toDateOnly = (date: Date | null | undefined) => {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
};

const getDaysUntil = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getActionSeverity = (dueDate: Date | null, priority: string): TaskSeverity => {
  if (!dueDate) return priority === "critical" ? "critical" : "medium";

  const daysUntil = getDaysUntil(dueDate);

  if (daysUntil < 0) return "critical";
  if (daysUntil <= 3) return "high";
  if (priority === "high" || priority === "critical") return "high";
  return "medium";
};

const getDocumentSeverity = (reviewDueDate: Date | null): TaskSeverity => {
  if (!reviewDueDate) return "medium";

  const daysUntil = getDaysUntil(reviewDueDate);

  if (daysUntil < 0) return "critical";
  if (daysUntil <= 7) return "high";
  return "medium";
};

export const listDashboardTasks = async (): Promise<DashboardTask[]> => {
  const [pendingApprovals, actions, documents] = await Promise.all([
    prisma.documentApproval.findMany({
      where: { status: "pending" },
      include: {
        document: true,
        documentVersion: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.action.findMany({
      where: {
        status: {
          in: ["open", "in_progress", "in_review"]
        }
      },
      orderBy: { dueDate: "asc" }
    }),
    prisma.document.findMany({
      where: {
        reviewDueDate: {
          not: null
        },
        status: {
          notIn: ["archived"]
        }
      },
      orderBy: { reviewDueDate: "asc" }
    })
  ]);

  const approvalTasks: DashboardTask[] = pendingApprovals.map((approval) => ({
    id: `approval-${approval.id.toString()}`,
    title: `Aprobar documento: ${approval.document.title}`,
    description: `Versión ${approval.documentVersion.versionNumber} pendiente de decisión.`,
    type: "document_approval",
    severity: "high",
    dueDate: null,
    relatedEntityType: "approval",
    relatedEntityId: approval.id.toString(),
    href: "/approvals"
  }));

  const actionTasks: DashboardTask[] = actions.map((action) => {
    const daysUntil = action.dueDate ? getDaysUntil(action.dueDate) : null;
    const isOverdue = daysUntil !== null && daysUntil < 0;

    return {
      id: `action-${action.id.toString()}`,
      title: isOverdue ? `Acción vencida: ${action.title}` : `Atender acción: ${action.title}`,
      description: `Prioridad ${action.priority}. Estado ${action.status}.`,
      type: isOverdue ? "overdue_action" : "open_action",
      severity: getActionSeverity(action.dueDate, action.priority),
      dueDate: toDateOnly(action.dueDate),
      relatedEntityType: "action",
      relatedEntityId: action.id.toString(),
      href: `/actions/${action.id.toString()}`
    };
  });

  const documentTasks: DashboardTask[] = documents
    .filter((document) => {
      if (!document.reviewDueDate) return false;
      return getDaysUntil(document.reviewDueDate) <= 15;
    })
    .map((document) => {
      const daysUntil = document.reviewDueDate ? getDaysUntil(document.reviewDueDate) : null;
      const isOverdue = daysUntil !== null && daysUntil < 0;

      return {
        id: `document-review-${document.id.toString()}`,
        title: isOverdue ? `Documento vencido: ${document.title}` : `Documento próximo a revisión: ${document.title}`,
        description: isOverdue ? "La fecha de revisión ya venció." : "La fecha de revisión está próxima.",
        type: isOverdue ? "overdue_document_review" : "upcoming_document_review",
        severity: getDocumentSeverity(document.reviewDueDate),
        dueDate: toDateOnly(document.reviewDueDate),
        relatedEntityType: "document",
        relatedEntityId: document.id.toString(),
        href: `/documents/${document.id.toString()}`
      };
    });

  return [...approvalTasks, ...actionTasks, ...documentTasks].sort((a, b) => {
    const severityOrder: Record<TaskSeverity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3
    };

    const severityDifference = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDifference !== 0) return severityDifference;

    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;

    return a.dueDate.localeCompare(b.dueDate);
  });
};
