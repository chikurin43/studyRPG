import { useState } from "react";

// ── 属性（4種） ──────────────────────────────────────────────
const ATTRS = ["物理","炎","雷","氷"];
const ATTR_COL = {
  物理:"bg-blue-100 text-blue-800", 炎:"bg-orange-100 text-orange-800",
  雷:"bg-yellow-100 text-yellow-800", 氷:"bg-cyan-100 text-cyan-800",
};
const ATTR_PREFIX = { 物理:"鋼鉄の", 炎:"紅蓮の", 雷:"雷鳴の", 氷:"氷結の" };

// ── レア度 ────────────────────────────────────────────────────
const RARS = ["C","B","A","S","SS","SSS"];
const RAR_COL = {
  C:"bg-gray-100 text-gray-700",   B:"bg-blue-100 text-blue-800",
  A:"bg-yellow-100 text-yellow-800", S:"bg-orange-100 text-orange-800",
  SS:"bg-purple-100 text-purple-800", SSS:"bg-green-100 text-green-800",
};
const RAR_SCALE = {
  C:   { dmgBase:60,  dmgBonus:30,  mulLo:11, mulHi:13, probMax:30, turnMax:2 },
  B:   { dmgBase:80,  dmgBonus:40,  mulLo:12, mulHi:14, probMax:40, turnMax:2 },
  A:   { dmgBase:100, dmgBonus:50,  mulLo:13, mulHi:16, probMax:55, turnMax:3 },
  S:   { dmgBase:130, dmgBonus:60,  mulLo:14, mulHi:18, probMax:65, turnMax:3 },
  SS:  { dmgBase:160, dmgBonus:70,  mulLo:16, mulHi:22, probMax:75, turnMax:4 },
  SSS: { dmgBase:220, dmgBonus:100, mulLo:20, mulHi:30, probMax:90, turnMax:4 },
};
const PASS_SCALE = {
  C:   { flat:[3,6],   cond:[6,10],  prob:[10,20], condMul:[105,115] },
  B:   { flat:[5,8],   cond:[8,13],  prob:[15,25], condMul:[108,118] },
  A:   { flat:[7,11],  cond:[10,16], prob:[20,35], condMul:[110,125] },
  S:   { flat:[9,14],  cond:[13,20], prob:[25,45], condMul:[115,130] },
  SS:  { flat:[12,18], cond:[16,25], prob:[30,55], condMul:[120,140] },
  SSS: { flat:[16,25], cond:[20,35], prob:[40,70], condMul:[130,150] },
};
const RAR_WEIGHTS = { C:20, B:25, A:25, S:15, SS:10, SSS:5 };

// ════════════════════════════════════════════════════════════
// ── MP消費設計 ──────────────────────────────────────────────
// ════════════════════════════════════════════════════════════
//
// 設計方針（前の会話で決めた内容）：
//   ・想定バトル10ターン、毎ターン自然回復8〜10
//   ・10T回復分 ≈ 90 + 初期MP100 = 総予算190
//   ・強スキル2回＋中スキル2回 ≈ 220 → 少し節約必要な緊張感
//   ・レア度倍率：C×0.8 / B×0.9 / A×1.0 / S×1.2 / SS×1.5 / SSS×2.0
//   ・タイプ別基本コスト × レア度倍率 = 消費MP（5刻み）
//
// タイプ別基本コスト（Aレア基準）：
//   低コスト(×1.0)  : 単体攻撃・デバフ・スロウ打・蓄積
//   中コスト(×1.2)  : 二連撃・三連撃・防御破壊・封印打・浄化・条件付き
//   中高コスト(×1.35): 継続DoT・HP吸収・バリア破壊・自己バフ
//   高コスト(×1.5)  : カウンター・リフレクト・バフ（攻撃なし）・リジェネ
//   超高コスト(×1.8) : チャージ・処刑・複合属性・遅延発動・覇気
//
// MP消費の表示色：
//   〜19  : 緑（低コスト）
//   20〜39: 黄（中コスト）
//   40〜64: 橙（高コスト）
//   65〜  : 赤（超高コスト）

// レア度倍率テーブル
const RAR_MP_MUL = { C:0.8, B:0.9, A:1.0, S:1.2, SS:1.5, SSS:2.0 };

// タイプ別基本コスト（Aレア基準、5刻み）
const MP_BASE = {
  low:    { min:15, max:25 },  // 低コスト
  mid:    { min:25, max:35 },  // 中コスト
  midhigh:{ min:30, max:45 },  // 中高コスト
  high:   { min:40, max:55 },  // 高コスト
  super:  { min:50, max:70 },  // 超高コスト
};

// MP消費量を計算（5刻み）
function calcMP(tier, rar) {
  const base = MP_BASE[tier];
  const raw  = R(base.min, base.max);
  const mul  = RAR_MP_MUL[rar];
  return Math.max(5, Math.round(raw * mul / 5) * 5);
}

// MP消費の表示色クラス
function mpColor(mp) {
  if (mp <= 19) return { bg:"#dcfce7", text:"#166534", label:"低" };
  if (mp <= 39) return { bg:"#fef9c3", text:"#854d0e", label:"中" };
  if (mp <= 64) return { bg:"#ffedd5", text:"#9a3412", label:"高" };
  return               { bg:"#fee2e2", text:"#991b1b", label:"超高" };
}

