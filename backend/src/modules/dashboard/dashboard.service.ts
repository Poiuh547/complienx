import { prisma } from "../../config/prisma";
import { listDashboardTasks } from "../tasks/tasks.service";

const getDaysUntil = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getDashboardSummary = async () => {
  const [
    totalDocuments,
    activeDocuments,
    documentsInReview,
    approvedDocuments,
    pendingApprovals,
    openActions,
    actions,
    recentDocuments,
    recentActions,
    tasks
  ] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({ where: { status: { notIn: ["archived"] } } }),
    prisma.document.count({ where: { status: "in_review" } }),
    prisma.document.count({ where: { status: "approved" } }),
    prisma.documentApproval.count({ where: { status: "pending" } }),
    prisma.action.count({ where: { status: { in: ["open", "in_progress", "in_review"] } } }),
    prisma.action.findMany({
      where: { status: { in: ["open", "in_progress", "in_review"] } },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.document.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }),
    prisma.action.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }),
    listDashboardTasks()
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueActions = actions.filter(
    (action) => action.dueDate && getDaysUntil(action.dueDate) < 0
  ).length;

  const criticalTasks = tasks.filter((task) => task.severity === "critical").length;
  const highTasks = tasks.filter((task) => task.severity === "high").length;

  const complianceScore = totalDocuments === 0
    ? 0
    : Math.round((approvedDocuments / totalDocuments) * 100);

  const documentActivity = recentDocuments.map((document) => ({
    id: `document-${document.id.toString()}`,
    title: document.title,
    description: `Documento ${document.status}`,
    entityType: "document",
    entityId: document.id.toString(),
    href: `/documents/${document.id.toString()}`,
    occurredAt: document.updatedAt.toISOString()
  }));

  const actionActivity = recentActions.map((action) => ({
    id: `action-${action.id.toString()}`,
    title: action.title,
    description: `Acción ${action.status}`,
    entityType: "action",
    entityId: action.id.toString(),
    href: `/actions/${action.id.toString()}`,
    occurredAt: action.updatedAt.toISOString()
  }));

  const recentActivity = [...documentActivity, ...actionActivity]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 6);

  return {
    metrics: {
      totalDocuments,
      activeDocuments,
      documentsInReview,
      approvedDocuments,
      pendingApprovals,
      openActions,
      overdueActions,
      totalTasks: tasks.length,
      criticalTasks,
      highTasks,
      complianceScore
    },
    recentActivity,
    urgentTasks: tasks.slice(0, 5)
  };
};
