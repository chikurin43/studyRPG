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
  { id: 41, kind: "防具", type: "メイン", attr: "物理", color: "赤", rank: "D", name: "タクティカルレガース", stat: "DEF", skill: "フォースブロック：1ターンの間、被ダメ-40%。", mp: 18 },
  { id: 41, kind: "防具", type: "メイン", attr: "物理", color: "赤", rank: "C", name: "タクティカルレガース", stat: "DEF", skill: "フォースブロック：1ターンの間、被ダメ-40%。次のターン、SPDが「期間中にダメージを受けた回数x10%」増加する", mp: 31 },
  { id: 42, kind: "防具", type: "メイン", attr: "物理", color: "黄", rank: "D", name: "インパクトアーマー", stat: "STR", skill: "ショックウェイブ：敵全体にSTR35%物理ダメ。追加攻撃のダメージ+25%(1ターン)。", mp: 25 },
  { id: 42, kind: "防具", type: "メイン", attr: "物理", color: "黄", rank: "C", name: "インパクトアーマー", stat: "STR", skill: "ショックウェイブ：敵全体にSTR35%物理ダメ。追加攻撃のダメージ+50%(2ターン)。", mp: 43 },
  { id: 43, kind: "防具", type: "メイン", attr: "物理", color: "緑", rank: "D", name: "ガードレンジャーベスト", stat: "DEF", skill: "シェルトラップ：1ターンの間、ダメージを受けるたびDEF+30%。", mp: 14 },
  { id: 43, kind: "防具", type: "メイン", attr: "物理", color: "緑", rank: "C", name: "ガードレンジャーベスト", stat: "DEF", skill: "シェルトラップ：2ターンの間、ダメージを受けるたびDEF+30%。効果中に状態異常になると自身のバフが全て解除されてしまう。", mp: 24 },
  { id: 44, kind: "防具", type: "メイン", attr: "物理", color: "青", rank: "D", name: "タクティカルモーションギア", stat: "SPD", skill: "クイックバリア：自身の被ダメ20%軽減(1T)、次のターンSPD+30%", mp: 12 },
  { id: 44, kind: "防具", type: "メイン", attr: "物理", color: "青", rank: "C", name: "タクティカルモーションギア", stat: "SPD", skill: "クイックバリア：自身の被ダメ20%軽減(1T)、次のターンSPD+30%、最も速く行動する。", mp: 20 },
  { id: 45, kind: "防具", type: "メイン", attr: "物理", color: "紫", rank: "D", name: "ダークシールドメイル", stat: "DEF", skill: "ナイトメアガード：1ターンの間、被ダメ-35%、攻撃者に1ターン出血(毎ターン最大HP2%ダメ)。", mp: 20 },
  { id: 45, kind: "防具", type: "メイン", attr: "物理", color: "紫", rank: "C", name: "ダークシールドメイル", stat: "DEF", skill: "ナイトメアガード：1ターンの間、被ダメ-35%、攻撃者に3ターン出血(毎ターン最大HP2%ダメ)。", mp: 34 },
  { id: 46, kind: "防具", type: "メイン", attr: "炎", color: "赤", rank: "D", name: "フレイムレジスタンスメイル", stat: "DEF", skill: "ファイアウォール・ガード：2ターンの間、受ける炎ダメージ-50%、炎ダメージを受けたとき炎属性DEF20%で反撃。", mp: 20 },
  { id: 46, kind: "防具", type: "メイン", attr: "炎", color: "赤", rank: "C", name: "フレイムレジスタンスメイル", stat: "DEF", skill: "ファイアウォール・ガード：2ターンの間、受ける炎ダメージ-50%、炎ダメージを受けたとき炎属性DEF80%で反撃。", mp: 34 },
  { id: 47, kind: "防具", type: "メイン", attr: "炎", color: "黄", rank: "D", name: "マグマローブ", stat: "INT", skill: "ラヴァサークル：敵全体にINT40%炎ダメ。", mp: 26 },
  { id: 47, kind: "防具", type: "メイン", attr: "炎", color: "黄", rank: "C", name: "マグマローブ", stat: "INT", skill: "ラヴァサークル：敵全体にINT40%炎ダメ。フィールドを3ターン「火山」状態にする(敵味方関係なく毎ターン最大HPの2%ダメージ)。", mp: 44 },
  { id: 48, kind: "防具", type: "メイン", attr: "炎", color: "緑", rank: "D", name: "ウォームガーディアン", stat: "HP", skill: "ヒートプロテクト：3ターンの間、受ける炎ダメージ-30%。", mp: 18 },
  { id: 48, kind: "防具", type: "メイン", attr: "炎", color: "緑", rank: "C", name: "ウォームガーディアン", stat: "HP", skill: "ヒートプロテクト：3ターンの間、受ける炎ダメージ-30%、炎属性状態異常耐性+30%。", mp: 31 },
  { id: 49, kind: "防具", type: "メイン", attr: "炎", color: "青", rank: "D", name: "フレイムチャージローブ", stat: "MP", skill: "エナジーインフェルノ：自身のMP10回復、与える炎ダメージ+30%(2T)。", mp: 12 },
  { id: 49, kind: "防具", type: "メイン", attr: "炎", color: "青", rank: "C", name: "フレイムチャージローブ", stat: "MP", skill: "エナジーインフェルノ：自身のMP40回復、与える炎ダメージ+30%(2T)。", mp: 20 },
  { id: 50, kind: "防具", type: "メイン", attr: "炎", color: "紫", rank: "D", name: "カースドフレイムアーマー", stat: "INT", skill: "ブラッドバーン：敵単体へINT70%炎ダメ、1ターン火傷(毎ターンINT50%ダメ)。", mp: 25 },
  { id: 50, kind: "防具", type: "メイン", attr: "炎", color: "紫", rank: "C", name: "カースドフレイムアーマー", stat: "INT", skill: "ブラッドバーン：敵単体へINT70%炎ダメ、3ターン火傷(毎ターンINT50%ダメ)。", mp: 43 },
  { id: 51, kind: "防具", type: "メイン", attr: "雷", color: "赤", rank: "D", name: "ボルトガードジャケット", stat: "DEF", skill: "スタンアーマー：次の被攻撃時、攻撃者に雷INT130%反撃、1ターン麻痺(被ダメ+10%)。", mp: 22 },
  { id: 51, kind: "防具", type: "メイン", attr: "雷", color: "赤", rank: "C", name: "ボルトガードジャケット", stat: "DEF", skill: "スタンアーマー：次の被攻撃時、攻撃者に雷INT130%反撃、2ターン麻痺(被ダメ+20%)。", mp: 37 },
  { id: 52, kind: "防具", type: "メイン", attr: "雷", color: "黄", rank: "D", name: "エレキサーコート", stat: "INT", skill: "サンダーサージ：敵全体にINT40%雷ダメ。", mp: 27 },
  { id: 52, kind: "防具", type: "メイン", attr: "雷", color: "黄", rank: "C", name: "エレキサーコート", stat: "INT", skill: "サンダーサージ：敵全体にINT40%雷ダメ、命中-10%(2ターン)。", mp: 46 },
  { id: 53, kind: "防具", type: "メイン", attr: "雷", color: "緑", rank: "D", name: "イオンセラーレギンス", stat: "SPD", skill: "ライトヒール：自身のHPをINT80%回復、SPD+20%(1T)。", mp: 17 },
  { id: 53, kind: "防具", type: "メイン", attr: "雷", color: "緑", rank: "C", name: "イオンセラーレギンス", stat: "SPD", skill: "ライトヒール：自身のHPをINT80%回復、SPD+20%(2T)。", mp: 29 },
  { id: 54, kind: "防具", type: "メイン", attr: "雷", color: "青", rank: "D", name: "イオンブーストスーツ", stat: "SPD", skill: "スピードアンプ：自身のSPD+30%(3T)。効果中、STR+(SPDバフ/6)%。", mp: 23 },
  { id: 54, kind: "防具", type: "メイン", attr: "雷", color: "青", rank: "C", name: "イオンブーストスーツ", stat: "SPD", skill: "スピードアンプ：自身のSPD+30%(3T)。効果中、STR+(SPDバフ/2)%。", mp: 39 },
  { id: 55, kind: "防具", type: "メイン", attr: "雷", color: "紫", rank: "D", name: "ボルトヘックスジャケット", stat: "INT", skill: "ショックカース：敵単体に雷INT60%ダメ、2ターン麻痺(被ダメ+20%)。", mp: 23 },
  { id: 55, kind: "防具", type: "メイン", attr: "雷", color: "紫", rank: "C", name: "ボルトヘックスジャケット", stat: "INT", skill: "ショックカース：敵単体に雷INT60%ダメ、3ターン麻痺(被ダメ+40%)。", mp: 39 },
  { id: 56, kind: "防具", type: "メイン", attr: "氷", color: "赤", rank: "D", name: "フロストバリアプレート", stat: "DEF", skill: "コールドカウンター：1ターンの間、受ける氷ダメ50%カットし、氷INT50%反撃。", mp: 20 },
  { id: 56, kind: "防具", type: "メイン", attr: "氷", color: "赤", rank: "C", name: "フロストバリアプレート", stat: "DEF", skill: "コールドカウンター：1ターンの間、受ける氷ダメ50%カットし、氷INT120%反撃。", mp: 34 },
  { id: 57, kind: "防具", type: "メイン", attr: "氷", color: "黄", rank: "D", name: "スノウウィーバー", stat: "INT", skill: "アイスミスト：敵全体のSPD-30%(2ターン)。単体に氷INT20%ダメージ。", mp: 22 },
  { id: 57, kind: "防具", type: "メイン", attr: "氷", color: "黄", rank: "C", name: "スノウウィーバー", stat: "INT", skill: "アイスミスト：敵全体のSPD-30%(2ターン)。単体に氷INT50%ダメージ。", mp: 37 },
  { id: 58, kind: "防具", type: "メイン", attr: "氷", color: "緑", rank: "D", name: "クリスタルヒールベスト", stat: "HP", skill: "クールメディカ：自身のHPをINT100%+最大HP3%回復。", mp: 40 },
  { id: 58, kind: "防具", type: "メイン", attr: "氷", color: "緑", rank: "C", name: "クリスタルヒールベスト", stat: "HP", skill: "クールメディカ：自身のHPをINT100%+最大HP10%回復。", mp: 68 },
  { id: 59, kind: "防具", type: "メイン", attr: "氷", color: "青", rank: "D", name: "クラウドフリーズコート", stat: "MP", skill: "フロストチャージ：自身のMP30回復、与える氷ダメージ+15%(2T)。", mp: 12 },
  { id: 59, kind: "防具", type: "メイン", attr: "氷", color: "青", rank: "C", name: "クラウドフリーズコート", stat: "MP", skill: "フロストチャージ：自身のMP30回復、与える氷ダメージ+25%(3T)。", mp: 20 },
  { id: 60, kind: "防具", type: "メイン", attr: "氷", color: "紫", rank: "D", name: "フロストカースベスト", stat: "INT", skill: "コールドブレッシング：敵単体のSPD-20%(3T)、氷INT30%ダメ。", mp: 22 },
  { id: 60, kind: "防具", type: "メイン", attr: "氷", color: "紫", rank: "C", name: "フロストカースベスト", stat: "INT", skill: "コールドブレッシング：敵単体のSPD-20%(3T)、氷INT110%ダメ。", mp: 37 },
  { id: 61, kind: "防具", type: "サブ", attr: "物理", color: "赤", rank: "D", name: "タフネスガード", stat: "DEF", skill: "ハードスキン：被物理ダメージ-10%。自身にバフがある場合さらに-5%。" },
  { id: 61, kind: "防具", type: "サブ", attr: "物理", color: "赤", rank: "C", name: "タフネスガード", stat: "DEF", skill: "ハードスキン：被物理ダメージ-10%。自身にバフがある場合さらに-20%。" },
  { id: 62, kind: "防具", type: "サブ", attr: "物理", color: "黄", rank: "D", name: "ブレイクインパクトベスト", stat: "STR", skill: "スプレッドフォース：全体攻撃の威力+5%。物理ダメージを与えたとき、STR5%の物理追加ダメージを与える。" },
  { id: 62, kind: "防具", type: "サブ", attr: "物理", color: "黄", rank: "C", name: "ブレイクインパクトベスト", stat: "STR", skill: "スプレッドフォース：全体攻撃の威力+5%。物理ダメージを与えたとき、STR15%の物理追加ダメージを与える。" },
  { id: 63, kind: "防具", type: "サブ", attr: "物理", color: "緑", rank: "D", name: "ガードレンジャーギア", stat: "DEF", skill: "フォレストウォード：状態異常耐性+15%。DEFバフを受けるたび、効果時間をリセットし、STR+5%(2ターン,最大+25%)。" },
  { id: 63, kind: "防具", type: "サブ", attr: "物理", color: "緑", rank: "C", name: "ガードレンジャーギア", stat: "DEF", skill: "フォレストウォード：状態異常耐性+15%。DEFバフを受けるたび、効果時間をリセットし、STR+10%(3ターン,最大+50%)。" },
  { id: 64, kind: "防具", type: "サブ", attr: "物理", color: "青", rank: "D", name: "モーションアシストギア", stat: "SPD", skill: "アジリティフォーム：回避率+6%。行動順が最速のとき、与ダメージ+15%。" },
  { id: 64, kind: "防具", type: "サブ", attr: "物理", color: "青", rank: "C", name: "モーションアシストギア", stat: "SPD", skill: "アジリティフォーム：回避率+6%。行動順が最速のとき、与ダメージ+30%、被ダメージ-10%。" },
  { id: 65, kind: "防具", type: "サブ", attr: "物理", color: "紫", rank: "D", name: "ナイトメアチェスト", stat: "DEF", skill: "ドレインガード：被ダメの5%を吸収(無効化)してその分HP回復。出血状態の敵に与えたダメージの5%分HP回復。" },
  { id: 65, kind: "防具", type: "サブ", attr: "物理", color: "紫", rank: "C", name: "ナイトメアチェスト", stat: "DEF", skill: "ドレインガード：被ダメの5%を吸収(無効化)してその分HP回復。出血状態の敵に与えたダメージの20%分HP回復。" },
  { id: 66, kind: "防具", type: "サブ", attr: "炎", color: "赤", rank: "D", name: "フレイムウォーデン", stat: "DEF", skill: "バーンスルー：炎属性攻撃を受けた時、20%の確率で炎DEF50%反撃。受ける属性ダメージを軽減しているとき、40%の確率で反撃。" },
  { id: 66, kind: "防具", type: "サブ", attr: "炎", color: "赤", rank: "C", name: "フレイムウォーデン", stat: "DEF", skill: "バーンスルー：炎属性攻撃を受けた時、20%の確率で炎DEF50%反撃。受ける属性ダメージを軽減しているとき、100%の確率で反撃。" },
  { id: 67, kind: "防具", type: "サブ", attr: "炎", color: "黄", rank: "D", name: "マグマヴェール", stat: "INT", skill: "フレアブースト：炎属性スキルの威力+8%。全体攻撃の与えるダメージx1.05。" },
  { id: 67, kind: "防具", type: "サブ", attr: "炎", color: "黄", rank: "C", name: "マグマヴェール", stat: "INT", skill: "フレアブースト：炎属性スキルの威力+8%。全体攻撃の与えるダメージx1.2。" },
  { id: 68, kind: "防具", type: "サブ", attr: "炎", color: "緑", rank: "D", name: "ウォームナースプレート", stat: "HP", skill: "バリアサポート：受ける炎属性ダメージ-10%。炎属性状態異常耐性+20%。状態異常を回避したとき、HP1%回復。" },
  { id: 68, kind: "防具", type: "サブ", attr: "炎", color: "緑", rank: "C", name: "ウォームナースプレート", stat: "HP", skill: "バリアサポート：受ける炎属性ダメージ-10%。炎属性状態異常耐性+20%。状態異常を回避したとき、HP3%回復。" },
  { id: 69, kind: "防具", type: "サブ", attr: "炎", color: "青", rank: "D", name: "チャージローブ・フレア", stat: "MP", skill: "MPリゲイン：毎ターンMP3回復。MPを回復したとき、敵単体に炎属性INT(回復したMP/3)%ダメージを与える。" },
  { id: 69, kind: "防具", type: "サブ", attr: "炎", color: "青", rank: "C", name: "チャージローブ・フレア", stat: "MP", skill: "MPリゲイン：毎ターンMP3回復。MPを回復したとき、敵単体に炎属性INT(回復したMP)%ダメージを与える。" },
  { id: 70, kind: "防具", type: "サブ", attr: "炎", color: "紫", rank: "D", name: "カースドフレイムクローク", stat: "INT", skill: "バーンカース：攻撃命中時、10%の確率で3ターン火傷(毎ターンINT10%ダメ)付与。毎ターン敵全体に炎属性INT(火傷状態の敵の数*3)%ダメージを与える。" },
  { id: 70, kind: "防具", type: "サブ", attr: "炎", color: "紫", rank: "C", name: "カースドフレイムクローク", stat: "INT", skill: "バーンカース：攻撃命中時、10%の確率で3ターン火傷(毎ターンINT10%ダメ)付与。毎ターン敵全体に炎属性INT(火傷状態の敵の数*10)%ダメージを与える。" },
  { id: 71, kind: "防具", type: "サブ", attr: "雷", color: "赤", rank: "D", name: "ボルトカラペイス", stat: "DEF", skill: "ショックアーマー：雷属性ダメージ-12%。麻痺状態の敵からのダメージ-5%。" },
  { id: 71, kind: "防具", type: "サブ", attr: "雷", color: "赤", rank: "C", name: "ボルトカラペイス", stat: "DEF", skill: "ショックアーマー：雷属性ダメージ-12%。麻痺状態の敵からのダメージ-20%。" },
  { id: 72, kind: "防具", type: "サブ", attr: "雷", color: "黄", rank: "D", name: "エレキミスティック", stat: "INT", skill: "ライトチャージ：雷属性スキルの威力+10%。" },
  { id: 72, kind: "防具", type: "サブ", attr: "雷", color: "黄", rank: "C", name: "エレキミスティック", stat: "INT", skill: "ライトチャージ：雷属性スキルの威力+10%。敵から受けるダメージを、その敵の(命中率)%にする。" },
  { id: 73, kind: "防具", type: "サブ", attr: "雷", color: "緑", rank: "D", name: "イオンレメディジャケット", stat: "SPD", skill: "クリーンフィールド：自分へのデバフの効果時間-1ターン(最低1ターン)。自分よりSPDが低い敵から受ける属性ダメージ-10%。" },
  { id: 73, kind: "防具", type: "サブ", attr: "雷", color: "緑", rank: "C", name: "イオンレメディジャケット", stat: "SPD", skill: "クリーンフィールド：自分へのデバフの効果時間-1ターン(最低1ターン)。自分よりSPDが低い敵から受ける属性ダメージ-30%。" },
  { id: 74, kind: "防具", type: "サブ", attr: "雷", color: "青", rank: "D", name: "イオンブーストガード", stat: "SPD", skill: "スピードリズム：MP消費後、SPD+2%(最大20%)。SPDバフがあるとき、左記の効果1.5倍。" },
  { id: 74, kind: "防具", type: "サブ", attr: "雷", color: "青", rank: "C", name: "イオンブーストガード", stat: "SPD", skill: "スピードリズム：MP消費後、SPD+2%(最大20%)。SPDバフがあるとき、左記の効果2倍、消費MP-10%。" },
  { id: 75, kind: "防具", type: "サブ", attr: "雷", color: "紫", rank: "D", name: "ボルトヘックスコート", stat: "INT", skill: "ショックハザード：攻撃を受けた時20%の確率で敵SPD-10%(2T)。その敵が麻痺状態ならさらにSPD-5%。" },
  { id: 75, kind: "防具", type: "サブ", attr: "雷", color: "紫", rank: "C", name: "ボルトヘックスコート", stat: "INT", skill: "ショックハザード：攻撃を受けた時20%の確率で敵SPD-10%(2T)。その敵が麻痺状態ならさらにSPD-20%。" },
  { id: 76, kind: "防具", type: "サブ", attr: "氷", color: "赤", rank: "D", name: "フロストレガシー", stat: "DEF", skill: "クールガード：氷属性ダメージ-12%。反撃ダメージx1.2。" },
  { id: 76, kind: "防具", type: "サブ", attr: "氷", color: "赤", rank: "C", name: "フロストレガシー", stat: "DEF", skill: "クールガード：氷属性ダメージ-12%。反撃ダメージx1.5。" },
  { id: 77, kind: "防具", type: "サブ", attr: "氷", color: "黄", rank: "D", name: "スノウセージコート", stat: "INT", skill: "フロストエコー：氷属性スキル使用後、INT5%上昇(2T)。自身よりSPDが低い敵に攻撃するとき、5%の確率で2回行動できる。" },
  { id: 77, kind: "防具", type: "サブ", attr: "氷", color: "黄", rank: "C", name: "スノウセージコート", stat: "INT", skill: "フロストエコー：氷属性スキル使用後、INT5%上昇(2T)。自身よりSPDが低い敵に攻撃するとき、20%の確率で2回行動できる。" },
  { id: 78, kind: "防具", type: "サブ", attr: "氷", color: "緑", rank: "D", name: "フロストメディックローブ", stat: "HP", skill: "ヒールアップ：回復量+10%。攻撃時最大HP0.5%の追加ダメージを与える代わりに、現在HPの0.5%を失う。" },
  { id: 78, kind: "防具", type: "サブ", attr: "氷", color: "緑", rank: "C", name: "フロストメディックローブ", stat: "HP", skill: "ヒールアップ：回復量+10%。攻撃時最大HP2%の追加ダメージを与える代わりに、現在HPの2%を失う。" },
  { id: 79, kind: "防具", type: "サブ", attr: "氷", color: "青", rank: "D", name: "クラウドチャージケープ", stat: "MP", skill: "マジックコート：被魔法ダメージ-10%。属性ダメージバフがある状態で属性ダメージを与えたとき、MP3回復。" },
  { id: 79, kind: "防具", type: "サブ", attr: "氷", color: "青", rank: "C", name: "クラウドチャージケープ", stat: "MP", skill: "マジックコート：被魔法ダメージ-10%。属性ダメージバフがある状態で属性ダメージを与えたとき、MP10回復。" },
  { id: 80, kind: "防具", type: "サブ", attr: "氷", color: "紫", rank: "D", name: "フロストカースローブ", stat: "INT", skill: "スロウタッチ：攻撃命中時、2ターン凍結(与ダメージ-10%) or 2ターンSPD-10%付与。" },
  { id: 80, kind: "防具", type: "サブ", attr: "氷", color: "紫", rank: "C", name: "フロストカースローブ", stat: "INT", skill: "スロウタッチ：攻撃命中時、2ターン凍結(与ダメージ-10%) or 2ターンSPD-10%付与。SPDが自分より低い敵に与えるデバフのターン数1増加。" },
  { id: 81, kind: "アクセサリ", type: "メイン", attr: "物理", color: "赤", rank: "D", name: "剛力のブレス", stat: "STR", skill: "パワーサージ：自身のSTRを3ターンの間30%アップ、追加攻撃ダメージ+20%。", mp: 15 },
  { id: 81, kind: "アクセサリ", type: "メイン", attr: "物理", color: "赤", rank: "C", name: "剛力のブレス", stat: "STR", skill: "パワーサージ：自身のSTRを3ターンの間30%アップ、追加攻撃ダメージ+50%。", mp: 26 },
  { id: 82, kind: "アクセサリ", type: "メイン", attr: "物理", color: "黄", rank: "D", name: "旋風の羽飾り", stat: "STR", skill: "ゲイルスラッシュ：敵全体にSTR60%の物理ダメ", mp: 30 },
  { id: 82, kind: "アクセサリ", type: "メイン", attr: "物理", color: "黄", rank: "C", name: "旋風の羽飾り", stat: "STR", skill: "ゲイルスラッシュ：敵全体にSTR40%の物理ダメx2。", mp: 51 },
  { id: 83, kind: "アクセサリ", type: "メイン", attr: "物理", color: "緑", rank: "D", name: "護心のルーン石", stat: "HP", skill: "リジェネハート：3ターンHP継続回復(最大HP2%/ターン)、連続で回復するたびに回復効果+2%(最大20%)、回復しないターンがあるとこの効果を失う", mp: 12 },
  { id: 83, kind: "アクセサリ", type: "メイン", attr: "物理", color: "緑", rank: "C", name: "護心のルーン石", stat: "HP", skill: "リジェネハート：3ターンHP継続回復(最大HP2%/ターン)、連続で回復するたびに回復効果+5%(最大60%)、回復しないターンがあるとこの効果を失う", mp: 20 },
  { id: 84, kind: "アクセサリ", type: "メイン", attr: "物理", color: "青", rank: "D", name: "疾風のアンクレット", stat: "SPD", skill: "クイックステップ：次のターン最速で行動、与ダメージ+30%、消費MP+20%。", mp: 14 },
  { id: 84, kind: "アクセサリ", type: "メイン", attr: "物理", color: "青", rank: "C", name: "疾風のアンクレット", stat: "SPD", skill: "クイックステップ：次のターン最速で行動、与ダメージ+100%、消費MP+50%。", mp: 24 },
  { id: 85, kind: "アクセサリ", type: "メイン", attr: "物理", color: "紫", rank: "D", name: "闇裂の指輪", stat: "STR", skill: "シャドウエッジ：敵単体にSTR120%の物理+暗闇(与ダメ-5%)を2ターン付与", mp: 15 },
  { id: 85, kind: "アクセサリ", type: "メイン", attr: "物理", color: "紫", rank: "C", name: "闇裂の指輪", stat: "STR", skill: "シャドウエッジ：敵単体にSTR120%の物理+暗闇(与ダメ-20%)を2ターン付与", mp: 26 },
  { id: 86, kind: "アクセサリ", type: "メイン", attr: "炎", color: "赤", rank: "D", name: "焔紋ペンダント", stat: "INT", skill: "フレアバースト：敵単体にINT140%の炎属性ダメージ、次のターン炎属性ダメージを与えるスキルのMP消費-10%。", mp: 18 },
  { id: 86, kind: "アクセサリ", type: "メイン", attr: "炎", color: "赤", rank: "C", name: "焔紋ペンダント", stat: "INT", skill: "フレアバースト：敵単体にINT140%の炎属性ダメージ、次のターン炎属性ダメージを与えるスキルのMP消費-30%。", mp: 31 },
  { id: 87, kind: "アクセサリ", type: "メイン", attr: "炎", color: "黄", rank: "D", name: "陽炎の耳飾り", stat: "INT", skill: "ブレイズウェーブ：敵全体にINT40%の炎属性ダメージ。5%の確率で2ターン火傷(毎ターンINT20%ダメ)。", mp: 25 },
  { id: 87, kind: "アクセサリ", type: "メイン", attr: "炎", color: "黄", rank: "C", name: "陽炎の耳飾り", stat: "INT", skill: "ブレイズウェーブ：敵全体にINT40%の炎属性ダメージ。20%の確率で2ターン火傷(毎ターンINT20%ダメ)。", mp: 43 },
  { id: 88, kind: "アクセサリ", type: "メイン", attr: "炎", color: "緑", rank: "D", name: "温炎の守符", stat: "HP", skill: "ヒートリカバー：HPを最大HPの5%即時回復", mp: 15 },
  { id: 88, kind: "アクセサリ", type: "メイン", attr: "炎", color: "緑", rank: "C", name: "温炎の守符", stat: "HP", skill: "ヒートリカバー：HPを最大HPの5%即時回復&状態異常1つ解除", mp: 26 },
  { id: 89, kind: "アクセサリ", type: "メイン", attr: "炎", color: "青", rank: "D", name: "サラマンダーオーブ", stat: "MP", skill: "炎精の加護：5ターンMP回復量+30%。効果中、MP回復した次のターンのINT+10%。", mp: 12 },
  { id: 89, kind: "アクセサリ", type: "メイン", attr: "炎", color: "青", rank: "C", name: "サラマンダーオーブ", stat: "MP", skill: "炎精の加護：5ターンMP回復量+30%。効果中、MP回復した次のターンのINT+30%。", mp: 20 },
  { id: 90, kind: "アクセサリ", type: "メイン", attr: "炎", color: "紫", rank: "D", name: "焦熱の輪", stat: "INT", skill: "バーニングカース：敵単体に｢炎呪(受ける炎ダメージ+50%、炎ダメージを与えた時自身に10%の反動ダメージ、効果発動時消滅)｣を3ターン付与。", mp: 15 },
  { id: 90, kind: "アクセサリ", type: "メイン", attr: "炎", color: "紫", rank: "C", name: "焦熱の輪", stat: "INT", skill: "バーニングカース：敵単体に｢炎呪(受ける炎ダメージ+50%、炎ダメージを与えた時自身に30%の反動ダメージ、効果発動時消滅)｣を3ターン付与。", mp: 26 },
  { id: 91, kind: "アクセサリ", type: "メイン", attr: "雷", color: "赤", rank: "D", name: "雷牙の指輪", stat: "STR", skill: "サンダースマッシュ：敵単体にSTR140%雷ダメ。2ターンの間全体攻撃ダメージ+10%。", mp: 18 },
  { id: 91, kind: "アクセサリ", type: "メイン", attr: "雷", color: "赤", rank: "C", name: "雷牙の指輪", stat: "STR", skill: "サンダースマッシュ：敵単体にSTR140%雷ダメ。2ターンの間全体攻撃ダメージ+30%。", mp: 31 },
  { id: 92, kind: "アクセサリ", type: "メイン", attr: "雷", color: "黄", rank: "D", name: "雷紋のバングル", stat: "INT", skill: "ライトニングシャワー：敵全体にINT35%の雷属性ダメージ、5%の確率で2ターン麻痺(被ダメ+40%)", mp: 22 },
  { id: 92, kind: "アクセサリ", type: "メイン", attr: "雷", color: "黄", rank: "C", name: "雷紋のバングル", stat: "INT", skill: "ライトニングシャワー：敵全体にINT35%の雷属性ダメージ、20%の確率で2ターン麻痺(被ダメ+40%)", mp: 37 },
  { id: 93, kind: "アクセサリ", type: "メイン", attr: "雷", color: "緑", rank: "D", name: "放電の護符", stat: "DEF", skill: "サンダーガード：自身の雷属性状態異常耐性+60%(2ターン)。効果中にHPを回復した時、回復した分のHPの雷属性ダメージ/10を敵全体に与える。", mp: 18 },
  { id: 93, kind: "アクセサリ", type: "メイン", attr: "雷", color: "緑", rank: "C", name: "放電の護符", stat: "DEF", skill: "サンダーガード：自身の雷属性状態異常耐性+60%(2ターン)。効果中にHPを回復した時、回復した分のHPの雷属性ダメージ/3を敵全体に与える。", mp: 31 },
  { id: 94, kind: "アクセサリ", type: "メイン", attr: "雷", color: "青", rank: "D", name: "迅雷のピアス", stat: "SPD", skill: "スパークブースト：自身のSPDを40%アップ(2ターン)。敵全体に雷SPD10%ダメージ。", mp: 14 },
  { id: 94, kind: "アクセサリ", type: "メイン", attr: "雷", color: "青", rank: "C", name: "迅雷のピアス", stat: "SPD", skill: "スパークブースト：自身のSPDを40%アップ(2ターン)。敵全体に雷SPD40%ダメージ。", mp: 24 },
  { id: 95, kind: "アクセサリ", type: "メイン", attr: "雷", color: "紫", rank: "D", name: "帯電の指輪", stat: "INT", skill: "ショックバイト：敵単体にINT120%雷ダメ、麻痺を3ターン付与(被ダメ+10%)", mp: 18 },
  { id: 95, kind: "アクセサリ", type: "メイン", attr: "雷", color: "紫", rank: "C", name: "帯電の指輪", stat: "INT", skill: "ショックバイト：敵単体にINT120%雷ダメ、麻痺を3ターン付与(被ダメ+30%)", mp: 31 },
  { id: 96, kind: "アクセサリ", type: "メイン", attr: "氷", color: "赤", rank: "D", name: "氷牙のチョーカー", stat: "STR", skill: "フロストバイト：敵単体にSTR130%の氷属性ダメージ。", mp: 18 },
  { id: 96, kind: "アクセサリ", type: "メイン", attr: "氷", color: "赤", rank: "C", name: "氷牙のチョーカー", stat: "STR", skill: "フロストバイト：敵単体にSTR130%の氷属性ダメージ。2ターンの間通常攻撃が氷属性になり、MP回復量-5%。", mp: 31 },
  { id: 97, kind: "アクセサリ", type: "メイン", attr: "氷", color: "黄", rank: "D", name: "氷嵐の耳飾り", stat: "INT", skill: "ブリザードパルス：敵全体にINT75%氷ダメ。消費MP+25%、MP回復効率+25%(2ターン)。", mp: 36 },
  { id: 97, kind: "アクセサリ", type: "メイン", attr: "氷", color: "黄", rank: "C", name: "氷嵐の耳飾り", stat: "INT", skill: "ブリザードパルス：敵全体にINT75%氷ダメ。消費MP+50%、MP回復効率+50%(3ターン)。", mp: 61 },
  { id: 98, kind: "アクセサリ", type: "メイン", attr: "氷", color: "緑", rank: "D", name: "雪精の護符", stat: "DEF", skill: "フロストシェル：自身に3ターン被ダメ-25%のバリア。効果中に状態異常を解除もしくはブロックした時、敵全体にDEF20%ダメージ。", mp: 16 },
  { id: 98, kind: "アクセサリ", type: "メイン", attr: "氷", color: "緑", rank: "C", name: "雪精の護符", stat: "DEF", skill: "フロストシェル：自身に3ターン被ダメ-25%のバリア。効果中に状態異常を解除もしくはブロックした時、敵全体にDEF50%ダメージ。", mp: 27 },
  { id: 99, kind: "アクセサリ", type: "メイン", attr: "氷", color: "青", rank: "D", name: "氷晶の首飾り", stat: "MP", skill: "コールドチャージ：次の魔法ダメ+30%", mp: 10 },
  { id: 99, kind: "アクセサリ", type: "メイン", attr: "氷", color: "青", rank: "C", name: "氷晶の首飾り", stat: "MP", skill: "コールドチャージ：MP30回復、次の魔法ダメ+30%", mp: 17 },
  { id: 100, kind: "アクセサリ", type: "メイン", attr: "氷", color: "紫", rank: "D", name: "氷縛のリング", stat: "INT", skill: "アイスロック：敵単体に1ターン凍結(与ダメ-50%)", mp: 15 },
  { id: 100, kind: "アクセサリ", type: "メイン", attr: "氷", color: "紫", rank: "C", name: "氷縛のリング", stat: "INT", skill: "アイスロック：敵単体に1ターン凍結(与ダメ-50%)、INT50%氷ダメ", mp: 26 },
  { id: 101, kind: "アクセサリ", type: "サブ", attr: "物理", color: "赤", rank: "D", name: "剛拳のリング", stat: "STR", skill: "パワーアップ：STR+10%。現在受けているSTRバフの%の確率で物理STR30%の追加攻撃" },
  { id: 101, kind: "アクセサリ", type: "サブ", attr: "物理", color: "赤", rank: "C", name: "剛拳のリング", stat: "STR", skill: "パワーアップ：STR+10%。現在受けているSTRバフの%の確率で物理STR100%の追加攻撃" },
  { id: 102, kind: "アクセサリ", type: "サブ", attr: "物理", color: "黄", rank: "D", name: "旋風の飾帯", stat: "STR", skill: "全体攻撃強化：全体攻撃の与ダメ+8%、物理ダメージを与えるたびにこの効果が+0.5%(最大+20%)" },
  { id: 102, kind: "アクセサリ", type: "サブ", attr: "物理", color: "黄", rank: "C", name: "旋風の飾帯", stat: "STR", skill: "全体攻撃強化：全体攻撃の与ダメ+8%、物理ダメージを与えるたびにこの効果が+2%(最大+50%)" },
  { id: 103, kind: "アクセサリ", type: "サブ", attr: "物理", color: "緑", rank: "D", name: "癒心のブレスレット", stat: "HP", skill: "HP回復量アップ：回復効果+10%。HPが回復したとき、次のターンの与ダメージ+(回復割合x2)。" },
  { id: 103, kind: "アクセサリ", type: "サブ", attr: "物理", color: "緑", rank: "C", name: "癒心のブレスレット", stat: "HP", skill: "HP回復量アップ：回復効果+10%。HPが回復したとき、次のターンの与ダメージ+(回復割合x5)。" },
  { id: 104, kind: "アクセサリ", type: "サブ", attr: "物理", color: "青", rank: "D", name: "迅脚のアンクルリング", stat: "SPD", skill: "先制確率アップ：戦闘開始時、20%で行動順が8ターンの間最優先になる。行動順が最速のとき毎ターンMP回復5%。" },
  { id: 104, kind: "アクセサリ", type: "サブ", attr: "物理", color: "青", rank: "C", name: "迅脚のアンクルリング", stat: "SPD", skill: "先制確率アップ：戦闘開始時、20%で行動順が8ターンの間最優先になる。行動順が最速のとき毎ターンMP回復20%。" },
  { id: 105, kind: "アクセサリ", type: "サブ", attr: "物理", color: "紫", rank: "D", name: "影刃のピアス", stat: "STR", skill: "クリティカル率アップ：クリ率+5%、与ダメダウン中の敵に対するクリダメ+30%" },
  { id: 105, kind: "アクセサリ", type: "サブ", attr: "物理", color: "紫", rank: "C", name: "影刃のピアス", stat: "STR", skill: "クリティカル率アップ：クリ率+5%、与ダメダウン中の敵に対するクリダメ+100%" },
  { id: 106, kind: "アクセサリ", type: "サブ", attr: "炎", color: "赤", rank: "D", name: "火精のリング", stat: "INT", skill: "炎属性強化：炎ダメ+10%、炎属性スキル発動時この効果が3ターン+3%、重ねがけ可。" },
  { id: 106, kind: "アクセサリ", type: "サブ", attr: "炎", color: "赤", rank: "C", name: "火精のリング", stat: "INT", skill: "炎属性強化：炎ダメ+10%、炎属性スキル発動時この効果が3ターン+10%、重ねがけ可。" },
  { id: 107, kind: "アクセサリ", type: "サブ", attr: "炎", color: "黄", rank: "D", name: "陽炎の腕輪", stat: "INT", skill: "火術拡散：全体攻撃の与ダメ+5%。火傷は毎ターン隣の敵に拡散する" },
  { id: 107, kind: "アクセサリ", type: "サブ", attr: "炎", color: "黄", rank: "C", name: "陽炎の腕輪", stat: "INT", skill: "火術拡散：全体攻撃の与ダメ+15%。火傷は毎ターン隣の敵に拡散する" },
  { id: 108, kind: "アクセサリ", type: "サブ", attr: "炎", color: "緑", rank: "D", name: "微熱の護符", stat: "HP", skill: "状態異常耐性アップ：全状態異常耐性+10%。状態異常を解除もしくはブロックしたとき、3ターン与ダメージ+10%。" },
  { id: 108, kind: "アクセサリ", type: "サブ", attr: "炎", color: "緑", rank: "C", name: "微熱の護符", stat: "HP", skill: "状態異常耐性アップ：全状態異常耐性+10%。状態異常を解除もしくはブロックしたとき、3ターン与ダメージ+30%。" },
  { id: 109, kind: "アクセサリ", type: "サブ", attr: "炎", color: "青", rank: "D", name: "熾火のオーブ", stat: "MP", skill: "MPリジェネ：毎ターンMP3回復。MP消費時10%の確率でMPがMP回復量だけ回復" },
  { id: 109, kind: "アクセサリ", type: "サブ", attr: "炎", color: "青", rank: "C", name: "熾火のオーブ", stat: "MP", skill: "MPリジェネ：毎ターンMP3回復。MP消費時40%の確率でMPがMP回復量だけ回復" },
  { id: 110, kind: "アクセサリ", type: "サブ", attr: "炎", color: "紫", rank: "D", name: "焦熱の耳飾り", stat: "INT", skill: "炎耐性低下付与：炎攻撃時、受ける炎ダメージ+3%を2ターン付与。炎属性デバフの解除を妨害。" },
  { id: 110, kind: "アクセサリ", type: "サブ", attr: "炎", color: "紫", rank: "C", name: "焦熱の耳飾り", stat: "INT", skill: "炎耐性低下付与：炎攻撃時、受ける炎ダメージ+10%を2ターン付与。炎属性デバフの解除を妨害。" },
  { id: 111, kind: "アクセサリ", type: "サブ", attr: "雷", color: "赤", rank: "D", name: "雷刃のリング", stat: "STR", skill: "雷属性攻撃強化：与える雷ダメと物理ダメ+10%。雷ダメージを与えたとき、3%の確率で同じダメージの全体攻撃に変化。" },
  { id: 111, kind: "アクセサリ", type: "サブ", attr: "雷", color: "赤", rank: "C", name: "雷刃のリング", stat: "STR", skill: "雷属性攻撃強化：与える雷ダメと物理ダメ+10%。雷ダメージを与えたとき、10%の確率で同じダメージの全体攻撃に変化。" },
  { id: 112, kind: "アクセサリ", type: "サブ", attr: "雷", color: "黄", rank: "D", name: "閃光の耳飾り", stat: "INT", skill: "雷範囲強化：雷全体魔法の威力+8%、麻痺中の敵に対しては+18%。" },
  { id: 112, kind: "アクセサリ", type: "サブ", attr: "雷", color: "黄", rank: "C", name: "閃光の耳飾り", stat: "INT", skill: "雷範囲強化：雷全体魔法の威力+8%、麻痺中の敵に対しては+48%。" },
  { id: 113, kind: "アクセサリ", type: "サブ", attr: "雷", color: "緑", rank: "D", name: "帯電の守符", stat: "DEF", skill: "雷耐性アップ：雷属性状態異常耐性+20%。雷デバフを無効化したときHP5%回復。" },
  { id: 113, kind: "アクセサリ", type: "サブ", attr: "雷", color: "緑", rank: "C", name: "帯電の守符", stat: "DEF", skill: "雷耐性アップ：雷属性状態異常耐性+20%。雷デバフを無効化したときHP15%回復。" },
  { id: 114, kind: "アクセサリ", type: "サブ", attr: "雷", color: "青", rank: "D", name: "電迅のアンクレット", stat: "SPD", skill: "行動速度アップ：行動順補正+10%。行動順が最速のときSPD+15%。" },
  { id: 114, kind: "アクセサリ", type: "サブ", attr: "雷", color: "青", rank: "C", name: "電迅のアンクレット", stat: "SPD", skill: "行動速度アップ：行動順補正+10%。行動順が最速のときSPD+50%。" },
  { id: 115, kind: "アクセサリ", type: "サブ", attr: "雷", color: "紫", rank: "D", name: "痺れ紋ペンダント", stat: "INT", skill: "麻痺付与率アップ：雷攻撃の麻痺(被ダメ+30%,3ターン)付与率+8%。麻痺を付与したとき15%の確率で隣の敵に拡散、連鎖する。" },
  { id: 115, kind: "アクセサリ", type: "サブ", attr: "雷", color: "紫", rank: "C", name: "痺れ紋ペンダント", stat: "INT", skill: "麻痺付与率アップ：雷攻撃の麻痺(被ダメ+30%,3ターン)付与率+8%。麻痺を付与したとき50%の確率で隣の敵に拡散、連鎖する。" },
  { id: 116, kind: "アクセサリ", type: "サブ", attr: "氷", color: "赤", rank: "D", name: "氷牙の指飾り", stat: "STR", skill: "氷属性物理強化：与える氷ダメと物理ダメ+10%。氷ダメージを与えるたび与える氷ダメ+5%(最大20%)、氷ダメージ以外を与えるとリセット" },
  { id: 116, kind: "アクセサリ", type: "サブ", attr: "氷", color: "赤", rank: "C", name: "氷牙の指飾り", stat: "STR", skill: "氷属性物理強化：与える氷ダメと物理ダメ+10%。氷ダメージを与えるたび与える氷ダメ+15%(最大60%)、氷ダメージ以外を与えるとリセット" },
  { id: 117, kind: "アクセサリ", type: "サブ", attr: "氷", color: "黄", rank: "D", name: "氷嵐のタリスマン", stat: "INT", skill: "氷魔法範囲強化：氷全体魔法の威力+8%、消費したMP割合/3に応じてこの効果が追加で上昇。" },
  { id: 117, kind: "アクセサリ", type: "サブ", attr: "氷", color: "黄", rank: "C", name: "氷嵐のタリスマン", stat: "INT", skill: "氷魔法範囲強化：氷全体魔法の威力+8%、消費したMP割合に応じてこの効果が追加で上昇。" },
  { id: 118, kind: "アクセサリ", type: "サブ", attr: "氷", color: "緑", rank: "D", name: "雪華のお守り", stat: "DEF", skill: "氷耐性アップ：氷属性状態異常耐性+20%、被ダメ軽減中さらに+10%。" },
  { id: 118, kind: "アクセサリ", type: "サブ", attr: "氷", color: "緑", rank: "C", name: "雪華のお守り", stat: "DEF", skill: "氷耐性アップ：氷属性状態異常耐性+20%、被ダメ軽減中さらに+30%。" },
  { id: 119, kind: "アクセサリ", type: "サブ", attr: "氷", color: "青", rank: "D", name: "氷速のペンダント", stat: "SPD", skill: "低温加速：氷属性装備の数だけSPD+8%。MP回復時自身のSTR-5%(3ターン)、INT-3%(2ターン)、SPD+10%(2ターン)" },
  { id: 119, kind: "アクセサリ", type: "サブ", attr: "氷", color: "青", rank: "C", name: "氷速のペンダント", stat: "SPD", skill: "低温加速：氷属性装備の数だけSPD+8%。MP回復時自身のSTR-15%(3ターン)、INT-10%(2ターン)、SPD+30%(2ターン)" },
  { id: 120, kind: "アクセサリ", type: "サブ", attr: "氷", color: "紫", rank: "D", name: "氷縛のミサンガ", stat: "INT", skill: "凍結付与率アップ：氷攻撃の凍結(与ダメージ-50%,3ターン)付与率+6%。凍結状態の敵に攻撃すると30%の確率で「氷結(行動不能)」状態に変化。" },
  { id: 120, kind: "アクセサリ", type: "サブ", attr: "氷", color: "紫", rank: "C", name: "氷縛のミサンガ", stat: "INT", skill: "凍結付与率アップ：氷攻撃の凍結(与ダメージ-50%,3ターン)付与率+6%。凍結状態の敵に攻撃すると「氷結(行動不能)」状態に変化。" },
];

