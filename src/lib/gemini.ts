import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export type EventData = {
  title: string;
  startDate: string;
  startTime: string;
  allDay: boolean;
};

export type MemoData = {
  content: string;
};

export async function generateActionSuggestions(
  events: EventData[],
  memos: MemoData[]
): Promise<string[]> {
  if (!genAI) {

    return ["APIキーが設定されていないため、AI提案を表示できません。"];
  }

  try {

    const model = genAI.getGenerativeModel({
    model: "gemini-3.8-flash",
    });
        
    const prompt = `
あなたはユーザーのタスク・スケジュール管理をサポートする親切なAIアシスタントです。
以下の「今日の予定」と「記録されたメモ」の内容を参照し、ユーザーが今日効率的かつ快適に過ごすための具体的な「行動提案」を2〜3つ作成してください。

【今日の予定】
${events.length === 0 ? "なし" : events.map((e) => `- ${e.title} (${e.allDay ? "終日" : e.startTime})`).join("\n")}

【最新のメモ】
${memos.length === 0 ? "なし" : memos.map((m) => `- ${m.content}`).join("\n")}

【制約事項】
・箇条書き（「・」始まり）で2〜3個提案してください。
・時刻を入れる場合は「14:30」のように省略せず数字から書いてください。
・1文は短く、分かりやすい日本語で書いてください。
・前置きや挨拶は不要です。提案内容のみを出力してください。
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 箇条書きを行ごとに分割して配列化
    const suggestions = text
        .split("\n")
        .map((line) => line.replace(/^[・*-\s]+|^\d+\.\s*/, "").trim())
        .filter((line) => line.length > 0);

    return suggestions.length > 0
      ? suggestions
      : ["今日の予定やメモを確認して、無理のない計画を立てましょう！"];
  } catch (error) {
    console.error("Gemini API Error:", error);
    // フォールバック: AIエラー時もアプリが止まらないようにする
    return ["AI提案の取得中にエラーが発生しました。時間を置いてお試しください。"];
  }
}