// ── 状態異常定義（9種） ──────────────────────────────────────
const STATUS_FX = {
  出血:      (rar) => { const v=R(3,4+RARS.indexOf(rar));      return `最大HPの${Math.min(v,8)}%のダメージを毎ターン受ける`; },
  炎上:      (rar) => { const v=R(8,10+RARS.indexOf(rar)*2);   return `相手の攻撃力の${Math.min(v,20)}%相当のダメージを毎ターン受ける`; },
  感電:      (rar) => { const v=R(15,20+RARS.indexOf(rar)*3);  return `受けるダメージが${Math.min(v,40)}%増加する`; },
  凍傷:      (rar) => { const v=R(15,20+RARS.indexOf(rar)*3);  return `攻撃力が${Math.min(v,40)}%低下する`; },
  スタン:    ()    => `1ターン行動不能になる`,
  スロウ:    (rar) => { const v=R(20,25+RARS.indexOf(rar)*3);  return `素早さが${Math.min(v,45)}%低下し行動順が後ろへずれる`; },
  防御ダウン:(rar) => { const v=R(15,20+RARS.indexOf(rar)*2);  return `防御力が${Math.min(v,35)}%低下する`; },
  暗闇:      (rar) => { const v=R(20,25+RARS.indexOf(rar)*3);  return `攻撃の命中率が${Math.min(v,50)}%低下する`; },
  封印:      ()    => `スキルが使用不可になる`,
};
const STATUSES_NORMAL = ["出血","炎上","感電","凍傷","スロウ","防御ダウン","暗闇","封印"];
const STATUSES_ALL    = [...STATUSES_NORMAL,"スタン"];

// ── ユーティリティ ────────────────────────────────────────────
const R         = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick      = arr   => arr[Math.floor(Math.random()*arr.length)];
const otherAttr = a     => pick(ATTRS.filter(x=>x!==a));
const rarIdx    = rar   => RARS.indexOf(rar);

function scaleDmg(rar, ratio=1) {
  const s=RAR_SCALE[rar];
  return Math.round((s.dmgBase+R(0,Math.floor(s.dmgBonus/5))*5)*ratio/5)*5;
}
function scaleMul(rar, extraHi=0) {
  const s=RAR_SCALE[rar];
  return (R(s.mulLo, s.mulHi+extraHi*10)/10).toFixed(1);
}
function scaleProb(rar, cap=100) {
  const s=RAR_SCALE[rar];
  return Math.min(cap, Math.round(R(10,s.probMax)/10)*10);
}
function scaleTurns(rar, min=1) { return R(min,RAR_SCALE[rar].turnMax); }
function passFlat(rar)    { const s=PASS_SCALE[rar]; return R(s.flat[0],s.flat[1]); }
function passCond(rar)    { const s=PASS_SCALE[rar]; return R(s.cond[0],s.cond[1]); }
function passProb(rar)    { const s=PASS_SCALE[rar]; return Math.round(R(s.prob[0],s.prob[1])/5)*5; }

function stWithProb(st, rar) {
  const fx=STATUS_FX[st](rar);
  if(st==="スタン"){ const p=Math.max(10,scaleProb(rar,25)-Math.max(0,20-rarIdx(rar)*3)); return `${p}%の確率で${st}（${fx}）を付与する`; }
  const t=scaleTurns(rar,1), p=scaleProb(rar);
  return `${p}%の確率で${st}（${fx}、${t}ターン）を付与する`;
}
function stSure(st, rar) {
  if(st==="スタン") return `${st}（${STATUS_FX[st](rar)}）を付与する（確率15%）`;
  return `${st}（${STATUS_FX[st](rar)}、${scaleTurns(rar,1)}ターン）を付与する`;
}
function pickSt(incap=false) { return incap?pick(STATUSES_ALL):pick(STATUSES_NORMAL); }

function weightedRar() {
  const total=Object.values(RAR_WEIGHTS).reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(const [k,w] of Object.entries(RAR_WEIGHTS)){ r-=w; if(r<=0) return k; }
  return "C";
}

