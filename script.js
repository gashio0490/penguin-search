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
    const loading = document.getElementById('loading');
    const btnText = document.querySelector('#searchButton .btn-text');

    if (!supabase) {
        console.error("Supabaseが正しく初期化されていません。");
        return;
    }

    // ローディング表示
    btnText.style.display = 'none';
    loading.style.display = 'inline';

    // 選択されたペンギン・地域・コンテンツを取得
    const selectedPenguins = Array.from(document.querySelectorAll('.penguin:checked')).map(cb => parseInt(cb.value));
    const selectedRegions = Array.from(document.querySelectorAll('.region:checked')).map(cb => parseInt(cb.value));
    const selectedContents = Array.from(document.querySelectorAll('.content:checked')).map(cb => parseInt(cb.value));

    console.log("選択されたペンギン:", selectedPenguins);
    console.log("選択された地域:", selectedRegions);
    console.log("選択されたコンテンツ:", selectedContents);

    // データの取得
    try {
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
                    url: row.url,
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
                `<div class="result-card" onclick="window.open('${r.url}', '_blank')">
                  <div class="text-content">
                      <p><strong>${r.aquarium}</strong>（${r.pref}）</p>
                          <div class="icon-tag-row">
                                <img class="icon" src="images/empchick.png" alt="ペンギンアイコン">
                                      <div class="tag-wrap">
                                              ${[...r.penguins].map(p => `<span class="tag">${p}</span>`).join(' ')}
                                      </div>
                            </div>
                          <div class="icon-tag-row">
                                <img class="icon" src="images/fish.png" alt="コンテンツアイコン">
                                      <div class="tag-wrap">
                                              ${[...(r.contents || [])].length ? [...r.contents].map(p => `<span class="tag">${p}</span>`).join(' ') : 'なし'}
                                      </div>
                            </div>
                  </div>
                  <span class="arrow">›</span>
                </div>`
           
             ).join('');
        }
    } finally {
        // ローディング非表示・テキスト再表示
        loading.style.display = 'none';
        btnText.style.display = 'inline';
    }
}
