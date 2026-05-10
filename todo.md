# アタッチメントシステム実装 TODO

## 完了済み ✅

### Phase 1: 型定義の拡張
- [x] `src/types/game.ts` に新しい型を追加
  - `AttachmentEffectCategory` - 効果カテゴリ
  - `AttachmentEffectType` - 全40種類の効果タイプ
  - `AttachmentConditionType` - 全22種類の条件タイプ
  - `AttachmentCondition` - 条件インターフェース
  - `AttachmentEffect` - 拡張された効果インターフェース
  - `AttachmentCombatState` - 戦闘中効果状態

### Phase 2: 効果テンプレートの実装
- [x] `src/lib/attachmentEffects.ts` を作成
  - ステータス増減効果 (6種類)
  - スキルパラメータ改変効果 (5種類)
  - 確率操作効果 (8種類)
  - 計算式介入効果 (5種類)
  - ルール書き換え効果 (11種類)
  - ランクによる出現確率調整

### Phase 3: 条件テンプレートの実装
- [x] `src/lib/attachmentConditions.ts` を作成
  - リソース系条件 (6種類)
  - 状態系条件 (5種類)
  - 行動系条件 (6種類)
  - ターン系条件 (5種類)
  - 条件による効果増加倍率

### Phase 4: 生成システムの更新
- [x] `src/lib/gameRules.ts` の更新
  - `generateAttachmentEffect` - 新しいシステムに置き換え
  - `generateConditionalEffect` - 条件付き効果生成
  - `calculateAttachmentBonuses` - ステータス計算更新

### Phase 5: UIコンポーネント更新
- [x] `src/components/ui/AttachmentCard.tsx` の更新
  - 条件付き効果の表示対応

### Phase 6: 戦闘システム統合
- [x] `src/lib/raidCombat.ts` を作成
  - `calculateAttachmentCombatState` - 効果状態計算
  - `applyAttachmentToCombatant` - 戦闘員への適用
  - `applyAttachmentToDamage` - ダメージ計算統合
  - `applyAttachmentToMpCost` - MPコスト統合
  - `applyAttachmentToProbability` - 確率判定統合
  - `applyAttachmentToIncomingDamage` - 被ダメージ統合
  - `applyAttachmentToHeal` - 回復統合
  - `evaluateCondition` - 条件評価

## プロンプトで指定された全効果・条件リスト（実装確認用）

### ステータス増減 (6種)
- [x] (HP/MP/ATK/DEF/SPD)+n 固定値
- [x] (HP/MP/ATK/DEF/SPD)+n% 割合
- [x] (HP/MP/ATK/DEF/SPD)+n、(HP/MP/ATK/DEF/SPD)-n マイナス効果がある分プラス効果が大きい
- [x] 全ステータス+n%((HP/MP/ATK/DEF/SPD)は除く)
- [x] 最大HP-n%、全ステータス+n%(HPは除く)
- [x] クリティカルダメージ+n%

### スキルパラメータ改変 (5種)
- [x] スキルの基礎効果+n%
- [x] (物理/炎/雷/氷)属性のスキルのみ効果+n%
- [x] スキルのMPコスト-n
- [x] スキルのMPコスト-n% (MPコストの減少量には全体に上限を設ける)
- [x] [特定のタグ]をもつスキルのMPコスト-n(%)

### 確率操作 (8種)
- [x] クリティカル率+n%
- [x] スキル内の全ての確率+n%
- [x] スキル内の全ての確率n倍
- [x] クリティカル率と(クリティカルダメージ-100%)の比が1:2になるように変換
- [x] 回避されたとき、次の攻撃は必中
- [x] 確率がn%以上のとき、その確率で発動する効果は全て確定発動
- [x] 全ての確率判定を「2回振って有利な方を採用」に変更
- [x] クリティカル発生時、そのスキルにある確率で発動する効果は確定発動

### 計算式への介入 (5種)
- [x] ダメージ計算時、(HP/MP/DEF/SPD)のn%をATKに加算 (nはステータスによって調整)
- [x] クリティカルダメージはダメージに対する割合ではなく(HP/MP/ATK/DEF/SPD)のn%に対する割合で計算する
- [x] 回復量計算時、(HP/MP/ATK/DEF/SPD)のn%を加算
- [x] 敵味方両方のダメージ計算時、DEFを計算に入れないようにする
- [x] 敵のHPが低いほどダメージ上昇

### ルール書き換え (11種)
- [x] 1ターンに同じスキルを2回使える(MPも2回消費)
- [x] 戦闘不能時に1回だけ行動できる
- [x] 2回行動を可能にする (厳しい条件付きで)
- [x] 受けたダメージを次のターンまで遅延させる(即死しない)
- [x] HP1以下になるダメージを全てHP1で止める(1回のみ)
- [x] 回復時にそのn%のダメージを敵に与える
- [x] ダメージを先にMPで受ける(MPがなくなったらHPが減る)
- [x] MP不足時、HPをn%消費する
- [x] 死亡後「幽霊状態」となり次の1ターンだけ行動可能
- [x] 攻撃時、自身のバフの残りターン数を消費してダメージn%上昇
- [x] デバフを受けたターンは攻撃力がn%増加

### アタッチメント条件

#### リソース系 (6種)
- [x] HPn%以下のとき
- [x] HPn%以上のとき
- [x] MP0のとき
- [x] MPがn%以下のとき
- [x] MPがn%以上のとき
- [x] MP消費時にHPも消費する代わりに

#### 状態系 (5種)
- [x] 状態異常の敵を攻撃したとき
- [x] [特定の状態異常]の敵を攻撃したとき
- [x] 状態異常を無効化(解除)したとき
- [x] 敵と自分の状態異常が同じ時
- [x] 同じ属性の攻撃をn回連続で使用したとき

#### 行動系 (6種)
- [x] 敵より先に行動しているとき
- [x] 敵より後に行動しているとき
- [x] 同ターン内の2回目以降の攻撃のとき
- [x] MPをn回以上連続で消費しているとき
- [x] 通常攻撃をn回以上連続で行っているとき
- [x] nターン連続で同じスキルを使用しているとき

#### ターン系 (5種)
- [x] 戦闘開始nターン(以内/以降)なら
- [x] (偶数/奇数)ターンのとき
- [x] 1つ前の敵のターンでダメージを受けなかったとき
