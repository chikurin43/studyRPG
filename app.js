const MATERIALS = [
  "ゴールド",
  "経験チップ",
  "突破チップα",
  "突破チップβ",
  "経験オーブ(赤)",
  "経験オーブ(黄)",
  "経験オーブ(緑)",
  "経験オーブ(青)",
  "経験オーブ(紫)",
  "突破オーブα(武器)",
  "突破オーブα(防具)",
  "突破オーブα(アクセサリ)",
  "突破オーブβ(物理)",
  "突破オーブβ(炎)",
  "突破オーブβ(雷)",
  "突破オーブβ(氷)",
  "ガチャトークン",
  "エネルギー",
];

const QUEST_REWARDS = [
  { name: "ゴールド", chance: 0.2, base: 1100 },
  { name: "経験チップ", chance: 0.15, base: 167 },
  { name: "突破チップα", chance: 0.05, base: 5 },
  { name: "突破チップβ", chance: 0.05, base: 5 },
  { name: "経験オーブ(赤)", chance: 0.05, base: 12 },
  { name: "経験オーブ(黄)", chance: 0.05, base: 12 },
  { name: "経験オーブ(緑)", chance: 0.05, base: 12 },
  { name: "経験オーブ(青)", chance: 0.05, base: 12 },
  { name: "経験オーブ(紫)", chance: 0.05, base: 12 },
  { name: "突破オーブα(武器)", chance: 0.0333, base: 3 },
  { name: "突破オーブα(防具)", chance: 0.0333, base: 3 },
  { name: "突破オーブα(アクセサリ)", chance: 0.0333, base: 3 },
  { name: "突破オーブβ(物理)", chance: 0.025, base: 3 },
  { name: "突破オーブβ(炎)", chance: 0.025, base: 3 },
  { name: "突破オーブβ(雷)", chance: 0.025, base: 3 },
  { name: "突破オーブβ(氷)", chance: 0.025, base: 3 },
  { name: "ガチャトークン", chance: 0.1, base: 500 },
];

const GACHA_RANKS = [
  { rank: "D-", weight: 28 },
  { rank: "D", weight: 24 },
  { rank: "D+", weight: 18 },
  { rank: "C-", weight: 12 },
  { rank: "C", weight: 8 },
  { rank: "C+", weight: 5 },
  { rank: "B-", weight: 3 },
  { rank: "B", weight: 2 },
];

