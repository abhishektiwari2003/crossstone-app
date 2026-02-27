export interface AnalyticsKPIs {
    totalProjects: number;
    activeProjects: number;
    totalInspections: number;
    totalRevenue: number;
}

export interface ProjectStatusDistribution {
    status: string;
    count: number;
}

export interface MonthlyInspectionCount {
    month: string;
    count: number;
}

export interface PaymentSummaryMonthly {
    month: string;
    paid: number;
    pending: number;
}

export interface EngineerPerformanceMetric {
    engineerId: string;
    name: string;
    inspectionCount: number;
    avgPassRate: number;
}

export interface AnalyticsData {
    kpis: AnalyticsKPIs;
    projectStatusDistribution: ProjectStatusDistribution[];
    monthlyInspections: MonthlyInspectionCount[];
    paymentTrends: PaymentSummaryMonthly[];
    engineerPerformance: EngineerPerformanceMetric[];
}

export interface AnalyticsFilters {
    from?: string;
    to?: string;
}