const STORAGE_KEY = "studyRpgStateV3";

const PLAYER_STATUS_BASE = {
  HP: { base: 200, growth: 18 },
  MP: { base: 50, growth: 0.5 },
  STR: { base: 10, growth: 0.9 },
  INT: { base: 10, growth: 0.9 },
  DEF: { base: 10, growth: 0.9 },
  SPD: { base: 10, growth: 0.9 },
};

const EQUIPMENT_STATUS_BASE = {
  HP: { base: 100, growth: 9 },
  MP: { base: 25, growth: 0.25 },
  STR: { base: 5, growth: 0.45 },
  INT: { base: 5, growth: 0.45 },
  DEF: { base: 5, growth: 0.45 },
  SPD: { base: 5, growth: 0.45 },
};

const EQUIP_SLOT_KEYS = [
  "武器-メイン",
  "武器-サブ",
  "防具-メイン",
  "防具-サブ",
  "アクセサリ-メイン",
  "アクセサリ-サブ",
];

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
  player: {
    level: 1,
    breakthrough: 0,
    points: 0,
    allocated: { HP: 0, MP: 0, STR: 0, INT: 0, DEF: 0, SPD: 0 },
  },
  equippedSlots: {},
};
defaultState.materials["エネルギー"] = 1800;

const state = loadState();
normalizeState();

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
const enhanceStats = document.getElementById("playerEnhanceStats");
const enhancePointSummary = document.getElementById("enhancePointSummary");
const levelUpPlayerButton = document.getElementById("levelUpPlayer");
const breakthroughPlayerButton = document.getElementById("breakthroughPlayer");
const pointControls = document.getElementById("pointControls");
const playerEnhanceCost = document.getElementById("playerEnhanceCost");
const enhanceEquipmentSelect = document.getElementById("enhanceEquipmentSelect");
const equipToSlotButton = document.getElementById("equipToSlot");
const levelUpEquipmentButton = document.getElementById("levelUpEquipment");
const equipmentEnhanceCost = document.getElementById("equipmentEnhanceCost");
const equipSlots = document.getElementById("equipSlots");

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

