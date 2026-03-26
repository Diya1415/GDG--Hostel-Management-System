import { GoogleGenerativeAI } from '@google/generative-ai';
import { COMPLAINT_CATEGORIES, PRIORITY_LEVELS } from './constants';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeComplaint(description: string, imageBase64?: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const categoriesList = COMPLAINT_CATEGORIES.map(c => c.name).join(', ');
        const subCategoriesList = COMPLAINT_CATEGORIES.map(c => `${c.name}: [${c.subCategories.join(', ')}]`).join('\n');

        let prompt = `Analyze the following hostel complaint description and optional image. 
      Strictly categorize using the provided lists.
      
      Main Categories: ${categoriesList}
      
      Sub Categories (choose strictly from here based on Main Category):
      ${subCategoriesList}

      Extract the following JSON directly (no markdown):
      {
        "category": "String (One of the Main Categories)",
        "subCategory": "String (One of the Sub Categories matching the Main Category)",
        "priority": "String (URGENT | NORMAL)",
        "summary": "String (short title)"
      }
      
      Description: ${description}`;

        let result;
        if (imageBase64) {
            const image = {
                inlineData: {
                    data: imageBase64,
                    mimeType: "image/jpeg",
                },
            };
            result = await model.generateContent([prompt, image]);
        } else {
            result = await model.generateContent(prompt);
        }

        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const json = JSON.parse(cleanedText);
            // double check validity
            const isValidCategory = COMPLAINT_CATEGORIES.some(c => c.name === json.category);
            if (!isValidCategory) json.category = "Other";
            return json;
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            return getDefaultAnalysis(description);
        }
    } catch (error) {
        console.error("Gemini AI Analysis failed:", error);
        return getDefaultAnalysis(description);
    }
}

function getDefaultAnalysis(description: string) {
    const desc = description.toLowerCase();
    let category = "Other";
    let priority = "NORMAL";

    if (desc.includes('wire') || desc.includes('light') || desc.includes('fan') || desc.includes('electr')) category = "Electrical";
    else if (desc.includes('pipe') || desc.includes('water') || desc.includes('leak') || desc.includes('tap')) category = "Plumbing";
    else if (desc.includes('internet') || desc.includes('wifi')) category = "Internet";
    else if (desc.includes('clean') || desc.includes('dirt') || desc.includes('dust')) category = "Cleanliness";

    // Try to find a subcategory match
    let subCategory = "Other";
    const catObj = COMPLAINT_CATEGORIES.find(c => c.name === category);
    if (catObj) {
        subCategory = catObj.subCategories[catObj.subCategories.length - 1]; // Default to Other/Last
    }

    if (desc.includes('urgent') || desc.includes('emergency') || desc.includes('soon') || desc.includes('help')) priority = "URGENT";

    return {
        category,
        subCategory,
        priority,
        summary: description.substring(0, 50).trim() + "..."
    };
}

export async function generateInsights(statsInput: any) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        Act as a Hostel Facility Manager Analyst. 
        Analyze the following complaint statistics and patterns:
        ${JSON.stringify(statsInput, null, 2)}

        Provide a concise, professional summary. 
        CRITICAL: Detect and highlight repeated complaints on the same floor or of the same type (systemic issues).
        
        Structure:
        1. Overview: 1-2 sentences on current state.
        2. Detected Patterns: If any, list them starting with "⚠️ **Pattern Alert:**". Mention specific floors and categories.
        3. Recommendation: Start with "**Recommendation:**" followed by 1 actionable advice.
        
        Tone: Professional, Alert, and Data-driven. Total length under 5 sentences.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("Gemini Insights generation failed:", error);
        return getDeterministicInsights(statsInput);
    }
}

function getDeterministicInsights(stats: any): string {
    const total = stats.totalComplaints || 0;
    if (total === 0) return "No complaint data available for the selected period. Everything seems to be in order.";

    // Sort categories by total to find the busiest
    const sortedCategories = [...(stats.categoryBreakdown || [])].sort((a: any, b: any) => b.total - a.total);
    const topCategory = sortedCategories[0];

    // Calculate pending ratio
    const pendingCount = stats.categoryBreakdown?.reduce((acc: number, c: any) => acc + (c.pending || 0), 0) || 0;
    const pendingRatio = (pendingCount / total) * 100;

    let summary = `Currently managing **${total} total complaints**. `;

    // Pattern Detection (Deterministic)
    const patterns = stats.detectedPatterns || [];
    const significantPatterns = patterns.filter((p: any) => p.count >= 2);

    if (significantPatterns.length > 0) {
        const patternTexts = significantPatterns.slice(0, 2).map((p: any) => `${p.category} issues on Floor ${p.floor}`);
        summary += `\n⚠️ **Pattern Alert:** Multiple ${patternTexts.join(' and ')} detected. `;
    }

    if (topCategory && topCategory.total > 0) {
        summary += `**${topCategory.category}** is the most active area with ${topCategory.total} reports. `;
    }

    if (pendingRatio > 50) {
        summary += `Caution: ${pendingRatio.toFixed(0)}% of issues are still pending. Prioritize resolving older tickets. `;
    } else if (pendingRatio > 0) {
        summary += `The team is resolving issues, with ${pendingCount} pending remaining. `;
    }

    summary += `\n\n**Recommendation:** ${significantPatterns.length > 0 ? "Investigate detected patterns for systemic failures." : `Direct attention to ${topCategory?.category || 'reported issues'} to maintain standards.`}`;

    return summary;
}
