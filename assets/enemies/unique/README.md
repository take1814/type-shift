# 通常敵・固有アート制作台帳

通常敵80体を、共有シルエットから背景分離済みの固有アートへ段階的に置き換えるための台帳です。完成素材は敵図鑑と戦闘画面で共用し、戦闘では個体ごとの表示倍率と接地点を設定します。

## 現行ステータス（enemy-art-batch-v47）

- 固有アート完成：**80 / 80体**
- 図鑑・戦闘・オフラインキャッシュ接続：**完了**
- 未制作：**0体**
- 以下のバッチ別進捗値は、制作順を追跡するための履歴として保持しています。

## 制作ルール

- 1個体につき1つの固有シルエットを持たせる。
- 黒・ネイビー・シアンを基本色とし、属性色は補助色に限定する。
- 画像へUI、名前、枠、背景、床影を含めない。
- 頭頂、武器、脚先、浮遊破片を含め、全方向へ安全余白を残す。
- 背景分離後のPNGを図鑑と戦闘で共用する。
- 雑魚、小ボス、中ボスの画面占有率を明確に分ける。

## バッチ1（ステージ1代表個体）

| 個体ID | 表示名 | 階級 | 素材 | 状態 |
|---|---|---|---|---|
| `runeSlime` | ルーンスライム | 雑魚 | `rune-slime-cutout-v1.png` | 実装済み |
| `runeCrystal` | ルーンクリスタル | 雑魚 | `rune-crystal-cutout-v1.png` | 実装済み |
| `glitchSpider` | グリッチスパイダー | 雑魚 | `glitch-spider-cutout-v1.png` | 実装済み |
| `runeGolem` | ルーンゴーレム | 雑魚 | `rune-golem-cutout-v1.png` | 実装済み |
| `glitchMimic` | グリッチミミック | 小ボス | `glitch-mimic-cutout-v1.png` | 実装済み |
| `runeElemental` | ルーンエレメンタル | 中ボス | `rune-elemental-cutout-v1.png` | 実装済み |

## バッチ2（ステージ1兵士・機械・大型個体）

| 個体ID | 表示名 | 階級 | 素材 | 状態 |
|---|---|---|---|---|
| `skeletonSoldier` | スケルトン兵 | 雑魚 | `skeleton-soldier-cutout-v1.png` | 実装済み |
| `machineDrone` | 機械兵ドローン | 雑魚 | `machine-drone-cutout-v1.png` | 実装済み |
| `rustedSpearman` | 錆びた槍兵 | 雑魚 | `rusted-spearman-cutout-v1.png` | 実装済み |
| `glitchSpark` | グリッチスパーク | 雑魚 | `glitch-spark-cutout-v1.png` | 実装済み |
| `armoredTroll` | アーマードトロール | 小ボス | `armored-troll-cutout-v1.png` | 実装済み |
| `cyclops` | サイクロプス | 中ボス | `cyclops-cutout-v1.png` | 実装済み |

## バッチ3（ステージ1石・機械・魔術系個体）

| 個体ID | 表示名 | 階級 | 素材 | 状態 |
|---|---|---|---|---|
| `stoneTroll` | ストーントロール | 雑魚 | `stone-troll-cutout-v1.png` | 実装済み |
| `glitchGolem` | グリッチゴーレム | 雑魚 | `glitch-golem-cutout-v1.png` | 実装済み |
| `spikeBall` | トゲトゲボール | 雑魚 | `spike-ball-cutout-v1.png` | 実装済み |
| `darkMage` | ダークメイジ | 小ボス | `dark-mage-cutout-v1.png` | 実装済み |
| `runeHunter` | ルーンハンター | 小ボス | `rune-hunter-cutout-v1.png` | 実装済み |
| `deathKnight` | デスナイト | 中ボス | `death-knight-cutout-v1.png` | 実装済み |

## バッチ4（ステージ1残存上位個体）

| 個体ID | 表示名 | 階級 | 素材 | 状態 |
|---|---|---|---|---|
| `runeGuardian` | ルーンガーディアン | 小ボス | `rune-guardian-cutout-v1.png` | 実装済み |
| `noiseFallen` | ノイズフォールン | 小ボス | `noise-fallen-cutout-v1.png` | 実装済み |
| `glitchMaiden` | グリッチメイデン | 中ボス | `glitch-maiden-cutout-v1.png` | 実装済み |

## バッチ5（ステージ2代表個体）

| 個体ID | 表示名 | 階級 | 素材 | 状態 |
|---|---|---|---|---|
| `shadowBat` | シャドウバット | 雑魚 | `shadow-bat-cutout-v1.png` | 実装済み |
| `noiseImp` | ノイズインプ | 雑魚 | `noise-imp-cutout-v1.png` | 実装済み |
| `voidScorpion` | ヴォイドスコーピオン | 雑魚 | `void-scorpion-cutout-v1.png` | 実装済み |
| `shadowWolf` | シャドウウルフ | 雑魚 | `shadow-wolf-cutout-v1.png` | 実装済み |
| `voidKnight` | ヴォイドナイト | 小ボス | `void-knight-cutout-v1.png` | 実装済み |
| `abyssSpirit` | アビススピリット | 中ボス | `abyss-spirit-cutout-v1.png` | 実装済み |

## 進捗（現行）

- 固有アート完成: 80 / 80体
- 未制作: 0 / 80体
- ステージ1〜3の敵プールと追加バリエーションを含め、全80体を固有アート化済み。

## Batch 6：ステージ2追加アート（6体）