function normalizeState() {
  state.player = state.player || structuredClone(defaultState.player);
  state.player.allocated = { ...structuredClone(defaultState.player.allocated), ...(state.player.allocated || {}) };
  state.equippedSlots = { ...Object.fromEntries(EQUIP_SLOT_KEYS.map((k) => [k, null])), ...(state.equippedSlots || {}) };
  state.equipment = (state.equipment || []).map((equip) => ({ level: 1, breakthrough: 0, ...equip }));
}

function calcValue(base, growth, level, breakthrough, pointLv = 0) {
  return (base + (level - 1) * growth) * (1 + (level - 1) / 100) * (1.1 ** breakthrough) * (1 + pointLv / 10);
}

function getPlayerStats() {
  const p = state.player;
  const stats = {};
  Object.entries(PLAYER_STATUS_BASE).forEach(([key, cfg]) => {
    stats[key] = calcValue(cfg.base, cfg.growth, p.level, p.breakthrough, p.allocated[key] || 0);
  });
  return stats;
}

function getEquipmentMainStatValue(equip) {
  const stat = EQUIPMENT_STATUS_BASE[equip.stat] || EQUIPMENT_STATUS_BASE.STR;
  return calcValue(stat.base, stat.growth, equip.level || 1, equip.breakthrough || 0, 0);
}

