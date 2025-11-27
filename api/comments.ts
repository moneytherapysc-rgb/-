// 1. Edge 런타임 명시 (Vercel에게 Edge에서 실행하도록 지시)
export const config = {
  runtime: 'edge', 
};

// 2. 환경 변수 로드 (Vercel Secrets에서 로드됨)
// 주의: process.env 사용은 Node.js 방식이나, Vercel Edge 환경에서 지원됨
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // DB 접근용
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

// ======================================================================
// 3. PRO 회원 체크 (Supabase Client 대신, 순수 fetch 요청 사용)
// ======================================================================
async function isProUser(uid: string) {
  // Supabase REST API를 직접 호출하여 DB 접근 모듈 충돌을 회피합니다.
  const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=is_pro,pro_expire_at`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'single' // 단일 결과만 요청
    },
  });

  if (!res.ok) {
    console.error(`Supabase fetch failed: ${res.statusText}`);
    return false; // 통신 오류 시 비인증 처리
  }
  
  const data = await res.json();
  
  if (!data || data.length === 0) return false;

  const { is_pro, pro_expire_at } = data;

  const expireDate = pro_expire_at ? new Date(pro_expire_at) : null;
  const active =
    is_pro === true &&
    (!expireDate || expireDate > new Date()); // 만료일 체크

  return active;
}

// ======================================================================
// 4. YouTube 댓글 가져오기 및 Gemini 분석 (기존 로직 유지)
// ======================================================================
async function fetchComments(videoId: string) {
  const url =
    `https://www.googleapis.com/youtube/v3/commentThreads?key=${YOUTUBE_API_KEY}&videoId=${videoId}&part=snippet&maxResults=50`;

  const res = await fetch(url);
  const data = await res.json();
  return data.items?.map((i: any) => i.snippet.topLevelComment.snippet.textDisplay) ?? [];
}

async function analyzeSentiment(comments: string[]) {
  const payload = {
    contents: [{ parts: [{ text: `다음 댓글들의 여론을 분석해줘.\n\n${comments.join("\n")}` }] }],
    // Gemini API의 안정성을 위해 모델명을 명시합니다.
    model: "gemini-2.5-flash", 
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${payload.model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || "분석 실패";
}

// ======================================================================
// 5. 메인 핸들러
// ======================================================================
export default async function (req: Request) {
  // Edge Function에서는 일반적으로 POST 요청만 처리하는 것이 보안상 안전합니다.
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
      status: 405, 
      headers: { "Content-Type": "application/json" } 
    });
  }
  
  try {
    const { videoUrl, userId } = await req.json();

    if (!videoUrl || !userId) {
      return new Response(JSON.stringify({ error: "videoUrl, userId가 필요합니다." }), { status: 400 });
    }

    // ⭐ PRO 체크 (유료 사용자 인증 게이트) ⭐
    const isPro = await isProUser(userId);
    if (!isPro) {
      return new Response(JSON.stringify({ error: "PRO 사용자만 이용할 수 있습니다." }), { status: 403 });
    }

    // 영상 ID 추출 및 유효성 검사
    const videoId = videoUrl.split("v=")[1]?.split("&")[0];
    if (!videoId) {
      return new Response(JSON.stringify({ error: "잘못된 YouTube URL 형식입니다." }), { status: 400 });
    }

    // 로직 실행
    const comments = await fetchComments(videoId);
    const analysis = await analyzeSentiment(comments);

    return new Response(JSON.stringify({
      success: true,
      analysis,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge Function Error:", err.message);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}