// ════════════════════════════════════════════════════════════
// ── アクティブスキル（24種）＋MP消費 ───────────────────────
// ════════════════════════════════════════════════════════════
const SKILL_TYPES = [
  // 1. 基本単体攻撃 [低コスト]
  (rar)=>{ const at=pick(ATTRS),at2=otherAttr(at),st=pickSt(true),d=scaleDmg(rar),m=scaleMul(rar);
    return{name:`${ATTR_PREFIX[at]}一撃`,tags:[at,"単体攻撃",st],mp:calcMP("low",rar),
      desc:`${at}属性${d}%のダメージを与える。${stWithProb(st,rar)}。${at2}属性の敵に対するダメージが${m}倍になる。`};},
  // 2. 二連撃 [中コスト]
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),d=scaleDmg(rar,0.6),bk=R(10,10+rarIdx(rar)*5),t=scaleTurns(rar);
    return{name:`${at}の連撃`,tags:[at,"二連撃",st],mp:calcMP("mid",rar),
      desc:`${at}属性${d}%のダメージを2回与える（合計${d*2}%）。${stWithProb(st,rar)}。2ヒット後、自分の攻撃力が${bk}%上昇する（${t}ターン）。`};},
  // 3. 三連撃 [中コスト]
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),d=scaleDmg(rar,0.45),def=R(10,15+rarIdx(rar)*3),t=scaleTurns(rar);
    return{name:`${at}の三連撃`,tags:[at,"三連撃"],mp:calcMP("mid",rar),
      desc:`${at}属性${d}%のダメージを3回与える（合計${d*3}%）。3ヒット後、相手の防御力を${def}%ダウンさせる（${t}ターン）。クリティカル時は必ず${stSure(st,rar)}。`};},
  // 4. 継続ダメージ [中高コスト]
  (rar)=>{ const at=pick(ATTRS),d=scaleDmg(rar),dot=R(3,4+rarIdx(rar)),t=scaleTurns(rar,2),m=scaleMul(rar,0.1);
    return{name:`腐食の${at}`,tags:[at,"継続ダメージ","出血"],mp:calcMP("midhigh",rar),
      desc:`${at}属性${d}%のダメージを与える。さらに出血（最大HPの${Math.min(dot,8)}%のダメージ）を${t}ターン付与する。継続ダメージ状態の敵への攻撃ダメージが${m}倍になる。`};},
  // 5. HP吸収 [中高コスト]
  (rar)=>{ const at=pick(ATTRS),at2=otherAttr(at),d=scaleDmg(rar),drain=Math.min(R(20,30+rarIdx(rar)*5),60),m=scaleMul(rar,0.2);
    return{name:`${at}吸収打`,tags:[at,"HP吸収"],mp:calcMP("midhigh",rar),
      desc:`${at}属性${d}%のダメージを与え、与えたダメージの${drain}%を自分のHPとして回復する。相手のHPが30%以下の時、吸収量が2倍になる。${at2}属性の敵には吸収無効の代わりにダメージが${m}倍になる。`};},
  // 6. カウンター [高コスト] ※次ターン以降に恩恵が続くので高め
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),d=scaleDmg(rar,0.8),m=scaleMul(rar),t=scaleTurns(rar,1);
    return{name:`反撃の${at}`,tags:[at,"カウンター",st],mp:calcMP("high",rar),
      desc:`${at}属性${d}%のダメージを与える。次の${t}ターン間、攻撃を受けた際に自動で反撃し${m}倍のダメージを与える。反撃ヒット時は必ず${stSure(st,rar)}。`};},
  // 7. リフレクト [高コスト] ※複数ターンの恩恵
  (rar)=>{ const at=pick(ATTRS),ref=Math.min(20+rarIdx(rar)*10+R(0,10),80),t=scaleTurns(rar,2),def=R(10,20);
    return{name:`${at}のリフレクト`,tags:[at,"反射"],mp:calcMP("high",rar),
      desc:`次の${t}ターン間、受けたダメージの${ref}%を${at}属性として跳ね返す。反射中は防御力が${def}%上昇する。${at}属性の攻撃を反射した場合、ダメージが${scaleMul(rar,0.2)}倍になる。`};},
  // 8. チャージ [超高コスト] ※消費は発動ターンに先払い
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),st2=pick(STATUSES_NORMAL.filter(x=>x!==st)),ch=rar==="SSS"?1:R(1,2),d=scaleDmg(rar,1.8),p=scaleProb(rar);
    return{name:`${at}の解放`,tags:[at,"チャージ",st],mp:calcMP("super",rar),
      desc:`${ch}ターン溜めた後、${at}属性${d}%の強力なダメージを与える（MP消費は使用ターンに先払い）。${p}%の確率で${stSure(st,rar)}。溜め中は防御力が${R(20,40)}%上昇し、${st2}を無効化する。`};},
  // 9. 攻撃＋自己バフ [中高コスト]
  (rar)=>{ const at=pick(ATTRS),d=scaleDmg(rar),atk=R(10,10+rarIdx(rar)*5),t=scaleTurns(rar,2),m=scaleMul(rar,0.1);
    return{name:`高揚の${at}撃`,tags:[at,"自己強化","バフ"],mp:calcMP("midhigh",rar),
      desc:`${at}属性${d}%のダメージを与える。使用後、自分の攻撃力が${atk}%上昇する（${t}ターン）。HPが50%以下の時ダメージが${m}倍・攻撃力上昇量が2倍になる。`};},
  // 10. 攻撃＋デバフ [低コスト] ※デバフは緊急性高く回転させたい
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),d=scaleDmg(rar),db1=R(10,20),db2=R(5,15),t=scaleTurns(rar,2),m=scaleMul(rar);
    return{name:`${at}の崩し打`,tags:[at,"デバフ",st],mp:calcMP("low",rar),
      desc:`${at}属性${d}%のダメージを与え、相手の攻撃力を${db1}%・防御力を${db2}%ダウンさせる（${t}ターン）。${stWithProb(st,rar)}。デバフ中の敵へのダメージが${m}倍になる。`};},
  // 11. 貫通撃 [中コスト]
  (rar)=>{ const at=pick(ATTRS),at2=otherAttr(at),d=scaleDmg(rar),pierce=Math.min(30+rarIdx(rar)*10+R(0,10),90),extra=scaleDmg(rar,0.5);
    return{name:`${at}貫通撃`,tags:[at,at2,"貫通"],mp:calcMP("mid",rar),
      desc:`${at}属性${d}%のダメージを与える。このダメージは相手の防御力の${pierce}%を無視する。${at2}属性の敵に使用すると無視率が100%になり、追加で${extra}%のダメージが発生する。`};},
  // 12. 防御破壊 [中コスト]
  (rar)=>{ const at=pick(ATTRS),d=scaleDmg(rar),reduce=R(15,20+rarIdx(rar)*2),t=scaleTurns(rar,2),m=scaleMul(rar);
    return{name:`鎧砕きの${at}`,tags:[at,"防御破壊"],mp:calcMP("mid",rar),
      desc:`${at}属性${d}%のダメージを与え、相手の防御力を${reduce}%ダウンさせる（${t}ターン、重複可）。防御ダウン中の敵への次の攻撃ダメージが${m}倍になる。`};},
  // 13. 処刑 [超高コスト] ※一発逆転の大技
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),d=scaleDmg(rar),threshold=R(20,35),extra=Math.round(d*1.5/5)*5;
    return{name:`${at}の処刑`,tags:[at,"トドメ",st],mp:calcMP("super",rar),
      desc:`${at}属性${d}%のダメージを与える。相手のHPが${threshold}%以下の場合、追加で${at}属性${extra}%の特大ダメージを与え、必ず${stSure(st,rar)}。`};},
  // 14. 遅延発動 [超高コスト] ※2回分の攻撃
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),d1=scaleDmg(rar,0.8),d2=scaleDmg(rar,0.9),delay=R(1,2);
    return{name:`${at}の遅発弾`,tags:[at,"遅延発動",st],mp:calcMP("super",rar),
      desc:`${at}属性${d1}%のダメージを与える。${delay}ターン後、自動で${at}属性${d2}%の追加攻撃が発動する。追加攻撃は必ず${stSure(st,rar)}、クリティカル率が${R(20,30+rarIdx(rar)*5)}%上昇する。`};},
  // 15. 封印打 [中コスト]
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),d=scaleDmg(rar),t=scaleTurns(rar,2),m=scaleMul(rar);
    return{name:`${at}の封印打`,tags:[at,"封印",st],mp:calcMP("mid",rar),
      desc:`${at}属性${d}%のダメージを与え、相手のスキル使用を${t}ターン封印する。封印中の敵へのダメージが${m}倍になる。${stWithProb(st,rar)}。`};},
  // 16. 複合属性 [超高コスト] ※2属性を同時に扱う高難度スキル
  (rar)=>{ const at=pick(ATTRS),at2=otherAttr(at),st=pickSt(),d=scaleDmg(rar,0.9),m=scaleMul(rar,0.3),p=scaleProb(rar);
    return{name:`${at}・${at2}複合爆発`,tags:[at,at2,"複合"],mp:calcMP("super",rar),
      desc:`${at}属性と${at2}属性の混合で${d}%のダメージを与える。両属性に弱点がある場合、ダメージが${m}倍になる。${p}%の確率で${stSure(st,rar)}。`};},
  // 17. 自己バフ [高コスト] ※攻撃なしで恩恵が続く
  (rar)=>{ const at=pick(ATTRS),atk=R(15,15+rarIdx(rar)*7),spd=R(10,25),t=scaleTurns(rar,2),m=scaleMul(rar,0.2);
    return{name:`${at}の覚醒`,tags:[at,"バフ","強化"],mp:calcMP("high",rar),
      desc:`自分の攻撃力を${atk}%・素早さを${spd}%上昇させる（${t}ターン）。次の攻撃スキルのダメージが${m}倍になる。${at}属性のダメージを受けた時、追加で攻撃力が${R(5,10+rarIdx(rar)*3)}%上昇する。`};},
  // 18. リジェネ [高コスト] ※複数ターン回復は投資コスト
  (rar)=>{ const at=pick(ATTRS),heal=Math.min(3+rarIdx(rar),10),t=scaleTurns(rar,2),m=scaleMul(rar,0.1);
    return{name:`${at}の再生`,tags:[at,"リジェネ","回復"],mp:calcMP("high",rar),
      desc:`毎ターン最大HPの${heal}%を回復する（${t}ターン）。いずれかの状態異常を受けている時、回復量が${m}倍になる。${at}属性攻撃を受けた時、ターン数が1追加される。`};},
  // 19. 浄化＋反撃 [中コスト]
  (rar)=>{ const at=pick(ATTRS),d=scaleDmg(rar),bonus=R(10,20),cap=R(80,100+rarIdx(rar)*30),t=scaleTurns(rar,1);
    return{name:`浄化の${at}`,tags:[at,"浄化","状態解除"],mp:calcMP("mid",rar),
      desc:`自分にかかった状態異常・デバフを全て解除し、${at}属性${d}%の反撃ダメージを与える。解除した効果の数×${bonus}%ダメージが上昇する（上限+${cap}%）。解除後${t}ターン状態異常無効になる。`};},
  // 20. 条件付き強化 [中コスト]
  (rar)=>{ const at=pick(ATTRS),at2=otherAttr(at),d=scaleDmg(rar),m=scaleMul(rar),m2=scaleMul(rar,0.1);
    const cond=pick([`${at2}属性の敵`,`状態異常中の敵`,`HPが50%以下の敵`,`デバフ中の敵`,`封印中の敵`]);
    return{name:`弱点狙いの${at}`,tags:[at,at2,"条件付き"],mp:calcMP("mid",rar),
      desc:`${at}属性${d}%のダメージを与える。${cond}に対してダメージが${m}倍になる。${R(20,30+rarIdx(rar)*5)}%の確率でクリティカルヒットし、さらに${m2}倍になる。`};},
  // 21. スロウ打 [低コスト]
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),d=scaleDmg(rar),p=scaleProb(rar),t=scaleTurns(rar,2),spd=Math.min(R(20,25+rarIdx(rar)*4),45);
    return{name:`${at}の呪縛`,tags:[at,"スロウ",st],mp:calcMP("low",rar),
      desc:`${at}属性${d}%のダメージを与える。${p}%の確率でスロウ（素早さ${spd}%低下・行動順を後ろへ、${t}ターン）を付与する。スロウ成功時、必ず${stSure(st,rar)}。`};},
  // 22. バリア破壊 [中高コスト]
  (rar)=>{ const at=pick(ATTRS),at2=otherAttr(at),st=pickSt(),d=scaleDmg(rar),extra=scaleDmg(rar,0.5);
    return{name:`${at}のシールド割り`,tags:[at,"バリア破壊",at2],mp:calcMP("midhigh",rar),
      desc:`${at}属性${d}%のダメージを与え、相手のバリア・シールドを全て除去する。除去成功時、${at2}属性${extra}%の追加ダメージを与え、${stSure(st,rar)}。`};},
  // 23. 全ステバフ＋バリア [超高コスト]
  (rar)=>{ const at=pick(ATTRS),d=scaleDmg(rar),sp=R(10,10+rarIdx(rar)*5),t=scaleTurns(rar,1);
    return{name:`${at}の覇気`,tags:[at,"超強化"],mp:calcMP("super",rar),
      desc:`${at}属性${d}%のダメージを与える。使用後、自分の全ステータスが${sp}%上昇し（${t}ターン）、次に受けるダメージを1回無効化するバリアを張る。`};},
  // 24. 蓄積型状態異常 [低コスト]
  (rar)=>{ const at=pick(ATTRS),st=pick(["出血","凍傷","感電"]),d=scaleDmg(rar),p=scaleProb(rar),t=scaleTurns(rar,2),stack=R(10,15+rarIdx(rar)*3);
    return{name:`${at}の蓄積打`,tags:[at,st,"スタック"],mp:calcMP("low",rar),
      desc:`${at}属性${d}%のダメージを与える。${p}%の確率で${stSure(st,rar)}（同一状態異常は重複不可・更新）。対象がすでに${st}状態の時、効果値が${stack}%増加した状態で上書きする。`};},
];