function getPlayerPowerFromBuild() {
  const playerStats = getPlayerStats();
  const equipBonus = { HP: 0, MP: 0, STR: 0, INT: 0, DEF: 0, SPD: 0 };
  Object.values(state.equippedSlots || {}).forEach((eq) => {
    if (!eq?.stat) return;
    equipBonus[eq.stat] += getEquipmentMainStatValue(eq);
  });
  const total = {
    HP: playerStats.HP + equipBonus.HP,
    MP: playerStats.MP + equipBonus.MP,
    STR: playerStats.STR + equipBonus.STR,
    INT: playerStats.INT + equipBonus.INT,
    DEF: playerStats.DEF + equipBonus.DEF,
    SPD: playerStats.SPD + equipBonus.SPD,
  };
  return Math.round(total.HP / 10 + total.MP * 2 + total.STR * 8 + total.INT * 8 + total.DEF * 6 + total.SPD * 6);
}

function getNextLevelCost() {
  const lv = state.player.level;
  return {
    chip: Math.ceil((100 + (lv - 1) * 25) * (1 + (lv - 1) / 100)),
    gold: Math.ceil((2000 + (lv - 1) * 500) * (1 + (lv - 1) / 100)),
  };
}

function getBreakthroughCost() {
  const b = state.player.breakthrough;
  const stepLv = b * 10;
  return {
    chipA: Math.ceil((100 + stepLv * 25) * (1 + stepLv / 100)),
    chipB: Math.ceil((100 + stepLv * 25) * (1 + stepLv / 100)),
    gold: Math.ceil((20000 + stepLv * 5000) * (1 + stepLv / 100)),
  };
}