const EQUIPMENT_LIBRARY = [
  { id: 1, kind: "武器", type: "メイン", attr: "物理", color: "赤", rank: "D", name: "ブレイクスラッシャー", stat: "STR", skill: "クラッシュインパクト：敵単体にSTR160%の物理ダメージ。敵が行動前なら与ダメx1.1。", mp: 18 },
  { id: 1, kind: "武器", type: "メイン", attr: "物理", color: "赤", rank: "C", name: "ブレイクスラッシャー", stat: "STR", skill: "クラッシュインパクト：敵単体にSTR160%の物理ダメージ。敵が行動前なら与ダメx1.3。", mp: 31 },
  { id: 2, kind: "武器", type: "メイン", attr: "物理", color: "黄", rank: "D", name: "クォーターセイバー", stat: "STR", skill: "クロスディバイド：敵全体に物理STR40%ダメージ。", mp: 25 },
  { id: 2, kind: "武器", type: "メイン", attr: "物理", color: "黄", rank: "C", name: "クォーターセイバー", stat: "STR", skill: "クロスディバイド：敵全体に物理STR80%ダメージ。自身のDEF-20%(1ターン)。", mp: 43 },
  { id: 3, kind: "武器", type: "メイン", attr: "物理", color: "緑", rank: "D", name: "レンジャーズボウ", stat: "SPD", skill: "ホークスナップ：敵単体にSPD150%物理ダメージ。敵の命中-10%(1ターン)。", mp: 17 },
  { id: 3, kind: "武器", type: "メイン", attr: "物理", color: "緑", rank: "C", name: "レンジャーズボウ", stat: "SPD", skill: "ホークスナップ：敵単体にSPD150%物理ダメージ。敵の命中-20%(2ターン)。", mp: 29 },
  { id: 4, kind: "武器", type: "メイン", attr: "物理", color: "青", rank: "D", name: "ブーストシューター", stat: "SPD", skill: "クイックリロード：自身のSPDを3ターン+40%。その後敵単体にSPD30%の物理ダメージ。", mp: 14 },
  { id: 4, kind: "武器", type: "メイン", attr: "物理", color: "青", rank: "C", name: "ブーストシューター", stat: "SPD", skill: "クイックリロード：自身のSPDを3ターン+40%。その後敵単体にSPD100%の物理ダメージ。", mp: 24 },
  { id: 5, kind: "武器", type: "メイン", attr: "物理", color: "紫", rank: "D", name: "シャドウエッジ", stat: "STR", skill: "ナイトメアスラスト：敵単体に物理STR150%ダメ。1ターン出血(毎ターン最大HP1%ダメ)。", mp: 20 },
  { id: 5, kind: "武器", type: "メイン", attr: "物理", color: "紫", rank: "C", name: "シャドウエッジ", stat: "STR", skill: "ナイトメアスラスト：敵単体に物理STR150%ダメ。2ターン出血(毎ターン最大HP2%ダメ)。", mp: 34 },
  { id: 6, kind: "武器", type: "メイン", attr: "炎", color: "赤", rank: "D", name: "フレアスパークブレード", stat: "STR", skill: "フレイムランページ：敵単体に炎属性STR170%ダメージ。1ターン火傷(毎ターンINT40%ダメ)。", mp: 22 },
  { id: 6, kind: "武器", type: "メイン", attr: "炎", color: "赤", rank: "C", name: "フレアスパークブレード", stat: "STR", skill: "フレイムランページ：敵単体に炎属性STR170%ダメージ。3ターン火傷(毎ターンINT40%ダメ)。", mp: 37 },
  { id: 7, kind: "武器", type: "メイン", attr: "炎", color: "黄", rank: "D", name: "ボルケニックシューター", stat: "INT", skill: "マグマスプレッド：敵全体に炎属性INT45%ダメージ。敵のDEFを1ターン-10%。", mp: 26 },
  { id: 7, kind: "武器", type: "メイン", attr: "炎", color: "黄", rank: "C", name: "ボルケニックシューター", stat: "INT", skill: "マグマスプレッド：敵全体に炎属性INT45%ダメージ。敵のDEFを2ターン-20%。", mp: 44 },
  { id: 8, kind: "武器", type: "メイン", attr: "炎", color: "緑", rank: "D", name: "ブライトテンダーワンド", stat: "INT", skill: "ヒートリザーブ：自身のHPをINT160%回復。炎耐性+20%(1ターン)。", mp: 26 },
  { id: 8, kind: "武器", type: "メイン", attr: "炎", color: "緑", rank: "C", name: "ブライトテンダーワンド", stat: "INT", skill: "ヒートリザーブ：自身のHPをINT160%回復。炎耐性+20%(3ターン)。", mp: 44 },
  { id: 9, kind: "武器", type: "メイン", attr: "炎", color: "青", rank: "D", name: "バーンアクセラレータ", stat: "MP", skill: "エナジーブレイズ：MPを20回復しつつ敵単体に炎属性INT30%ダメージ。", mp: 10 },
  { id: 9, kind: "武器", type: "メイン", attr: "炎", color: "青", rank: "C", name: "バーンアクセラレータ", stat: "MP", skill: "エナジーブレイズ：MPを20回復しつつ敵単体に炎属性INT100%ダメージ。", mp: 17 },
  { id: 10, kind: "武器", type: "メイン", attr: "炎", color: "紫", rank: "D", name: "インフェルノハンド", stat: "INT", skill: "ヘルフレイムカース：敵単体に炎属性INT140%ダメ。1ターン火傷(毎ターンINT60%ダメ)付与。", mp: 24 },
  { id: 10, kind: "武器", type: "メイン", attr: "炎", color: "紫", rank: "C", name: "インフェルノハンド", stat: "INT", skill: "ヘルフレイムカース：敵単体に炎属性INT140%ダメ。3ターン火傷(毎ターンINT60%ダメ)付与。", mp: 41 },
  { id: 11, kind: "武器", type: "メイン", attr: "雷", color: "赤", rank: "D", name: "サンダーブレイカー", stat: "STR", skill: "ショックバースト：敵単体に雷属性STR180%ダメージ。自身のSPD+5%(1ターン)。", mp: 23 },
  { id: 11, kind: "武器", type: "メイン", attr: "雷", color: "赤", rank: "C", name: "サンダーブレイカー", stat: "STR", skill: "ショックバースト：敵単体に雷属性STR180%ダメージ。自身のSPD+10%(2ターン)。", mp: 39 },
  { id: 12, kind: "武器", type: "メイン", attr: "雷", color: "黄", rank: "D", name: "ライトニングロッドランス", stat: "INT", skill: "サンダーレイン：敵全体に雷属性INT45%ダメージ。追加で1ターン麻痺(被ダメ+25%)。", mp: 28 },
  { id: 12, kind: "武器", type: "メイン", attr: "雷", color: "黄", rank: "C", name: "ライトニングロッドランス", stat: "INT", skill: "サンダーレイン：敵全体に雷属性INT45%ダメージ。追加で3ターン麻痺(被ダメ+25%)。", mp: 48 },
  { id: 13, kind: "武器", type: "メイン", attr: "雷", color: "緑", rank: "D", name: "ストームピアッサー", stat: "SPD", skill: "イオンディレイ：敵単体に雷属性SPD140%ダメージ。", mp: 18 },
  { id: 13, kind: "武器", type: "メイン", attr: "雷", color: "緑", rank: "C", name: "ストームピアッサー", stat: "SPD", skill: "イオンディレイ：敵単体に雷属性SPD140%ダメージ。敵の行動順を最後尾にする。", mp: 31 },
  { id: 14, kind: "武器", type: "メイン", attr: "雷", color: "青", rank: "D", name: "ライトニングカタリスト", stat: "MP", skill: "エレキフロー：自身のMPを35回復し、次の雷攻撃のダメージ+20%。", mp: 12 },
  { id: 14, kind: "武器", type: "メイン", attr: "雷", color: "青", rank: "C", name: "ライトニングカタリスト", stat: "MP", skill: "エレキフロー：自身のMPを35回復し、次の雷攻撃のダメージ+50%。", mp: 20 },
  { id: 15, kind: "武器", type: "メイン", attr: "雷", color: "紫", rank: "D", name: "ヴォルトキッサー", stat: "INT", skill: "スパークパニック：敵単体に雷属性INT130%ダメ。追加で1ターン混乱(MP回復効率-80%)。", mp: 20 },
  { id: 15, kind: "武器", type: "メイン", attr: "雷", color: "紫", rank: "C", name: "ヴォルトキッサー", stat: "INT", skill: "スパークパニック：敵単体に雷属性INT130%ダメ。追加で3ターン混乱(MP回復効率-80%)。", mp: 34 },
  { id: 16, kind: "武器", type: "メイン", attr: "氷", color: "赤", rank: "D", name: "クリスタルスレイヤー", stat: "STR", skill: "グレイシアクラッシュ：敵単体に氷属性STR155%ダメージ。1ターン凍結(与ダメ-20%)。", mp: 19 },
  { id: 16, kind: "武器", type: "メイン", attr: "氷", color: "赤", rank: "C", name: "クリスタルスレイヤー", stat: "STR", skill: "グレイシアクラッシュ：敵単体に氷属性STR155%ダメージ。3ターン凍結(与ダメ-20%)。", mp: 32 },
  { id: 17, kind: "武器", type: "メイン", attr: "氷", color: "黄", rank: "D", name: "フローズンスモークランチャー", stat: "INT", skill: "スノウバースト：敵全体に氷属性INT40%ダメ。命中-5%(1ターン)。", mp: 27 },
  { id: 17, kind: "武器", type: "メイン", attr: "氷", color: "黄", rank: "C", name: "フローズンスモークランチャー", stat: "INT", skill: "スノウバースト：敵全体に氷属性INT40%ダメ。命中-10%(2ターン)。", mp: 46 },
  { id: 18, kind: "武器", type: "メイン", attr: "氷", color: "緑", rank: "D", name: "グレイシャルスタッフ", stat: "INT", skill: "クールフィールド：自身の受ける炎ダメージ-50%(3ターン)。敵全体に氷属性INT10%ダメ。", mp: 22 },
  { id: 18, kind: "武器", type: "メイン", attr: "氷", color: "緑", rank: "C", name: "グレイシャルスタッフ", stat: "INT", skill: "クールフィールド：自身の受ける炎ダメージ-50%(3ターン)。敵全体に氷属性INT25%ダメ。", mp: 37 },
  { id: 19, kind: "武器", type: "メイン", attr: "氷", color: "青", rank: "D", name: "フロストエッジ", stat: "SPD", skill: "アイスアクセル：自身のSPDを3ターン+30%しつつ、敵単体に氷属性SPD30%ダメージ。", mp: 16 },
  { id: 19, kind: "武器", type: "メイン", attr: "氷", color: "青", rank: "C", name: "フロストエッジ", stat: "SPD", skill: "アイスアクセル：自身のSPDを3ターン+30%しつつ、敵単体に氷属性SPD120%ダメージ。", mp: 27 },
  { id: 20, kind: "武器", type: "メイン", attr: "氷", color: "紫", rank: "D", name: "アイスウインガー", stat: "MP", skill: "コールドチャージ：敵単体に氷属性INT90%ダメージ。敵のMP-10。", mp: 9 },
  { id: 20, kind: "武器", type: "メイン", attr: "氷", color: "紫", rank: "C", name: "アイスウインガー", stat: "MP", skill: "コールドチャージ：敵単体に氷属性INT90%ダメージ。敵のMP-30。", mp: 15 },
  { id: 21, kind: "武器", type: "サブ", attr: "物理", color: "赤", rank: "D", name: "ブレードバランサー", stat: "STR", skill: "攻撃姿勢：通常攻撃のダメージ+10%。" },
  { id: 21, kind: "武器", type: "サブ", attr: "物理", color: "赤", rank: "C", name: "ブレードバランサー", stat: "STR", skill: "攻撃姿勢：通常攻撃のダメージ+10%。通常攻撃後SPD+5%。" },
  { id: 22, kind: "武器", type: "サブ", attr: "物理", color: "黄", rank: "D", name: "ライトスリング", stat: "SPD", skill: "スウィフトモーション：デバフを受けたとき、SPD50%で反撃。" },
  { id: 22, kind: "武器", type: "サブ", attr: "物理", color: "黄", rank: "C", name: "ライトスリング", stat: "SPD", skill: "スウィフトモーション：デバフを受けたとき、SPD50%で反撃。SPD+5%。" },
  { id: 23, kind: "武器", type: "サブ", attr: "物理", color: "緑", rank: "D", name: "ウッドレンジャー", stat: "SPD", skill: "回避アシスト：回避率+10%。敵が攻撃をミスしたときSPD+15%(1ターン)" },
  { id: 23, kind: "武器", type: "サブ", attr: "物理", color: "緑", rank: "C", name: "ウッドレンジャー", stat: "SPD", skill: "回避アシスト：回避率+10%。敵が攻撃をミスしたときSPD+30%(2ターン)" },
  { id: 24, kind: "武器", type: "サブ", attr: "物理", color: "青", rank: "D", name: "クイックグリップ", stat: "SPD", skill: "スピードホールダー：SPD+8%。状態異常を付与した対象のSPD-10%(1ターン)。" },
  { id: 24, kind: "武器", type: "サブ", attr: "物理", color: "青", rank: "C", name: "クイックグリップ", stat: "SPD", skill: "スピードホールダー：SPD+8%。状態異常を付与した対象のSPD-20%(2ターン)。" },
  { id: 25, kind: "武器", type: "サブ", attr: "物理", color: "紫", rank: "D", name: "シャドウグリップ", stat: "STR", skill: "ダークブレイド：通常攻撃時、出血2ターン付与(毎ターン最大HPの2%ダメージ)。出血状態の敵から受けるダメージ-5%。" },
  { id: 25, kind: "武器", type: "サブ", attr: "物理", color: "紫", rank: "C", name: "シャドウグリップ", stat: "STR", skill: "ダークブレイド：通常攻撃時、出血2ターン付与(毎ターン最大HPの2%ダメージ)。出血状態の敵から受けるダメージ-20%。" },
  { id: 26, kind: "武器", type: "サブ", attr: "炎", color: "赤", rank: "D", name: "ヒートエッジチップ", stat: "STR", skill: "フレイムエンハンス：炎属性攻撃のダメージ+12%。敵が火傷状態ならさらに+5%。" },
  { id: 26, kind: "武器", type: "サブ", attr: "炎", color: "赤", rank: "C", name: "ヒートエッジチップ", stat: "STR", skill: "フレイムエンハンス：炎属性攻撃のダメージ+12%。敵が火傷状態ならさらに+20%。" },
  { id: 27, kind: "武器", type: "サブ", attr: "炎", color: "黄", rank: "D", name: "マグマアシスター", stat: "INT", skill: "バーニングディストーション：全体攻撃のダメージ+8%。自分よりDEFが低い敵に対するダメージ+5%。" },
  { id: 27, kind: "武器", type: "サブ", attr: "炎", color: "黄", rank: "C", name: "マグマアシスター", stat: "INT", skill: "バーニングディストーション：全体攻撃のダメージ+8%。自分よりDEFが低い敵に対するダメージ+20%。" },
  { id: 28, kind: "武器", type: "サブ", attr: "炎", color: "緑", rank: "D", name: "ヒートシャーマンワンド", stat: "INT", skill: "ウォームヒール：毎ターン開始時HPをINTの5%回復。敵全体に回復したHPの3%の炎属性ダメージ。" },
  { id: 28, kind: "武器", type: "サブ", attr: "炎", color: "緑", rank: "C", name: "ヒートシャーマンワンド", stat: "INT", skill: "ウォームヒール：毎ターン開始時HPをINTの5%回復。敵全体に回復したHPの10%の炎属性ダメージ。" },
  { id: 29, kind: "武器", type: "サブ", attr: "炎", color: "青", rank: "D", name: "フレアタンク", stat: "MP", skill: "ヒートリザーバー：MPを2倍消費するとダメージ2倍。" },
  { id: 29, kind: "武器", type: "サブ", attr: "炎", color: "青", rank: "C", name: "フレアタンク", stat: "MP", skill: "ヒートリザーバー：最大MP+15%。MPを2倍消費するとダメージ2倍。" },
  { id: 30, kind: "武器", type: "サブ", attr: "炎", color: "紫", rank: "D", name: "ブラッドフレアリング", stat: "INT", skill: "カースフレイム：攻撃命中時、2ターン火傷付与(毎ターンINT15%ダメ)。火傷状態の敵の数だけINT+3%。" },
  { id: 30, kind: "武器", type: "サブ", attr: "炎", color: "紫", rank: "C", name: "ブラッドフレアリング", stat: "INT", skill: "カースフレイム：攻撃命中時、2ターン火傷付与(毎ターンINT15%ダメ)。火傷状態の敵の数だけINT+10%。" },
  { id: 31, kind: "武器", type: "サブ", attr: "雷", color: "赤", rank: "D", name: "ボルトストライカー", stat: "STR", skill: "ショックアタック：雷属性通常攻撃後与ダメ+15%(2ターン)、SPD+5%。" },
  { id: 31, kind: "武器", type: "サブ", attr: "雷", color: "赤", rank: "C", name: "ボルトストライカー", stat: "STR", skill: "ショックアタック：雷属性通常攻撃後与ダメ+15%(2ターン)、SPD+20%。" },
  { id: 32, kind: "武器", type: "サブ", attr: "雷", color: "黄", rank: "D", name: "サンダーコイル", stat: "INT", skill: "エレクトロチャージ：雷属性魔法の消費MP-15%。雷属性で攻撃した対象に「帯電」を付与し、3つ溜まるとINT30%雷ダメージ。" },
  { id: 32, kind: "武器", type: "サブ", attr: "雷", color: "黄", rank: "C", name: "サンダーコイル", stat: "INT", skill: "エレクトロチャージ：雷属性魔法の消費MP-15%。雷属性で攻撃した対象に「帯電」を付与し、3つ溜まるとINT100%雷ダメージ。" },
  { id: 33, kind: "武器", type: "サブ", attr: "雷", color: "緑", rank: "D", name: "ストームブレスレット", stat: "SPD", skill: "サンダーガード：雷耐性+20%。自分の行動後、そのターン受けるダメージ-5%。" },
  { id: 33, kind: "武器", type: "サブ", attr: "雷", color: "緑", rank: "C", name: "ストームブレスレット", stat: "SPD", skill: "サンダーガード：雷耐性+20%。自分の行動後、そのターン受けるダメージ-20%。" },
  { id: 34, kind: "武器", type: "サブ", attr: "雷", color: "青", rank: "D", name: "イオンスラスター", stat: "MP", skill: "エレキチャージ：行動後MP+4。雷属性ダメージ+10%。" },
  { id: 34, kind: "武器", type: "サブ", attr: "雷", color: "青", rank: "C", name: "イオンスラスター", stat: "MP", skill: "エレキチャージ：行動後MP+4。雷属性ダメージ+25%。" },
  { id: 35, kind: "武器", type: "サブ", attr: "雷", color: "紫", rank: "D", name: "ショックフィンガー", stat: "INT", skill: "ジャミングスパーク：通常攻撃時、10%で麻痺付与。状態異常を付与したときMP回復効率+25%(1ターン)。" },
  { id: 35, kind: "武器", type: "サブ", attr: "雷", color: "紫", rank: "C", name: "ショックフィンガー", stat: "INT", skill: "ジャミングスパーク：通常攻撃時、10%で麻痺付与。状態異常を付与したときMP回復効率+50%(2ターン)。" },
  { id: 36, kind: "武器", type: "サブ", attr: "氷", color: "赤", rank: "D", name: "スノークラッシャー", stat: "STR", skill: "フリーズブレイク：氷属性攻撃のクリ率+10%。凍結状態の敵に攻撃したとき、その効果が切れるまでDEF-3%を追加付与(重ねがけ可)。" },
  { id: 36, kind: "武器", type: "サブ", attr: "氷", color: "赤", rank: "C", name: "スノークラッシャー", stat: "STR", skill: "フリーズブレイク：氷属性攻撃のクリ率+10%。凍結状態の敵に攻撃したとき、その効果が切れるまでDEF-10%を追加付与(重ねがけ可)。" },
  { id: 37, kind: "武器", type: "サブ", attr: "氷", color: "黄", rank: "D", name: "フローズンオーブ", stat: "INT", skill: "アイススプレッド：全体魔法の消費MP-10%、与ダメージx1.1。" },
  { id: 37, kind: "武器", type: "サブ", attr: "氷", color: "黄", rank: "C", name: "フローズンオーブ", stat: "INT", skill: "アイススプレッド：全体魔法の消費MP-10%、与ダメージx1.3。" },
  { id: 38, kind: "武器", type: "サブ", attr: "氷", color: "緑", rank: "D", name: "グレイシアリーフ", stat: "INT", skill: "クールガード：氷属性耐性+15%。氷属性ダメージを与えたターンのDEF+10%。" },
  { id: 38, kind: "武器", type: "サブ", attr: "氷", color: "緑", rank: "C", name: "グレイシアリーフ", stat: "INT", skill: "クールガード：氷属性耐性+15%。氷属性ダメージを与えたターンのDEF+40%。" },
  { id: 39, kind: "武器", type: "サブ", attr: "氷", color: "青", rank: "D", name: "クールシフター", stat: "SPD", skill: "アイスフロー：行動後MPを+3回復。自分よりSPDが低い敵に対するダメージ+10%。" },
  { id: 39, kind: "武器", type: "サブ", attr: "氷", color: "青", rank: "C", name: "クールシフター", stat: "SPD", skill: "アイスフロー：行動後MPを+3回復。自分よりSPDが低い敵に対するダメージ+40%。" },
  { id: 40, kind: "武器", type: "サブ", attr: "氷", color: "紫", rank: "D", name: "フロストカーストーン", stat: "INT", skill: "コールドヘックス：攻撃時、敵のSPD-5%(2ターン)を付与。敵のMPを下げたとき、その分のMPの30%を回復。" },
  { id: 40, kind: "武器", type: "サブ", attr: "氷", color: "紫", rank: "C", name: "フロストカーストーン", stat: "INT", skill: "コールドヘックス：攻撃時、敵のSPD-5%(2ターン)を付与。敵のMPを下げたとき、その分のMPを回復。" },
];