// ════════════════════════════════════════════════════════════
// ── パッシブスキル（20種）※MP消費なし ─────────────────────
// ════════════════════════════════════════════════════════════
const PASSIVE_TYPES = [
  (rar)=>{ const at=pick(ATTRS),v=passFlat(rar);
    return{name:`${at}の闘気`,tags:[at,"常時","攻撃強化"],cond:"常時",
      desc:`常時、自分の攻撃力が${v}%上昇する。さらに${at}属性スキル使用時、その攻撃の与ダメージが追加で${passCond(rar)}%上昇する。`};},
  (rar)=>{ const at=pick(ATTRS),v=passFlat(rar),extra=passCond(rar);
    return{name:`${at}の守護`,tags:[at,"常時","防御強化"],cond:"常時",
      desc:`常時、自分の防御力が${v}%上昇する。${at}属性の攻撃を受けた時、さらに防御力が${extra}%上昇する（1ターン）。`};},
  (rar)=>{ const at=pick(ATTRS),at2=otherAttr(at),v=passFlat(rar);
    return{name:`${at}耐性`,tags:[at,"常時","耐性"],cond:"常時",
      desc:`常時、${at}属性ダメージを${v}%軽減する。${at2}属性の攻撃を受けた場合も${Math.round(v*0.5)}%軽減する（属性耐性の副次効果）。`};},
  (rar)=>{ const v=passFlat(rar),prior=passProb(rar);
    return{name:`疾風の歩`,tags:["常時","速度強化"],cond:"常時",
      desc:`常時、自分の素早さが${v}%上昇する。${prior}%の確率でバトル開始時に先制を得る（素早さが相手より低い場合でも適用）。`};},
  (rar)=>{ const v=passFlat(rar),mul=passCond(rar);
    return{name:`鋭眼`,tags:["常時","クリティカル"],cond:"常時",
      desc:`常時、クリティカル率が${v}%上昇する。クリティカルヒット時のダメージ倍率が追加で${mul}%上昇する。`};},
  (rar)=>{ const at=pick(ATTRS),v=passCond(rar),extra=Math.round(passCond(rar)*0.5);
    return{name:`${at}の怒気`,tags:[at,"HP閾値","攻撃強化"],cond:"HP50%以下",
      desc:`自分のHPが50%以下になると、攻撃力が${v}%上昇する（持続）。さらにHPが25%以下になると、攻撃力がさらに${extra}%追加上昇する（最大合計+${v+extra}%）。`};},
  (rar)=>{ const v=passCond(rar),regen=Math.min(passFlat(rar),5);
    return{name:`不屈の守り`,tags:["HP閾値","防御強化","回復"],cond:"HP50%以下",
      desc:`自分のHPが50%以下になると、受けるダメージを${v}%軽減する。さらにHPが50%以下の間、毎ターン開始時に最大HPの${regen}%を回復する。`};},
  (rar)=>{ const threshold=R(15,25),cd=Math.max(1,R(3,5)-rarIdx(rar));
    return{name:`生命の盾`,tags:["HP閾値","バリア"],cond:"HP25%以下",
      desc:`HPが${threshold}%以下になった時、自動でダメージを1回無効化するバリアを張る（${cd}ターンに1回のみ発動）。バリアが破壊された時、攻撃力が${passCond(rar)}%上昇する（2ターン）。`};},
  (rar)=>{ const at=pick(ATTRS),v=Math.min(passCond(rar)+passFlat(rar),40);
    return{name:`${at}の覚悟`,tags:[at,"HP閾値","超強化"],cond:"HP25%以下",
      desc:`HPが25%以下になると、${at}属性スキルのダメージが${v}%上昇する（持続）。この効果中、${at}属性スキルは必ずクリティカルヒットする。`};},
  (rar)=>{ const v=Math.round(passCond(rar)*0.4),cap=Math.min(passCond(rar)+passFlat(rar),35),stack=R(3,5+rarIdx(rar));
    return{name:`痛みの覚醒`,tags:["被ダメ時","攻撃強化","スタック"],cond:"被ダメ時",
      desc:`攻撃を受けるたびに攻撃力が${v}%上昇する（スタック可、上限+${cap}%）。${stack}回ヒットされるごとに、次の自分の攻撃が必ずクリティカルになる。`};},
  (rar)=>{ const at=pick(ATTRS),st=pick(["感電","凍傷","出血"]),p=passProb(rar);
    return{name:`${at}の荊棘`,tags:[at,"被ダメ時",st],cond:"被ダメ時",
      desc:`物理攻撃を受けた時、${p}%の確率で攻撃者に${stSure(st,rar)}。${at}属性攻撃を受けた場合、確率が2倍になる。`};},
  (rar)=>{ const p=passProb(rar),heal=Math.min(passFlat(rar),12);
    return{name:`強靭なる肉体`,tags:["被ダメ時","回復"],cond:"被ダメ時",
      desc:`攻撃を受けた時、${p}%の確率で最大HPの${heal}%を即座に回復する。回復した場合、そのターンの被ダメージを${passCond(rar)}%軽減する。`};},
  (rar)=>{ const v=passCond(rar);
    return{name:`苦痛の昇華`,tags:["状態異常時","攻撃強化"],cond:"自身状態異常時",
      desc:`自分がいずれかの状態異常状態の間、攻撃力が${v}%上昇する。状態異常が2種類以上かかっている場合、さらに${Math.round(v*0.5)}%追加上昇する（重複加算）。`};},
  (rar)=>{ const v=passCond(rar),v2=Math.round(v*0.6);
    return{name:`弱者狩り`,tags:["状態異常時","攻撃強化","条件付き"],cond:"相手状態異常時",
      desc:`相手がいずれかの状態異常状態の間、与えるダメージが${v}%上昇する。状態異常の種類ごとにさらに${v2}%追加上昇する（上限+${Math.min(v+v2*3,45)}%）。`};},
  (rar)=>{ const at=pick(ATTRS),st=pick(["凍傷","暗闇","スロウ"]),v=passCond(rar);
    return{name:`${st}の捕食者`,tags:[at,"状態異常時","条件付き"],cond:"相手状態異常時",
      desc:`相手が${st}状態の時、${at}属性ダメージが${v}%上昇する。さらに相手が${st}状態の時に与えたダメージの${Math.round(passFlat(rar)*1.5)}%を自分のHPとして回復する。`};},
  (rar)=>{ const at=pick(ATTRS),p=passProb(rar),v=passFlat(rar),t=R(1,2);
    return{name:`${at}の鼓動`,tags:[at,"ターン開始","バフ"],cond:"ターン開始時",
      desc:`毎ターン開始時、${p}%の確率で自分の攻撃力が${v}%上昇する（${t}ターン、スタック可）。${at}属性スキルを使用したターンの次のターン開始時、この確率が2倍になる。`};},
  (rar)=>{ const at=pick(ATTRS),st=pick(["防御ダウン","スロウ","暗闇"]),p=passProb(rar);
    return{name:`${at}の圧迫`,tags:[at,"ターン開始","デバフ"],cond:"ターン開始時",
      desc:`毎ターン開始時、${p}%の確率で相手に${stSure(st,rar)}。${at}属性の敵に対してはこの確率が${Math.round(p*1.5)}%に上昇する。`};},
  (rar)=>{ const at=pick(ATTRS),st=pickSt(),p=passProb(rar);
    return{name:`${at}の余韻`,tags:[at,"命中時",st],cond:"スキル命中時",
      desc:`スキルが命中した時、${p}%の確率で${stSure(st,rar)}。クリティカルヒット時はこの確率が2倍になる。`};},
  (rar)=>{ const drain=Math.min(passFlat(rar),12);
    return{name:`吸命の爪`,tags:["命中時","HP吸収"],cond:"攻撃命中時",
      desc:`攻撃が命中するたびに、与えたダメージの${drain}%を自分のHPとして回復する。クリティカルヒット時は回復量が2倍になる。`};},
  (rar)=>{ const at=pick(ATTRS),v1=passCond(rar),v2=passCond(rar);
    return{name:`${at}の臨界`,tags:[at,"HP閾値","状態異常時","超強化"],cond:"複合条件",
      desc:`自分のHPが50%以下かつ状態異常状態の時、${at}属性スキルのダメージが${v1}%上昇し、受けるダメージを${Math.round(v2*0.6)}%軽減する。両条件を満たした状態が2ターン続くと、次の${at}属性スキルが必ずクリティカルになる。`};},
];