function levelUpPlayer() {
  if (state.player.level % 10 === 0) {
    alert("10レベルごとに突破が必要です。");
    return;
  }
  const cost = getNextLevelCost();
  if (state.materials["経験チップ"] < cost.chip || state.materials["ゴールド"] < cost.gold) {
    alert("素材が不足しています。");
    return;
  }
  state.materials["経験チップ"] -= cost.chip;
  state.materials["ゴールド"] -= cost.gold;
  state.player.level += 1;
  updateUI();
}

function breakthroughPlayer() {
  if (state.player.level < (state.player.breakthrough + 1) * 10) {
    alert("突破には規定レベルが必要です。");
    return;
  }
  const cost = getBreakthroughCost();
  if (state.materials["突破チップα"] < cost.chipA || state.materials["突破チップβ"] < cost.chipB || state.materials["ゴールド"] < cost.gold) {
    alert("突破素材が不足しています。");
    return;
  }
  state.materials["突破チップα"] -= cost.chipA;
  state.materials["突破チップβ"] -= cost.chipB;
  state.materials["ゴールド"] -= cost.gold;
  state.player.breakthrough += 1;
  state.player.points += state.player.breakthrough * 6;
  updateUI();
}

function addPointToStat(stat) {
  const current = state.player.allocated[stat] || 0;
  const need = current + 1;
  if (state.player.points < need) {
    alert("ポイント不足です。");
    return;
  }
  state.player.points -= need;
  state.player.allocated[stat] = current + 1;
  updateUI();
}