const STORAGE_KEY = "studyRpgStateV2";

const defaultState = {
  quests: [],
  completedQuests: [],
  materials: MATERIALS.reduce((acc, name) => ({ ...acc, [name]: name === "ガチャトークン" ? 500 : 2000 }), {}),
  equipment: [],
  gachaLog: [],
  studyHours: 0,
  clearedFloors: 0,
  playerPower: 1200,
  gachaLevel: 1,
};
defaultState.materials["エネルギー"] = 1800;

const state = loadState();

const questForm = document.getElementById("questForm");
const questName = document.getElementById("questName");
const questDesire = document.getElementById("questDesire");
const questHours = document.getElementById("questHours");
const questPreview = document.getElementById("questPreview");
const questActiveList = document.getElementById("questActiveList");
const questCompletedList = document.getElementById("questCompletedList");
const materialList = document.getElementById("materialList");
const equipmentList = document.getElementById("equipmentList");
const gachaLog = document.getElementById("gachaLog");
const stageList = document.getElementById("stageList");
const studyHoursInput = document.getElementById("studyHours");
const clearedFloorsInput = document.getElementById("clearedFloors");
const questLevelEl = document.getElementById("questLevel");
const questMultiplierEl = document.getElementById("questMultiplier");
const playerPowerInput = document.getElementById("playerPower");
const gachaLevelInput = document.getElementById("gachaLevel");
const manualSaveButton = document.getElementById("manualSave");
const resetButton = document.getElementById("resetData");
const rollGachaButton = document.getElementById("rollGacha");
const rollAllGachaButton = document.getElementById("rollAllGacha");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
const calculateQuestLevel = () => Math.max(1, Math.ceil(state.clearedFloors / 3));
const calculateMultiplier = () => {
  const lv = calculateQuestLevel();
  return (1 + (lv - 1) * 0.25) * (1 + (lv - 1) / 100);
};
const formatNumber = (v) => Math.ceil(v).toLocaleString("ja-JP");

