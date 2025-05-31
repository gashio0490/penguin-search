document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = "https://qkdhlccumzcqjxfcizxp.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZGhsY2N1bXpjcWp4ZmNpenhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MjE2MDMsImV4cCI6MjA1ODE5NzYwM30.vPpt__seB_nR4o2liZyD9k4EqhZYLPXFDwaLWIq1z5I";

    // Supabaseクライアントの初期化
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabaseClient;

    document.getElementById("searchButton").addEventListener("click", searchAquariums);
});

async function searchAquariums() {
    const supabase = window.supabase;
    if (!supabase) {
        console.error("Supabaseが正しく初期化されていません。");
        return;
    }

    // 選択されたペンギン・地域・コンテンツを取得
    const selectedPenguins = Array.from(document.querySelectorAll('.penguin:checked')).map(cb => parseInt(cb.value));
    const selectedRegions = Array.from(document.querySelectorAll('.region:checked')).map(cb => parseInt(cb.value));
    const selectedContents = Array.from(document.querySelectorAll('.content:checked')).map(cb => parseInt(cb.value));

    console.log("選択されたペンギン:", selectedPenguins);
    console.log("選択された地域:", selectedRegions);
    console.log("選択されたコンテンツ:", selectedContents);

    // データの取得
    const { data: viewData, error } = await supabase
        .from('aquarium_view')
        .select('*')
        .order('region_id', { ascending: true })
        .order('penguin_id', { ascending: true })
        .order('contents_id', { ascending: true });

    if (error) {
        console.error("DB取得エラー:", error);
        return;
    }

    // フィルタリング処理（ペンギン、地域、コンテンツ）
    const filtered = viewData.filter(row =>
        (selectedPenguins.length === 0 || selectedPenguins.includes(row.penguin_id)) &&
        (selectedRegions.length === 0 || selectedRegions.includes(row.region_id)) &&
        (selectedContents.length === 0 || selectedContents.includes(row.contents_id))
    );

    const groupedResults = filtered.reduce((acc, row) => {
        if (!acc[row.aquarium_id]) {
            acc[row.aquarium_id] = {
                aquarium: row.aquarium_name,
                pref: row.pref,
                url:row.url,
                penguins: new Set(),
                contents: new Set()
            };
        }

        acc[row.aquarium_id].penguins.add(row.penguin_name);
        if (row.contents) {
            acc[row.aquarium_id].contents.add(row.contents);
        }

        return acc;
    }, {});

    // 結果の表示
    const resultDiv = document.getElementById('result');
    if (Object.keys(groupedResults).length === 0) {
        resultDiv.innerHTML = '<p>該当する水族館・動物園はありません。</p>';
    } else {
        resultDiv.innerHTML = Object.values(groupedResults).map(r =>
            `<div class="result-card" onclick="location.href='${r.url}'">
            <p><strong>${r.aquarium}</strong>（${r.pref}）<br>
            　<strong>ペンギン</strong>: ${[...r.penguins].join('、')}<br>
            　<strong>コンテンツ</strong>: ${[...r.contents].join('、') || 'なし'}</p>
            　<span class="arrow">›</span>
            </div>`
        ).join('');
    }
}