function getEquipmentLevelUpCost(equip) {
  const lv = equip.level || 1;
  return {
    chip: Math.ceil((10 + (lv - 1) * 2.5) * (1 + (lv - 1) / 100)),
    gold: Math.ceil((200 + (lv - 1) * 50) * (1 + (lv - 1) / 100)),
  };
}

function getSelectedEquipment() {
  const uid = enhanceEquipmentSelect.value;
  return state.equipment.find((equip) => equip.uid === uid);
}

function equipToSlot() {
  const equip = getSelectedEquipment();
  if (!equip) return;
  const key = `${equip.kind}-${equip.type}`;
  state.equippedSlots[key] = equip;
  updateUI();
}

function levelUpEquipment() {
  const equip = getSelectedEquipment();
  if (!equip) return;
  const cost = getEquipmentLevelUpCost(equip);
  if (state.materials["経験チップ"] < cost.chip || state.materials["ゴールド"] < cost.gold) {
    alert("装備強化素材が不足しています。");
    return;
  }
  state.materials["経験チップ"] -= cost.chip;
  state.materials["ゴールド"] -= cost.gold;
  equip.level = (equip.level || 1) + 1;
  updateUI();
}

function renderEnhancePanel() {
  const playerStats = getPlayerStats();
  enhanceStats.innerHTML = "";
  Object.entries(playerStats).forEach(([stat, value]) => {
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `<span>${stat}</span><strong>${formatNumber(value)}</strong>`;
    enhanceStats.appendChild(row);
  });

  const levelCost = getNextLevelCost();
  const breakCost = getBreakthroughCost();
  enhancePointSummary.textContent = `Lv ${state.player.level} / 突破 ${state.player.breakthrough} / 残りポイント ${state.player.points}`;
  playerEnhanceCost.textContent = `Lvアップ: 経験チップ ${formatNumber(levelCost.chip)} + ゴールド ${formatNumber(levelCost.gold)} | 突破: α ${formatNumber(breakCost.chipA)} / β ${formatNumber(breakCost.chipB)} / ゴールド ${formatNumber(breakCost.gold)}`;

  pointControls.innerHTML = "";
  ["HP", "MP", "STR", "INT", "DEF", "SPD"].forEach((stat) => {
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `<span>${stat} PtLv ${state.player.allocated[stat] || 0}</span><button data-stat="${stat}">+1</button>`;
    row.querySelector("button").addEventListener("click", () => addPointToStat(stat));
    pointControls.appendChild(row);
  });

  enhanceEquipmentSelect.innerHTML = "";
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = state.equipment.length ? "装備を選択" : "装備なし";
  enhanceEquipmentSelect.appendChild(emptyOption);
  state.equipment.slice(0, 100).forEach((equip) => {
    const option = document.createElement("option");
    option.value = equip.uid;
    option.textContent = `${equip.name} [${equip.kind}/${equip.type}] Lv${equip.level || 1}`;
    enhanceEquipmentSelect.appendChild(option);
  });

  const selected = getSelectedEquipment();
  if (selected) {
    const cost = getEquipmentLevelUpCost(selected);
    equipmentEnhanceCost.textContent = `装備Lvアップ必要素材: 経験チップ ${formatNumber(cost.chip)} + ゴールド ${formatNumber(cost.gold)} / 主ステ ${selected.stat} +${formatNumber(getEquipmentMainStatValue(selected))}`;
  } else {
    equipmentEnhanceCost.textContent = "装備を選択すると必要素材が表示されます。";
  }

  equipSlots.innerHTML = "";
  EQUIP_SLOT_KEYS.forEach((key) => {
    const row = document.createElement("div");
    row.className = "stat-row";
    const equip = state.equippedSlots[key];
    row.innerHTML = `<span>${key}</span><span>${equip ? `${equip.name} (Lv${equip.level || 1})` : "未装備"}</span>`;
    equipSlots.appendChild(row);
  });
}