// ── タグ・カラーマップ ────────────────────────────────────────
const EXTRA_TAG_COL = {
  単体攻撃:"bg-gray-100 text-gray-700",二連撃:"bg-gray-100 text-gray-700",
  三連撃:"bg-gray-100 text-gray-700",継続ダメージ:"bg-red-100 text-red-800",
  "HP吸収":"bg-purple-100 text-purple-800",カウンター:"bg-gray-100 text-gray-700",
  反射:"bg-green-100 text-green-800",チャージ:"bg-yellow-100 text-yellow-800",
  自己強化:"bg-pink-100 text-pink-800",デバフ:"bg-red-100 text-red-800",
  貫通:"bg-blue-100 text-blue-800",防御破壊:"bg-blue-100 text-blue-800",
  トドメ:"bg-orange-100 text-orange-800",遅延発動:"bg-yellow-100 text-yellow-800",
  封印:"bg-purple-100 text-purple-800",複合:"bg-gray-100 text-gray-700",
  バフ:"bg-pink-100 text-pink-800",強化:"bg-pink-100 text-pink-800",
  リジェネ:"bg-green-100 text-green-800",回復:"bg-green-100 text-green-800",
  浄化:"bg-green-100 text-green-800",状態解除:"bg-green-100 text-green-800",
  条件付き:"bg-gray-100 text-gray-700",スロウ:"bg-gray-100 text-gray-700",
  バリア破壊:"bg-blue-100 text-blue-800",超強化:"bg-pink-100 text-pink-800",
  スタック:"bg-gray-100 text-gray-700",
  常時:"bg-gray-100 text-gray-700",
  攻撃強化:"bg-orange-100 text-orange-800",防御強化:"bg-blue-100 text-blue-800",
  耐性:"bg-cyan-100 text-cyan-800",速度強化:"bg-teal-100 text-teal-800",
  クリティカル:"bg-yellow-100 text-yellow-800",
  "HP閾値":"bg-red-100 text-red-800",バリア:"bg-blue-100 text-blue-800",
  被ダメ時:"bg-red-100 text-red-800","状態異常時":"bg-purple-100 text-purple-800",
  "自身状態異常時":"bg-purple-100 text-purple-800",
  "相手状態異常時":"bg-orange-100 text-orange-800",
  ターン開始:"bg-green-100 text-green-800",命中時:"bg-yellow-100 text-yellow-800",
  複合条件:"bg-pink-100 text-pink-800",
  出血:"bg-red-100 text-red-800",炎上:"bg-orange-100 text-orange-800",
  感電:"bg-yellow-100 text-yellow-800",凍傷:"bg-cyan-100 text-cyan-800",
  スタン:"bg-gray-100 text-gray-700",防御ダウン:"bg-blue-100 text-blue-800",
  暗闇:"bg-purple-100 text-purple-800",
};
const BG_MAP={
  "bg-blue-100":"#dbeafe","bg-orange-100":"#ffedd5","bg-yellow-100":"#fef9c3",
  "bg-cyan-100":"#cffafe","bg-purple-100":"#ede9fe","bg-green-100":"#dcfce7",
  "bg-teal-100":"#ccfbf1","bg-gray-100":"#f3f4f6","bg-red-100":"#fee2e2","bg-pink-100":"#fce7f3",
};
const TX_MAP={
  "text-blue-800":"#1e40af","text-orange-800":"#9a3412","text-yellow-800":"#854d0e",
  "text-cyan-800":"#155e75","text-purple-800":"#5b21b6","text-green-800":"#166534",
  "text-teal-800":"#115e59","text-gray-700":"#374151","text-red-800":"#991b1b","text-pink-800":"#9d174d",
};
const tagColor = t => ATTR_COL[t]||EXTRA_TAG_COL[t]||"bg-gray-100 text-gray-700";