function pickReward() {
  const roll = Math.random();
  let total = 0;
  for (const reward of QUEST_REWARDS) {
    total += reward.chance;
    if (roll <= total) return reward;
  }
  return QUEST_REWARDS.at(-1);
}

function generateRewards(desire, hours) {
  const multi = calculateMultiplier();
  return Array.from({ length: desire }, () => {
    const reward = pickReward();
    return { name: reward.name, amount: Math.ceil(reward.base * hours * multi) };
  });
}

function addQuest(event) {
  event.preventDefault();
  const name = questName.value.trim();
  const desire = Number(questDesire.value);
  const hours = Number(questHours.value);
  if (!name || !hours) return;
  state.quests.push({ id: crypto.randomUUID(), name, desire, hours, rewards: generateRewards(desire, hours) });
  questForm.reset();
  questDesire.value = "1";
  questHours.value = "1";
  updateUI();
}

function completeQuest(questId) {
  const i = state.quests.findIndex((q) => q.id === questId);
  if (i < 0) return;
  const quest = state.quests.splice(i, 1)[0];
  state.completedQuests.unshift(quest);
  quest.rewards.forEach((r) => { state.materials[r.name] = (state.materials[r.name] || 0) + r.amount; });
  updateUI();
}

function renderQuestItem(quest, done = false) {
  const item = document.createElement("div");
  item.className = `quest-item${done ? " completed" : ""}`;
  item.innerHTML = `<div><h4>${quest.name}</h4><div class="reward-list">${quest.rewards.map((r) => `<span class="reward">${r.name} +${formatNumber(r.amount)}</span>`).join("")}</div></div>${done ? '<span class="pill">完了</span>' : `<button data-id="${quest.id}">完了</button>`}`;
  if (!done) item.querySelector("button").addEventListener("click", () => completeQuest(quest.id));
  return item;
}

