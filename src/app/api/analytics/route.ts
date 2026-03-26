import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateInsights } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALL_CATEGORIES = [
    'Plumbing',
    'Electrical',
    'Infrastructure',
    'Cleanliness',
    'Security',
    'Internet',
    'Other'
];

export async function GET(req: Request) {
    const session = await getSession();
    if (!session || session.role !== 'warden') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate'); // ISO
        const endDate = searchParams.get('endDate');   // ISO

        let dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            };
        }

        const whereClause = {
            hostelName: session.hostelName as string,
            ...dateFilter
        };

        // 1. Group by Category AND Status for Stacked Charts
        const rawStats = await prisma.complaint.groupBy({
            by: ['category', 'status'],
            where: whereClause,
            _count: { id: true },
        });

        // Transform to: [{ category: 'Plumbing', PENDING: 2, IN_PROGRESS: 1, RESOLVED: 5 }, ...]
        const categoryDataMap = new Map();

        // Initialize with 0s for all categories
        ALL_CATEGORIES.forEach(cat => {
            categoryDataMap.set(cat, { category: cat, PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 });
        });

        // Add 'Other' category by default just in case
        categoryDataMap.set('Other', { category: 'Other', PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 });

        // Fill with actual data
        rawStats.forEach((item: any) => {
            const cat = item.category || 'Other';
            if (!categoryDataMap.has(cat)) {
                categoryDataMap.set(cat, { category: cat, PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 });
            }
            const current = categoryDataMap.get(cat);
            current[item.status] = item._count.id;
        });

        const categoryData = ALL_CATEGORIES.map(cat => categoryDataMap.get(cat));

        // 2. Status Groups for Pie Chart (Aggregation of the above)
        const statusGroups = await prisma.complaint.groupBy({
            by: ['status'],
            where: whereClause,
            _count: { id: true },
        });

        // 3. Recent Complaints for Context
        const recentComplaints = await prisma.complaint.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { title: true, description: true, category: true, subCategory: true, status: true, floor: true }
        });

        // 3.1 Group by Floor and Category for Pattern Detection (Systemic Issues)
        const patternStats = await prisma.complaint.groupBy({
            by: ['floor', 'category', 'status'],
            where: whereClause,
            _count: { id: true }
        });

        // Group the results by floor-category
        const patternsMap = new Map();
        patternStats.forEach((p: any) => {
            const key = `${p.floor}-${p.category}`;
            if (!patternsMap.has(key)) {
                patternsMap.set(key, { floor: p.floor, category: p.category, total: 0, open: 0 });
            }
            const current = patternsMap.get(key);
            current.total += p._count.id;
            if (p.status !== 'RESOLVED') {
                current.open += p._count.id;
            }
        });

        const significantPatterns = Array.from(patternsMap.values())
            .filter((p: any) => p.total >= 2)
            .sort((a, b) => b.total - a.total);

        // 4. Generate AI Insights
        const totalComplaints = statusGroups.reduce((acc: number, curr: any) => acc + curr._count.id, 0);

        const statsForAI = {
            timeframe: startDate && endDate ? `${startDate} to ${endDate}` : "Recent/All Time",
            totalComplaints,
            statusBreakdown: statusGroups,
            categoryBreakdown: categoryData.map(c => ({
                category: c.category,
                total: c.PENDING + c.IN_PROGRESS + c.RESOLVED,
                pending: c.PENDING
            })), // Simplified for AI to reduce token usage
            detectedPatterns: significantPatterns,
            recentIssuesSamples: recentComplaints.map((c: any) => `[Floor ${c.floor}] ${c.title} (${c.category} - ${c.status})`)
        };

        let aiResponse = "AI Insights unavailable.";
        try {
            aiResponse = await generateInsights(statsForAI);
        } catch (aiError) {
            console.error("AI Generation Error:", aiError);
            aiResponse = "Unable to generate insights at this moment. Please ensure the AI service is active.";
        }

        // 5. Feedback Averages per Category
        const feedbackByCategory = await (prisma as any).feedback.findMany({
            where: {
                complaint: {
                    hostelName: session.hostelName as string,
                    ...dateFilter
                }
            },
            include: {
                complaint: {
                    select: { category: true }
                }
            }
        });

        const categoryFeedbackMap: any = {};
        feedbackByCategory.forEach((f: any) => {
            const cat = f.complaint.category;
            if (!categoryFeedbackMap[cat]) categoryFeedbackMap[cat] = { total: 0, count: 0 };
            categoryFeedbackMap[cat].total += f.rating;
            categoryFeedbackMap[cat].count += 1;
        });

        const feedbackAnalyticsByCategory = Object.keys(categoryFeedbackMap).map(cat => ({
            category: cat,
            averageRating: categoryFeedbackMap[cat].total / categoryFeedbackMap[cat].count,
            count: categoryFeedbackMap[cat].count
        }));

        // 6. Feedback Averages per Floor
        const feedbackByFloor = await (prisma as any).feedback.findMany({
            where: {
                complaint: {
                    hostelName: session.hostelName as string,
                    ...dateFilter
                }
            },
            include: {
                complaint: {
                    select: { floor: true }
                }
            }
        });

        const floorFeedbackMap: any = {};
        feedbackByFloor.forEach((f: any) => {
            const floor = f.complaint.floor;
            if (!floorFeedbackMap[floor]) floorFeedbackMap[floor] = { total: 0, count: 0 };
            floorFeedbackMap[floor].total += f.rating;
            floorFeedbackMap[floor].count += 1;
        });

        const feedbackAnalyticsByFloor = Object.keys(floorFeedbackMap).map(floor => ({
            floor,
            averageRating: floorFeedbackMap[floor].total / floorFeedbackMap[floor].count,
            count: floorFeedbackMap[floor].count
        }));

        return NextResponse.json({
            statusData: statusGroups,
            categoryData,
            recentComplaints,
            insights: aiResponse,
            detectedPatterns: significantPatterns,
            feedbackStats: {
                byCategory: feedbackAnalyticsByCategory,
                byFloor: feedbackAnalyticsByFloor
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
