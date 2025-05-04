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

    // 選択されたペンギンと地域を取得
    const selectedPenguins = Array.from(document.querySelectorAll('.penguin:checked')).map(cb => parseInt(cb.value));
    const selectedRegions = Array.from(document.querySelectorAll('.region:checked')).map(cb => parseInt(cb.value));

    console.log("選択されたペンギン:", selectedPenguins);
    console.log("選択された地域:", selectedRegions);

    //データの取得
    const { data: viewData, error } = await supabase
        .from('aquarium_view')
        .select('*');

    if (error) {
        console.error("DB取得エラー:", error);
        return;
    }

    // フィルタリング処理
    const filtered = viewData.filter(row =>
        (selectedPenguins.length === 0 || selectedPenguins.includes(row.penguin_id)) &&
        (selectedRegions.length === 0 || selectedRegions.includes(row.region_id))
    );

    const groupedResults = filtered.reduce((acc, row) => {
        if (!acc[row.aquarium_id]) {
            acc[row.aquarium_id] = {
                aquarium: row.aquarium_name,
                pref: row.pref,
                penguins: []
            };
        }

        if (!acc[row.aquarium_id].penguins.includes(row.penguin_name)) {
            acc[row.aquarium_id].penguins.push(row.penguin_name);
        }

        return acc;
    }, {});

    // 結果の表示
    const resultDiv = document.getElementById('result');
    if (Object.keys(groupedResults).length === 0) {
        resultDiv.innerHTML = '<p>該当する水族館はありません。</p>';
    } else {
        resultDiv.innerHTML = Object.values(groupedResults).map(r =>
            `<p><strong>${r.aquarium}</strong>（${r.pref})<br>
            　${r.penguins.join('、')}</p>`
        ).join('');
    }
}