function Pill({text,cls,bold=false}){
  const [bg,tx]=cls.split(" ");
  return(<span style={{fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:bold?700:400,
    background:BG_MAP[bg]||"#eee",color:TX_MAP[tx]||"#333"}}>{text}</span>);
}

// ── MPバッジ ─────────────────────────────────────────────────
function MPBadge({mp}){
  const c=mpColor(mp);
  return(
    <div style={{display:"flex",alignItems:"center",gap:4,
      background:c.bg,border:`1px solid ${c.text}33`,
      borderRadius:8,padding:"3px 10px"}}>
      <span style={{fontSize:10,color:c.text,fontWeight:600}}>MP</span>
      <span style={{fontSize:14,fontWeight:700,color:c.text,lineHeight:1}}>{mp}</span>
      <span style={{fontSize:10,color:c.text,opacity:0.7}}>({c.label})</span>
    </div>
  );
}

// ── パッシブ発動条件バッジ ────────────────────────────────────
const COND_COL={
  "常時":"#374151","HP50%以下":"#991b1b","HP25%以下":"#9a3412",
  "被ダメ時":"#854d0e","自身状態異常時":"#5b21b6","相手状態異常時":"#9a3412",
  "ターン開始時":"#166534","スキル命中時":"#854d0e","攻撃命中時":"#854d0e","複合条件":"#72243E",
};
function CondBadge({cond}){
  const col=COND_COL[cond]||"#374151";
  return(<span style={{fontSize:10,padding:"2px 8px",borderRadius:6,
    border:`1px solid ${col}`,color:col,fontWeight:600}}>⚡ {cond}</span>);
}

