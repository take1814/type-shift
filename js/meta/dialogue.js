// 三章六界キャンペーンに同期した戦闘前シネマティック会話。
// 通常クエスト、大ボス、三王、創世神で同じ会話UIを再利用する。
const STAGE_SCENES = {
  1: {
    chapter: 'CHAPTER I · STAGE 01', subtitle: '崩壊した魔都', bossId: 'bossGaius', boss: '虚無の機械神ガイアス', companion: 'ノクス',
    archive: '魔都の文字回路へ接続。虚無機械による記憶消去が、中心炉から全区画へ広がっています。',
    ren: '消された名前も、途切れた記憶も残っている。中心まで進んで、全部つなぎ直す。',
    threat: '記録は重量。記憶は誤差。すべてを零へ圧縮する。',
    resolve: '零にはさせない。この街で待つ声まで、僕の剣で連れ戻す。',
  },
  2: {
    chapter: 'CHAPTER I · STAGE 02', subtitle: '侵食された魔森', bossId: 'bossVolcarion', boss: '混沌の闇竜ヴォルカリオン', companion: 'リリア',
    archive: '魔森深部へ接続。混沌文字が根から枝へ逆流し、生態文そのものを書き換えています。',
    ren: '森の声が別の意味に変えられている。竜の核へ届くまで、一行ずつ戻そう。',
    threat: '秩序を喰らい、名を焦がし、すべての文脈を我が咆哮へ沈める。',
    resolve: '混沌の中にも本当の声は残る。リリアの救難信号ごと、必ず見つける。',
  },
  3: {
    chapter: 'CHAPTER II · STAGE 03', subtitle: '聖樹の大地', bossId: 'bossCelestia', boss: '翠風の守護者セレスティア', companion: 'グレン',
    archive: '聖樹領域へ接続。守護命令が暴走し、生命を守るためにすべての侵入者を排除しています。',
    ren: '守りたい気持ちまで敵にしたくない。間違った命令だけを断ち切る。',
    threat: '根は閉じ、風は拒む。大地を乱す文字よ、ここで眠れ。',
    resolve: '眠るのはまだ早い。グレンとこの大地に、もう一度選べる未来を返す。',
  },
  4: {
    chapter: 'CHAPTER II · STAGE 04', subtitle: '灼熱の火山国', bossId: 'bossAgniros', boss: '紅蓮の炎獣アグニロス', companion: 'フィオナ',
    archive: '火山国へ接続。戦争命令が溶岩文となり、城塞と炎獣を無限に再起動しています。',
    ren: '誰かが書いた戦争を、次の世代まで続けさせない。命令文をここで終わらせる。',
    threat: '戦火こそ継承。灰となるまで進み、燃え尽きるまで従え。',
    resolve: 'フィオナが見つけた退路を、みんなが帰れる道に変える。炎の核を断つ。',
  },
  5: {
    chapter: 'CHAPTER III · STAGE 05', subtitle: '凍結の氷海', bossId: 'bossFrostnova', boss: '氷晶の支配者フロストノヴァ', companion: 'セレスト',
    archive: '氷海へ接続。凍結した記憶都市から、停止寸前の魂文を多数検出しました。',
    ren: '凍ったままなら傷つかない。でも、それでは誰にも届かない。言葉を解凍する。',
    threat: '静止は救済。揺らぐ心も、失う痛みも、永遠の氷には存在しない。',
    resolve: '痛みごと生きていくために、セレストの光とこの海の時間を取り戻す。',
  },
  6: {
    chapter: 'CHAPTER III · STAGE 06', subtitle: '浮遊する天空城', bossId: 'bossRaidingald', boss: '雷天の魔導皇ライディンガルド', companion: 'センリン',
    archive: '天空城へ接続。「静・流・識」の三試練と、雷天王権核の反応を確認しました。',
    ren: '速さだけじゃ届かない。正しさだけでも足りない。仲間と積み上げた全部を示す。',
    threat: '天へ至る資格は雷が裁く。迷う文字に、我が城を渡る余白はない。',
    resolve: '迷っても打ち直せる。それが僕たちの強さだ。センリン、最後の門を開いてくれ。',
  },
};