function updateStatus() {
  questLevelEl.textContent = calculateQuestLevel();
  questMultiplierEl.textContent = calculateMultiplier().toFixed(2);
  studyHoursInput.value = state.studyHours;
  clearedFloorsInput.value = state.clearedFloors;
  state.playerPower = getPlayerPowerFromBuild();
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
  renderEnhancePanel();
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
levelUpPlayerButton.addEventListener("click", levelUpPlayer);
breakthroughPlayerButton.addEventListener("click", breakthroughPlayer);
equipToSlotButton.addEventListener("click", equipToSlot);
levelUpEquipmentButton.addEventListener("click", levelUpEquipment);
enhanceEquipmentSelect.addEventListener("change", renderEnhancePanel);
studyHoursInput.addEventListener("input", (e) => { state.studyHours = Number(e.target.value); updateUI(); });
clearedFloorsInput.addEventListener("input", (e) => { state.clearedFloors = Number(e.target.value); updateUI(); });
playerPowerInput.addEventListener("input", (e) => { state.playerPower = Number(e.target.value); updateUI(); });
gachaLevelInput.addEventListener("input", (e) => { state.gachaLevel = Number(e.target.value); updateUI(); });
manualSaveButton.addEventListener("click", () => { saveState(); alert("手動セーブしました。"); });
resetButton.addEventListener("click", () => { if (confirm("セーブデータを初期化しますか？")) { Object.assign(state, structuredClone(defaultState)); updateUI(); } });

updateUI();