function renderQuestLists() {
  questPreview.innerHTML = "";
  questActiveList.innerHTML = "";
  questCompletedList.innerHTML = "";
  if (!state.quests.length) {
    questPreview.classList.add("empty");
    questPreview.textContent = "まだクエストがありません。";
    questActiveList.classList.add("empty");
    questActiveList.textContent = "進行中のクエストがありません。";
  } else {
    questPreview.classList.remove("empty");
    questActiveList.classList.remove("empty");
    state.quests.forEach((q) => {
      questPreview.appendChild(renderQuestItem(q));
      questActiveList.appendChild(renderQuestItem(q));
    });
  }
  if (!state.completedQuests.length) {
    questCompletedList.classList.add("empty");
    questCompletedList.textContent = "完了済みクエストがありません。";
  } else {
    questCompletedList.classList.remove("empty");
    state.completedQuests.forEach((q) => questCompletedList.appendChild(renderQuestItem(q, true)));
  }
}

function renderMaterials() {
  materialList.innerHTML = "";
  MATERIALS.forEach((name) => {
    const item = document.createElement("div");
    item.className = "inventory-item";
    item.innerHTML = `<strong>${name}</strong><span>${formatNumber(state.materials[name] || 0)}</span>`;
    materialList.appendChild(item);
  });
}

