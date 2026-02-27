export type ProjectReportTimelineEvent = {
    date: string;
    title: string;
};

export type ProjectReportData = {
    milestoneProgress: {
        progressPercentage: number;
    };
    inspectionSummary: {
        passCount: number;
        failCount: number;
    };
    paymentSummary: {
        totalAmount: number;
        pendingAmount: number;
    };
    timeline: ProjectReportTimelineEvent[];
};