function generate(n, types){
  const out=[];
  for(let i=0;i<n;i++){
    const rar=weightedRar(), sk=pick(types)(rar);
    out.push({...sk,rar,rarCls:RAR_COL[rar]});
  }
  return out;
}

// ── スキルカード ──────────────────────────────────────────────
function SkillCard({s, isPassive}){
  return(
    <div style={{border:"1px solid #e5e5e5",borderRadius:12,padding:"12px 16px",background:"#fff"}}>
      {/* 1行目：スキル名 ＋ 右側にMP or パッシブ条件 ＋ レア度 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,gap:8}}>
        <span style={{fontSize:14,fontWeight:700,flex:1}}>{s.name}</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {!isPassive && s.mp != null && <MPBadge mp={s.mp}/>}
          {isPassive && s.cond && <CondBadge cond={s.cond}/>}
          <Pill text={s.rar} cls={s.rarCls} bold/>
        </div>
      </div>
      {/* 2行目：タグ */}
      <div style={{marginBottom:7,display:"flex",flexWrap:"wrap",gap:3}}>
        {s.tags.map((t,j)=><Pill key={j} text={t} cls={tagColor(t)}/>)}
      </div>
      {/* 3行目：説明文 */}
      <div style={{fontSize:13,color:"#444",lineHeight:1.75}}>{s.desc}</div>
    </div>
  );
}

// ── 凡例 ──────────────────────────────────────────────────────
function StatusLegend(){
  return(
    <div style={{background:"#fafafa",border:"1px solid #e8e8e8",borderRadius:10,
      padding:"9px 14px",marginBottom:"0.75rem",fontSize:11.5,color:"#555",lineHeight:2}}>
      <span style={{fontWeight:700,color:"#333",marginRight:6}}>状態異常定義</span>
      <span style={{color:"#991b1b",fontWeight:600}}>出血</span>：最大HPの3〜8%/T　
      <span style={{color:"#9a3412",fontWeight:600}}>炎上</span>：相手ATKの8〜20%/T　
      <span style={{color:"#854d0e",fontWeight:600}}>感電</span>：被ダメ15〜40%増　
      <span style={{color:"#155e75",fontWeight:600}}>凍傷</span>：ATK15〜40%減　
      <span style={{color:"#374151",fontWeight:600}}>スタン</span>：1T行動不能（10〜25%のみ）　
      <span style={{color:"#374151",fontWeight:600}}>スロウ</span>：素早さ20〜45%減　
      <span style={{color:"#1e40af",fontWeight:600}}>防御ダウン</span>：DEF15〜35%減　
      <span style={{color:"#374151",fontWeight:600}}>暗闇</span>：命中20〜50%減　
      <span style={{color:"#5b21b6",fontWeight:600}}>封印</span>：スキル使用不可
      <br/>
      <span style={{color:"#aaa",fontSize:11}}>同一種は重複不可（上書き）　異なる種は同時付与可　数値はレア度によってスケール</span>
    </div>
  );
}