function normalizeRankForSkill(rank) {
  if (["D-", "D", "D+"].includes(rank)) return "D";
  if (["C-", "C", "C+"].includes(rank)) return "C";
  if (rank.startsWith("B")) return "C";
  return "D";
}

function rollRank() {
  const levelBoost = Math.min(Math.floor(state.gachaLevel / 5), 6);
  const boosted = GACHA_RANKS.map((r, i) => ({ ...r, weight: r.weight + (i < levelBoost ? 3 : 0) }));
  const total = boosted.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of boosted) {
    roll -= r.weight;
    if (roll <= 0) return r.rank;
  }
  return boosted[0].rank;
}

function rollEquipment(rank) {
  const skillRank = normalizeRankForSkill(rank);
  const pool = EQUIPMENT_LIBRARY.filter((e) => e.rank === skillRank);
  if (!pool.length) {
    return { id: crypto.randomUUID(), name: "未実装装備", kind: "武器", type: "メイン", attr: "物理", color: "赤", rank, stat: "STR", skill: "今後実装", mp: "-" };
  }
  const base = pool[Math.floor(Math.random() * pool.length)];
  return {
    uid: crypto.randomUUID(),
    sourceId: base.id,
    name: base.name,
    kind: base.kind,
    type: base.type,
    attr: base.attr,
    color: base.color,
    rank,
    baseRank: base.rank,
    stat: base.stat,
    skill: base.skill,
    mp: base.mp ?? "-",
    level: 1,
  };
}

