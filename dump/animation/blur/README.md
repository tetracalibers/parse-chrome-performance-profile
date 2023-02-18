# 影がつくアニメーション

## 前提

### 計測対象デモ

https://tetracalibers.github.io/web-feature-note/demo/compare-pattern/blur/

### 比較条件

次の4つの条件を比較する。

- filter（ぼかし半径2px）を直接アニメーション
- filter（ぼかし半径10px）を直接アニメーション
- filter（ぼかし半径2px）を直接アニメーション + border-radius指定
- filter（ぼかし半径2px）を直接アニメーション + border-radiusの代わりにclip-path

### 共通条件

- hoverで発動
- transitionは片方向のみ（上述のスクリプトはアニメーションが複数回発生する場合には対応していないため）
- durationは0.5sで統一
- 要素幅も統一されている

## 結果

### 合計再レンダリング時間比較

アニメーション開始から終了までに発生した各レンダリングフェーズのdurationを合計した結果

| 条件 | Layout | Paint | Composite | TOTAL |
| --- | --- | --- | --- | --- | 
| filter（ぼかし半径2px） + border-radius | 0 | 701 | 4896 | 5547 |
| filter（ぼかし半径10px） | 0 | 166 | 1926 | 2092 |
| filter（ぼかし半径2px） + clip-path | 0 | 163 | 1511 | 1674 |
| filter（ぼかし半径2px） | 0 | 166 | 1310 | 1476 |
