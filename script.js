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
    const selectedRegions = Array.from(document.querySelectorAll('.region:checked')).map(cb => cb.value);

    console.log("選択されたペンギン:", selectedPenguins);
    console.log("選択された地域:", selectedRegions);

    // 水族館データの取得
    const { data: aquariums, error: aquariumsError } = await supabase
        .from('aquarium')
        .select('aquarium_id, name, region');

    if (aquariumsError) {
        console.error("水族館情報の取得エラー:", aquariumsError);
        return;
    }

    // ペンギン情報の取得
    const { data: penguins, error: penguinsError } = await supabase
        .from('penguin')
        .select('penguin_id, penguin');

    if (penguinsError) {
        console.error("ペンギン情報の取得エラー:", penguinsError);
        return;
    }

    // 水族館とペンギンの関連データ取得
    const { data: aquariumPenguins, error: aquariumPenguinsError } = await supabase
        .from('aquarium_penguin')
        .select('aquarium_id, penguin_id');

    if (aquariumPenguinsError) {
        console.error("水族館とペンギンの関連データ取得エラー:", aquariumPenguinsError);
        return;
    }

    // フィルタリング処理
    const filteredAquariums = aquariumPenguins.filter(item =>
        selectedPenguins.length === 0 || selectedPenguins.includes(item.penguin_id)
    );

    const groupedResults = filteredAquariums.reduce((acc, curr) => {
        const aquarium = aquariums.find(a => a.aquarium_id === curr.aquarium_id);
        if (!aquarium) return acc;

        if (selectedRegions.length === 0 || selectedRegions.includes(aquarium.region)) {
            const penguin = penguins.find(p => p.penguin_id === curr.penguin_id);
            if (!penguin) return acc;

            const key = aquarium.aquarium_id;
            if (!acc[key]) {
                acc[key] = {
                    aquarium: aquarium.name,
                    region: aquarium.region,
                    penguins: []
                };
            }

            if (!acc[key].penguins.includes(penguin.penguin)) {
                acc[key].penguins.push(penguin.penguin);
            }
        }

        return acc;
    }, {});

    // 結果の表示
    const resultDiv = document.getElementById('result');
    if (Object.keys(groupedResults).length === 0) {
        resultDiv.innerHTML = '<p>該当する水族館はありません。</p>';
    } else {
        resultDiv.innerHTML = Object.values(groupedResults).map(r =>
            `<p><strong>${r.aquarium}</strong>（${r.region})<br>
            　ペンギン: ${r.penguins.join('、')}</p>`
        ).join('');
    }
}