function renderEquipment() {
  equipmentList.innerHTML = "";
  if (!state.equipment.length) {
    equipmentList.classList.add("empty");
    equipmentList.textContent = "装備がありません。";
    return;
  }
  equipmentList.classList.remove("empty");
  state.equipment.forEach((e) => {
    const item = document.createElement("div");
    item.className = "quest-item";
    item.innerHTML = `<div><h4>${e.name}</h4><div class="reward-list"><span class="pill">${e.kind}/${e.type}</span><span class="pill">${e.attr}/${e.color}</span><span class="pill">ランク ${e.rank}</span><span class="pill">主ステ ${e.stat}</span><span class="pill">消費MP ${e.mp}</span></div><p class="muted">${e.skill}</p></div>`;
    equipmentList.appendChild(item);
  });
}

function rollGacha(times = 1) {
  if (state.materials["ガチャトークン"] < 100) return alert("ガチャトークンが不足しています。");
  const rolls = Math.min(times, Math.floor(state.materials["ガチャトークン"] / 100));
  for (let i = 0; i < rolls; i += 1) {
    state.materials["ガチャトークン"] -= 100;
    const rank = rollRank();
    const eq = rollEquipment(rank);
    state.equipment.unshift(eq);
    state.gachaLog.unshift(`【${eq.rank}】${eq.name} (${eq.kind}/${eq.type}/${eq.attr}/${eq.color})`);
  }
  updateUI();
}

