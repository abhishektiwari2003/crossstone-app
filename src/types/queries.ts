export type QueryStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type QueryPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type QueryMedia = {
    id: string;
    fileKey: string;
};

export type QueryResponse = {
    id: string;
    queryId: string;
    authorId: string;
    message: string;
    createdAt: string;
    author: {
        id: string;
        name: string | null;
        image: string | null;
        role: string;
    };
};

export type Query = {
    id: string;
    projectId: string;
    authorId: string;
    title: string;
    description: string;
    status: QueryStatus;
    priority: QueryPriority;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string | null;
        image: string | null;
        role: string;
    };
    attachments: QueryMedia[];
    responses: QueryResponse[];
};
