import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function saveFile(base64Data: string, type: 'image' | 'video'): Promise<string> {
    // VERCEL WORKAROUND: Vercel has no writable disk. 
    // For a demo/hackathon, we store the base64 string directly in the DB.
    if (process.env.VERCEL) {
        return base64Data;
    }

    try {
        // strip potential header like "data:image/jpeg;base64,"
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            // If it's already a URL or weird, just return it
            return base64Data;
        }

        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const extension = mimeType.split('/')[1];

        const fileName = `${uuidv4()}.${extension}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        return `/uploads/${fileName}`;
    } catch (error) {
        console.error("File save error, falling back to base64:", error);
        return base64Data;
    }
}