const HIGH_SCENES = {
  'king-01': {
    chapter: 'CHAPTER I · SOVEREIGN', subtitle: '時の秩序を破る', stageId: 2, enemyId: 'kingChronos', speaker: '叡智の王クロノス', role: 'SOVEREIGN OF ORDER',
    lines: [
      ['アーカイブ・ヘイヴン', 'ARCHIVE NAVIGATOR', 'archive', '二界の修復により、時の王座が実体化。クロノスの固定法則が戦域を封鎖します。'],
      ['叡智の王クロノス', 'SOVEREIGN OF ORDER', 'enemy', '変化は誤りを増幅する。完成した一秒へ世界を固定すれば、喪失は生まれぬ。'],
      ['レン・アスター', 'SHIFTER', 'ren', '失敗しない代わりに、誰も先へ進めない世界だ。止まった時間を僕たちが動かす。'],
    ],
  },
  'king-02': {
    chapter: 'CHAPTER II · SOVEREIGN', subtitle: '戦炎の王権を断つ', stageId: 4, enemyId: 'kingAerpocalion', speaker: '戦炎の王エアポカリオン', role: 'SOVEREIGN OF WAR',
    lines: [
      ['アーカイブ・ヘイヴン', 'ARCHIVE NAVIGATOR', 'archive', '生命圏と火山国の修復を確認。戦炎の王が全軍召集文を起動しました。'],
      ['戦炎の王エアポカリオン', 'SOVEREIGN OF WAR', 'enemy', '守護も自由も、力なき理想にすぎぬ。すべてを一つの軍旗へ従わせる。'],
      ['レン・アスター', 'SHIFTER', 'ren', '違う声が並んでも、世界は壊れない。僕たちの言葉で、その軍旗を降ろす。'],
    ],
  },
  'king-03': {
    chapter: 'CHAPTER III · SOVEREIGN', subtitle: '終焉から魂を奪還する', stageId: 6, enemyId: 'kingNecros', speaker: '死魂の王ネクロス', role: 'SOVEREIGN OF DEATH',
    lines: [
      ['アーカイブ・ヘイヴン', 'ARCHIVE NAVIGATOR', 'archive', '六界の修復と六名の救出を確認。魂の枝が全記録を冥界へ牽引しています。'],
      ['死魂の王ネクロス', 'SOVEREIGN OF DEATH', 'enemy', '結びつきは別れを生み、記憶は死を長引かせる。終焉へ還れば、すべては等しく静かだ。'],
      ['レン・アスター', 'SHIFTER', 'ren', '終わりがあるから、今ここで呼ぶ名前に意味がある。仲間の魂は一つも渡さない。'],
    ],
  },
  'god-01': {
    chapter: 'DIVINE CHALLENGE', subtitle: '世界を書く者へ', stageId: 6, enemyId: 'alphaOrigin', speaker: '文字創世神アルファ・オリジン', role: 'ORIGIN DEITY',
    lines: [
      ['アーカイブ・ヘイヴン', 'ARCHIVE NAVIGATOR', 'archive', '三王撃破、六名同期完了。創世文字界が開き、因果律そのものが再編集を開始しました。'],
      ['文字創世神アルファ・オリジン', 'ORIGIN DEITY', 'enemy', '文字は我より生まれ、世界は我が文章。修復者よ、自由意志という誤字をなぜ残す。'],
      ['ノクス', 'YOUNGER BROTHER', 'ren', '兄さん。今度は同じ行に立つ。僕たち六人の声を、一つも消させない。'],
      ['レン・アスター', 'SHIFTER', 'ren', '世界は誰か一人の完成稿じゃない。みんなで続きを書くために、創世の文を越える。'],
    ],
  },
};

function line(speaker, role, side, text) {
  return { speaker, role, side, text };
}

function replayScene(scene, title) {
  const last = scene.lines.at(-1);
  return {
    ...scene,
    subtitle: `${title}・再出撃`,
    lines: [
      line('アーカイブ・ヘイヴン', 'ARCHIVE NAVIGATOR', 'archive', `${title}の侵食反応を再検出。既存の修復記録から最短戦闘経路を展開します。`),
      line(last.speaker, last.role, last.side, `修復経路を確認。もう一度、${title}へ言葉を届ける。`),
    ],
  };
}

export function stageDialogue(stageId, replay = false, campaignNode = null) {
  const stage = STAGE_SCENES[stageId] || STAGE_SCENES[1];
  const high = campaignNode ? HIGH_SCENES[campaignNode.id] : null;
  if (high) {
    const scene = {
      chapter: high.chapter,
      subtitle: high.subtitle,
      stageId: high.stageId,
      sceneKey: campaignNode.id,
      enemyId: high.enemyId,
      lines: high.lines.map((item) => line(...item)),
    };
    return replay ? replayScene(scene, high.subtitle) : scene;
  }

  const isCampaignQuest = campaignNode?.kind === 'quest';
  const isBossQuest = isCampaignQuest && campaignNode.questIndex === 5;
  const questTitle = campaignNode?.title || stage.subtitle;
  const questDescription = campaignNode?.description || stage.archive;
  const scene = {
    chapter: stage.chapter,
    subtitle: questTitle,
    stageId,
    sceneKey: campaignNode?.id || `stage-${stageId}`,
    enemyId: stage.bossId,
    lines: [
      line('アーカイブ・ヘイヴン', 'ARCHIVE NAVIGATOR', 'archive', isCampaignQuest ? `${questTitle}へ接続。${questDescription}` : stage.archive),
      line('レン・アスター', 'SHIFTER', 'ren', stage.ren),
      line(isBossQuest ? stage.boss : '侵食防衛体', isBossQuest ? 'MAIN BOSS' : 'NULL ENTITY', 'enemy', stage.threat),
      line('レン・アスター', 'SHIFTER', 'ren', stage.resolve),
    ],
  };
  return replay ? replayScene(scene, questTitle) : scene;
}