function renderGachaLog() {
  gachaLog.innerHTML = "";
  if (!state.gachaLog.length) {
    gachaLog.classList.add("empty");
    gachaLog.textContent = "まだガチャ結果がありません。";
    return;
  }
  gachaLog.classList.remove("empty");
  state.gachaLog.slice(0, 8).forEach((entry) => {
    const item = document.createElement("div");
    item.className = "quest-item";
    item.innerHTML = `<span>${entry}</span><span class="pill">NEW</span>`;
    gachaLog.appendChild(item);
  });
}

function renderStages() {
  stageList.innerHTML = "";
  Array.from({ length: 30 }, (_, i) => i + 1).forEach((floor) => {
    const enemyPower = 800 + floor * 40;
    const reward = Math.ceil(200 + floor * 25);
    const canSkip = state.playerPower >= enemyPower * 1.5;
    const card = document.createElement("div");
    card.className = "stage-card";
    card.innerHTML = `<header><strong>ステージ1 - フロア${floor}</strong><span class="pill">敵戦闘力 ${enemyPower}</span></header><p class="muted">報酬: ゴールド ${reward}</p><div class="action-row"><button ${state.materials["エネルギー"] < 180 ? "disabled" : ""}>挑戦 (エネルギー180)</button><button class="ghost" ${canSkip ? "" : "disabled"}>${canSkip ? "スキップ報酬" : "戦闘力不足"}</button></div>`;
    const [challenge, skip] = card.querySelectorAll("button");
    challenge.addEventListener("click", () => {
      if (state.materials["エネルギー"] < 180) return;
      state.materials["エネルギー"] -= 180;
      state.materials["ゴールド"] += reward;
      state.clearedFloors = Math.max(state.clearedFloors, floor);
      state.gachaLevel = Math.max(1, Math.ceil(state.clearedFloors / 30));
      updateUI();
    });
    skip.addEventListener("click", () => {
      if (!canSkip) return;
      state.materials["ゴールド"] += reward;
      state.clearedFloors = Math.max(state.clearedFloors, floor);
      state.gachaLevel = Math.max(1, Math.ceil(state.clearedFloors / 30));
      updateUI();
    });
    stageList.appendChild(card);
  });
}

function updateStatus() {
  questLevelEl.textContent = calculateQuestLevel();
  questMultiplierEl.textContent = calculateMultiplier().toFixed(2);
  studyHoursInput.value = state.studyHours;
  clearedFloorsInput.value = state.clearedFloors;
  playerPowerInput.value = state.playerPower;
  gachaLevelInput.value = state.gachaLevel;
}

function updateUI() {
  updateStatus();
  renderQuestLists();
  renderMaterials();
  renderEquipment();
  renderGachaLog();
  renderStages();
  saveState();
}

function handleTabSwitch(event) {
  const tab = event.target.closest(".tab");
  if (!tab) return;
  tabs.forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  panels.forEach((p) => p.classList.toggle("active", p.id === tab.dataset.tab));
}

questForm.addEventListener("submit", addQuest);
document.querySelector(".tabs").addEventListener("click", handleTabSwitch);
rollGachaButton.addEventListener("click", () => rollGacha(1));
rollAllGachaButton.addEventListener("click", () => rollGacha(Math.floor(state.materials["ガチャトークン"] / 100)));
studyHoursInput.addEventListener("input", (e) => { state.studyHours = Number(e.target.value); updateUI(); });
clearedFloorsInput.addEventListener("input", (e) => { state.clearedFloors = Number(e.target.value); updateUI(); });
playerPowerInput.addEventListener("input", (e) => { state.playerPower = Number(e.target.value); updateUI(); });
gachaLevelInput.addEventListener("input", (e) => { state.gachaLevel = Number(e.target.value); updateUI(); });
manualSaveButton.addEventListener("click", () => { saveState(); alert("手動セーブしました。"); });
resetButton.addEventListener("click", () => { if (confirm("セーブデータを初期化しますか？")) { Object.assign(state, structuredClone(defaultState)); updateUI(); } });

updateUI();
