const data = [
    { penguin: "アデリーペンギン", aquarium: "海遊館", region: "関西" },
    { penguin: "ジェンツーペンギン", aquarium: "海遊館", region: "関西" },
    { penguin: "オウサマペンギン", aquarium: "海遊館", region: "関西" },
    { penguin: "ミナミイワトビペンギン", aquarium: "海遊館", region: "関西" },
    { penguin: "ケープペンギン", aquarium: "サンシャイン水族館", region: "関東" },
    { penguin: "コウテイペンギン", aquarium: "名古屋港水族館", region: "中部" },
    { penguin: "アデリーペンギン", aquarium: "名古屋港水族館", region: "中部" },
    { penguin: "ジェンツーペンギン", aquarium: "名古屋港水族館", region: "中部" },
    { penguin: "ヒゲペンギン", aquarium: "名古屋港水族館", region: "中部" }
];

function searchAquariums() {
    // 選択されたペンギンと地域を取得
    const selectedPenguins = Array.from(document.querySelectorAll('.penguin:checked')).map(cb => cb.value);
    const selectedRegions = Array.from(document.querySelectorAll('.region:checked')).map(cb => cb.value);
    
    // 結果をフィルタリング
    const results = data.filter(item =>
        (selectedPenguins.length === 0 || selectedPenguins.includes(item.penguin)) &&
        (selectedRegions.length === 0 || selectedRegions.includes(item.region))
    );
    
    // 結果をグループ化
    const groupedResults = results.reduce((acc, curr) => {
        const key = curr.aquarium;
        if (!acc[key]) {
            acc[key] = { aquarium: key, penguins: [] };
        }
        if (!acc[key].penguins.includes(curr.penguin)) {
            acc[key].penguins.push(curr.penguin);
        }
        return acc;
    }, {});
    
    // 結果を表示
    const resultDiv = document.getElementById('result');
    if (Object.keys(groupedResults).length === 0) {
        resultDiv.innerHTML = '<p>該当する水族館はありません。</p>';
    } else {
        resultDiv.innerHTML = Object.values(groupedResults).map(r =>
            `<p>${r.aquarium}（${r.penguins.join('、')}）</p>`
        ).join('');
    }
}
