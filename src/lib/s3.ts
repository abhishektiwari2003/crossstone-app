import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function createS3Client() {
    const endpoint = process.env.S3_ENDPOINT;
    return new S3Client({
        region: process.env.S3_REGION || "auto",
        endpoint,
        forcePathStyle: !!endpoint && !endpoint.includes("amazonaws.com"),
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
    });
}

export async function presignPutObject(params: {
    key: string;
    contentType: string;
    contentLength: number;
}) {
    const client = createS3Client();
    const bucket = process.env.S3_BUCKET!;
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        ContentType: params.contentType,
        ContentLength: params.contentLength,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 60 });
    return { url, bucket };
}
