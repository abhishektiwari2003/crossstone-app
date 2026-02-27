import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles for the PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#ffffff",
        padding: 40,
        fontFamily: "Helvetica",
    },
    header: {
        marginBottom: 30,
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        color: "#64748b",
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 12,
        borderBottom: "1px solid #f1f5f9",
        paddingBottom: 4,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    card: {
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 12,
        borderRadius: 4,
        marginRight: 10,
    },
    cardLast: {
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 12,
        borderRadius: 4,
    },
    cardLabel: {
        fontSize: 10,
        color: "#64748b",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    cardValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0f172a",
    },
    cardValuePrimary: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2563eb",
    },
    cardValueSuccess: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#16a34a",
    },
    box: {
        backgroundColor: "#f8fafc",
        padding: 15,
        borderRadius: 6,
    },
    timelineItem: {
        marginBottom: 10,
        paddingLeft: 10,
        borderLeft: "2px solid #cbd5e1",
    },
    timelineTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#334155",
    },
    timelineDate: {
        fontSize: 10,
        color: "#94a3b8",
        marginTop: 2,
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: "center",
        color: "#94a3b8",
        fontSize: 10,
        borderTop: "1px solid #e2e8f0",
        paddingTop: 10,
    },
});

type ProjectReportData = {
    project: {
        name: string;
        status: string;
        startDate: string;
    };
    inspectionSummary: {
        totalInspections: number;
        passCount: number;
        failCount: number;
        naCount: number;
        passRate: number;
    };
    paymentSummary: {
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
        paymentProgress: number;
    };
    milestoneProgress: {
        totalMilestones: number;
        completedMilestones: number;
        progressPercentage: number;
    };
    timeline: {
        type: string;
        title: string;
        date: string;
    }[];
};

export const ProjectReportPDF = ({ data }: { data: ProjectReportData }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return `INR ${amount.toLocaleString("en-IN")}`;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{data.project.name} - Status Report</Text>
                    <Text style={styles.subtitle}>
                        Project Status: {data.project.status.replace("_", " ")} | Start Date:{" "}
                        {formatDate(data.project.startDate)}
                    </Text>
                </View>

                {/* Milestone Progress */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Milestone Progress</Text>
                    <View style={styles.row}>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>TOTAL MILESTONES</Text>
                            <Text style={styles.cardValue}>{data.milestoneProgress.totalMilestones}</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>COMPLETED</Text>
                            <Text style={styles.cardValue}>{data.milestoneProgress.completedMilestones}</Text>
                        </View>
                        <View style={styles.cardLast}>
                            <Text style={styles.cardLabel}>OVERALL PROGRESS</Text>
                            <Text style={styles.cardValuePrimary}>{data.milestoneProgress.progressPercentage}%</Text>
                        </View>
                    </View>
                </View>

                {/* Inspections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quality Inspections</Text>
                    <View style={styles.row}>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>INSPECTIONS</Text>
                            <Text style={styles.cardValue}>{data.inspectionSummary.totalInspections}</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>PASS ITEMS</Text>
                            <Text style={styles.cardValueSuccess}>{data.inspectionSummary.passCount}</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>FAIL ITEMS</Text>
                            <Text style={[styles.cardValue, { color: "#ef4444" }]}>
                                {data.inspectionSummary.failCount}
                            </Text>
                        </View>
                        <View style={styles.cardLast}>
                            <Text style={styles.cardLabel}>PASS RATE</Text>
                            <Text style={styles.cardValue}>{data.inspectionSummary.passRate}%</Text>
                        </View>
                    </View>
                </View>

                {/* Finances */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Financial Summary</Text>
                    <View style={styles.row}>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>TOTAL BUDGET</Text>
                            <Text style={styles.cardValue}>{formatCurrency(data.paymentSummary.totalAmount)}</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>AMOUNT PAID</Text>
                            <Text style={styles.cardValueSuccess}>{formatCurrency(data.paymentSummary.paidAmount)}</Text>
                        </View>
                        <View style={styles.cardLast}>
                            <Text style={styles.cardLabel}>PENDING</Text>
                            <Text style={styles.cardValue}>{formatCurrency(data.paymentSummary.pendingAmount)}</Text>
                        </View>
                    </View>
                </View>

                {/* Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity Timeline</Text>
                    <View style={styles.box}>
                        {data.timeline.length > 0 ? (
                            data.timeline.map((item, i) => (
                                <View key={i} style={styles.timelineItem}>
                                    <Text style={styles.timelineTitle}>{item.title}</Text>
                                    <Text style={styles.timelineDate}>{formatDate(item.date)}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.subtitle}>No recent activity found.</Text>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Generated on {new Date().toLocaleDateString("en-IN")} automatically by CrossStone System.
                </Text>
            </Page>
        </Document>
    );
};
