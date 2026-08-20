# TYPE SHIFT 仲間立ち絵 生成記録 v1

## 制作情報

| 項目 | 内容 |
|---|---|
| 制作日 | 2026-07-22 |
| 用途 | 仲間画面・戦闘同行表示の正式高精細素材 |
| 生成方式 | Codex 組み込み画像生成 |
| 参照1 | 味方キャラクター ラフデザイン案（7人） |
| 参照2 | `ren-aster-keyart-v2.png`（画風・密度・背景基準） |
| 設計基準 | `Art_Bible_v1.1_仲間救出改定.md` |
| 状態 | ゲーム内採用。人物同一性は今後の差分制作時も維持する |

## 共通プロンプト

```text
Use case: stylized-concept
Asset type: final high-resolution vertical full-body companion key art for the TYPE SHIFT game
Input images: Image 1 is the approved seven-companion rough lineup and defines identity, role, colors and equipment; Image 2 defines approved rendering quality, cinematic lighting, dark navy background, adult proportions and restrained language-magic motifs.
World: mature original dark fantasy where language physically shapes matter. Premium stylized realism, cinematic high-contrast lighting, detailed fabric, leather and blackened metal, subtle living-glyph circles, dark near-black navy atmospheric studio backdrop.
Composition: one character only, complete head-to-toe full body, centered three-quarter standing combat-ready pose, feet visible, generous safe margin, 2:3 vertical composition.
Global palette: black and deep navy dominate. Character accent color is localized to weapon core, narrow trims and restrained particles. Pale gold is limited to recovered-memory detail.
Constraints: entirely original character, adult proportions, clear silhouette, practical equipment, no text, no readable letters, no logo, no UI, no border, no watermark.
Avoid: chibi, childlike body, exaggerated exposure, generic mobile-gacha ornament overload, neon covering the costume, random runes, oversized head, cropped feet, extra people, recognizable copyrighted costume or weapon.
```

## キャラクター別プロンプト

### フィオナ

```text
Adult woman forest ranger and first rescued companion. Long warm ash-blonde hair tied for mobility, alert green eyes, calm and trustworthy expression. Layered black and deep-forest tactical coat with asymmetrical short cape, leather bracers and fitted boots. Elegant recurved bow shaped by paired baseline arcs, moss-green memory-string and only a few leaflike glyph fragments. Lightweight silhouette, poised sideways as a distant-support archer. Refined and capable, not cute or childish.
```

### グレン

```text
Adult man tank and city defender. Tall broad athletic build, tousled dark auburn hair, warm but determined face. Heavy blackened armor integrated into a dark long battle coat, ember-red accent only in fractures and the greatsword core. Carries a massive practical greatsword; the guard resembles a closing bracket and the surface has interrupted baseline grooves. Strong protective stance and readable heavy silhouette.
```

### リリア

```text
Adult woman rune mage. Long silver hair, composed intelligent violet eyes, reserved expression. Dark navy and black layered scholar-combat dress with practical leggings, high boots and a short structured mantle; restrained violet only in the spellbook core and a circular annotation ring. Holds an open floating grimoire whose pages align into precise non-readable glyph geometry. Elegant slender adult silhouette and magical authority without excessive ornament or exposure.
```

### セレスト

```text
Adult man healer and archive cleric. Silver-blue short hair, gentle mature face, calm blue-gray eyes. Long structured white-gray and midnight coat over practical black layers, with extremely restrained pale-gold recovered-memory trim. Carries a tall staff formed around an index ring and suspended blue rune-glass crystal. Upright reassuring posture, refined healing specialist silhouette, luminous but not angelic or overdecorated.
```

### ヴェイル

```text
Adult male demon-half high-risk attacker. Ash-silver tousled hair, restrained horn-like black bone growths integrated near the temples, intense violet-gray eyes and guarded expression. Lean muscular build. Asymmetrical black armor and torn dark mantle, with Null Purple limited to fissures, claw gauntlet edges and a compact crescent scythe. Fully cover his chest and abdomen with a fitted matte-black high-neck combat underlayer plus practical segmented blackened chest armor. His corruption forms deliberate erased-line gaps, not smoke. Dangerous but redeemable.
```

### ノクス・アスター

```text
17-year-old younger brother of protagonist Ren Aster, shown as an older teen/young adult, not a child. Lean fast swordsman, black hair with deep-blue inner locks concentrated on the right side, blue-gray eyes, facial kinship to Ren only in brow, eye corners and nose bridge while remaining clearly a different person. Short right-weighted mantle and layered black navy combat clothing, forward-leaning agile stance. One slim one-handed sword with double-cursor guard, Deep Azure energy, right half of the Aster split-memory circular mark at the chest. No long coat and no copy of Ren.
```

### センリン

```text
Exceptionally rare elderly male hermit and support master. Tall slender but strong, long white hair tied loosely, refined long white beard, deeply calm face, one eye partly obscured by hair. Layered ivory, weathered charcoal and muted teal-white robes over practical dark armor pieces. Carries one closed folding fan and floating rectangular talismans with abstract non-readable alignment marks. A complete thin circular grammar halo and perfectly still teal-white particles signal mastery; no gold spectacle and no explosion. Quiet authority and ancient knowledge, culturally respectful original fantasy design.
```

## 採用ファイル

- `fiona-v1.png`
- `glen-v1.png`
- `lilia-v1.png`
- `celeste-v1.png`
- `veil-v1.png`
- `nox-v1.png`
- `senrin-v1.png`

## レビュー記録

- [x] 7人の役割を武器とシルエットで識別できる。
- [x] 黒・ネイビー基調と固有色の局所使用を維持している。
- [x] ノクスはレンとの血縁を感じるが、衣装とシルエットは別系統である。
- [x] センリンの希少性を白髪、円環、静止粒子で示している。
- [x] ヴェイルの胸部露出を正式版で解消した。
- [x] 文字、ロゴ、透かしを含まない。
- [x] 既存作品の固有衣装・武器・紋章を直接使用していない。
