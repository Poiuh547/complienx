import { Activity, AlertTriangle, CheckCircle2, Clock3, FileCheck2, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const summaryCards = [
  {
    title: "Cumplimiento documental",
    value: "86%",
    helper: "+4% contra el mes anterior",
    icon: FileCheck2,
    tone: "blue"
  },
  {
    title: "Acciones abiertas",
    value: "24",
    helper: "8 con prioridad alta",
    icon: Activity,
    tone: "amber