function MPLegend(){
  return(
    <div style={{background:"#fafafa",border:"1px solid #e8e8e8",borderRadius:10,
      padding:"9px 14px",marginBottom:"0.75rem",fontSize:11.5,color:"#555",lineHeight:2}}>
      <span style={{fontWeight:700,color:"#333",marginRight:6}}>MP消費設計</span>
      <span style={{color:"#166534",fontWeight:600}}>低（〜19）</span>：回転重視スキル　
      <span style={{color:"#854d0e",fontWeight:600}}>中（20〜39）</span>：標準コスト　
      <span style={{color:"#9a3412",fontWeight:600}}>高（40〜64）</span>：投資型・長期恩恵　
      <span style={{color:"#991b1b",fontWeight:600}}>超高（65〜）</span>：大技・一発逆転
      <br/>
      <span style={{color:"#aaa",fontSize:11}}>
        想定：最大MP100・毎T自然回復8〜10・10Tバトルで総予算約190MP　／　
        レア倍率：C×0.8 / B×0.9 / A×1.0 / S×1.2 / SS×1.5 / SSS×2.0
      </span>
    </div>
  );
}

function PassiveLegend(){
  return(
    <div style={{background:"#fafafa",border:"1px solid #e8e8e8",borderRadius:10,
      padding:"9px 14px",marginBottom:"0.75rem",fontSize:11.5,color:"#555",lineHeight:2}}>
      <span style={{fontWeight:700,color:"#333",marginRight:6}}>パッシブ発動条件</span>
      <span style={{fontWeight:600}}>常時</span>：常に効果が持続　
      <span style={{color:"#991b1b",fontWeight:600}}>HP50%以下</span>：HP減少で発動　
      <span style={{color:"#9a3412",fontWeight:600}}>HP25%以下</span>：瀕死時に発動　
      <span style={{color:"#854d0e",fontWeight:600}}>被ダメ時</span>：攻撃を受けた瞬間　
      <span style={{color:"#5b21b6",fontWeight:600}}>状態異常時</span>：異常状態で発動　
      <span style={{color:"#166534",fontWeight:600}}>ターン開始時</span>：毎ターン自動発動　
      <span style={{color:"#854d0e",fontWeight:600}}>命中時</span>：攻撃ヒット時　
      <span style={{color:"#72243E",fontWeight:600}}>複合条件</span>：2条件同時で発動
      <br/>
      <span style={{color:"#aaa",fontSize:11}}>パッシブはMP消費なし　常時効果は最大+25%に抑制・条件付きで上乗せする設計</span>
    </div>
  );
}

// ── メイン ────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]             = useState("active");
  const [count,setCount]         = useState(5);
  const [skills,setSkills]       = useState([]);
  const [generated,setGenerated] = useState(false);

  const isPassive = tab==="passive";
  const gen   = ()=>{ setSkills(generate(count,isPassive?PASSIVE_TYPES:SKILL_TYPES)); setGenerated(true); };
  const clear = ()=>{ setSkills([]); setGenerated(false); };

  const TAB = (active)=>({
    padding:"6px 18px",fontSize:13,fontWeight:active?700:400,cursor:"pointer",
    border:"1px solid #ccc",borderRadius:8,
    background:active?"#222":"#fff",color:active?"#fff":"#444",transition:"all 0.15s",
  });

  return(
    <div style={{padding:"1rem 0",fontFamily:"sans-serif",maxWidth:740,margin:"0 auto"}}>

      {/* ヘッダー */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:"0.75rem",flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:16,fontWeight:700}}>RPGスキル自動生成</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <label style={{fontSize:13,color:"#666"}}>生成数</label>
          <input type="number" min={1} max={20} value={count}
            onChange={e=>setCount(Math.min(20,Math.max(1,parseInt(e.target.value)||1)))}
            style={{width:54,padding:"4px 8px",border:"1px solid #ccc",borderRadius:8,fontSize:13}}/>
          <button onClick={gen} style={{padding:"6px 16px",fontSize:13,fontWeight:600,
            border:"1px solid #aaa",borderRadius:8,background:"#fff",cursor:"pointer"}}>
            生成する
          </button>
          <button onClick={clear} style={{padding:"6px 14px",fontSize:13,
            border:"1px solid #ccc",borderRadius:8,background:"#fff",cursor:"pointer"}}>
            クリア
          </button>
        </div>
      </div>

      {/* タブ */}
      <div style={{display:"flex",gap:8,marginBottom:"0.75rem"}}>
        <button style={TAB(tab==="active")}  onClick={()=>{setTab("active");  clear();}}>⚔ アクティブ（24種）</button>
        <button style={TAB(tab==="passive")} onClick={()=>{setTab("passive"); clear();}}>🛡 パッシブ（20種）</button>
      </div>

      {/* 凡例 */}
      {!isPassive && <MPLegend/>}
      {isPassive  && <PassiveLegend/>}
      <StatusLegend/>

      {!generated && (
        <div style={{textAlign:"center",color:"#bbb",fontSize:13,padding:"2rem 0"}}>
          「生成する」を押してスキルを生成してください
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {skills.map((s,i)=><SkillCard key={i} s={s} isPassive={isPassive}/>)}
      </div>
    </div>
  );
}