| ID | 表示名 | 区分 | ファイル |
|---|---|---|---|
| `darkSlime` | ダークスライム | 雑魚 | `dark-slime-cutout-v1.png` |
| `goblinWarrior` | ゴブリンウォリアー | 雑魚 | `goblin-warrior-cutout-v1.png` |
| `goblinArcher` | ゴブリンアーチャー | 雑魚 | `goblin-archer-cutout-v1.png` |
| `woodSlime` | ウッドスライム | 雑魚 | `wood-slime-cutout-v1.png` |
| `blindBat` | ブラインドバット | 雑魚 | `blind-bat-cutout-v1.png` |
| `darkWolf` | ダークウルフ | 雑魚 | `dark-wolf-cutout-v1.png` |

進捗：固有アート 33 / 80体（残り47体）。ステージ2の通常敵は代表12体中12体を高精細カットアウトへ接続済み。

## Batch 7：ステージ2残存通常敵（4体）

| ID | 表示名 | 区分 | ファイル |
|---|---|---|---|
| `shadowImp` | シャドウインプ | 雑魚 | `shadow-imp-cutout-v1.png` |
| `shadowSlime` | シャドウスライム | 雑魚 | `shadow-slime-cutout-v1.png` |
| `voidSlime` | ヴォイドスライム | 雑魚 | `void-slime-cutout-v1.png` |
| `darkImp` | ダークインプ | 雑魚 | `dark-imp-cutout-v1.png` |

進捗：固有アート 37 / 80体（残り43体）。ステージ2の通常敵16体をすべて高精細カットアウトへ接続済み。

## Batch 8：ステージ3通常敵（6体）

| ID | 表示名 | 区分 | ファイル |
|---|---|---|---|
| `goblinShaman` | ゴブリンシャーマン | 雑魚 | `goblin-shaman-cutout-v2.png` |
| `windImp` | ウィンドインプ | 雑魚 | `wind-imp-cutout-v2.png` |
| `earthImp` | アースインプ | 雑魚 | `earth-imp-cutout-v2.png` |
| `lightImp` | ライトインプ | 雑魚 | `light-imp-cutout-v1.png` |
| `ghost` | ゴースト | 雑魚 | `ghost-cutout-v1.png` |
| `lightSlime` | ライトスライム | 雑魚 | `light-slime-cutout-v2.png` |

進捗：固有アート 44 / 80体（残り36体）。ステージ3の代表通常敵6体を図鑑・戦闘・オフラインキャッシュへ接続済み。

| `poisonSlime` | ポイズンスライム | 雑魚 | `poison-slime-cutout-v1.png` |

## Batch 9：ステージ3上位敵アート（4体）
| ID | 表示名 | 区分 | ファイル |
|---|---|---|---|
| `indexBlade` | インデックスブレード | 小ボス | `index-blade-cutout-v1.png` |
| `corruptGuardian` | コラプトガーディアン | 小ボス | `corrupt-guardian-cutout-v1.png` |
| `sandWorm` | サンドワーム | 小ボス | `sand-worm-cutout-v1.png` |
| `cursePriest` | カースプリースト | 中ボス | `curse-priest-cutout-v1.png` |

## Batch 10：ステージ3上位敵追加アート（2体）
| ID | 表示名 | 区分 | ファイル |
|---|---|---|---|
| `shadowChimera` | シャドウキマイラ | 中ボス | `shadow-chimera-cutout-v1.png` |
| `voidReaper` | ヴォイドリーパー | 中ボス | `void-reaper-cutout-v1.png` |

進捗：固有アート 52 / 80体（残り28体）。ステージ3の通常敵7体と上位敵8体を高精細カットアウトへ接続済み。

## Batch 11：ステージ3中ボス追加アート（2体）
| ID | 表示名 | 区分 | ファイル |
|---|---|---|---|
| `bloodGolem` | ブラッドゴーレム | 中ボス | `blood-golem-cutout-v1.png` |
| `youngDarkDragon` | ダークドラゴン幼体 | 中ボス | `young-dark-dragon-cutout-v1.png` |

## Batch 12：追加キャラクター（10体）
| ID | 表示名 | 区分 | ファイル |
|---|---|---|---|
| `shadowAssassin` | シャドウアサシン | 小ボス | `shadow-assassin-cutout-v1.png` |
| `cursedSwordsman` | 呪われた剣士 | 小ボス | `cursed-swordsman-cutout-v1.png` |
| `cursedKnight` | 呪われた騎士 | 小ボス | `cursed-knight-cutout-v1.png` |
| `crystalWorm` | クリスタルワーム | 小ボス | `crystal-worm-cutout-v1.png` |
| `voidHound` | ヴォイドハウンド | 小ボス | `void-hound-cutout-v1.png` |
| `hellStalker` | ヘルストーカー | 小ボス | `hell-stalker-cutout-v1.png` |
| `voidDrake` | ヴォイドドレイク | 小ボス | `void-drake-cutout-v1.png` |
| `darkFairy` | ダークフェアリー | 雑魚 | `dark-fairy-cutout-v1.png` |
| `skeletonArcher` | スケルトンアーチャー | 雑魚 | `skeleton-archer-cutout-v1.png` |
| `goblinBombardier` | ゴブリン爆弾兵 | 雑魚 | `goblin-bombardier-cutout-v1.png` |

進捗：固有アート 80 / 80体（残り0体）。今回追加した11体を図鑑・戦闘・オフラインキャッシュへ接続済み。
