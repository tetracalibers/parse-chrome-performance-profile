# 背景が左から右に流れるアニメーション

## 前提

### 計測対象デモ

https://tetracalibers.github.io/web-feature-note/demo/compare-pattern/flow-bg-from-left/

### 比較条件

次の4つのプロパティで同様のアニメーションを実装する。

- width
- transform
- clip-path
- background-position

### 共通条件

- hoverで発動
- transitionは片方向のみ（上述のスクリプトはアニメーションが複数回発生する場合には対応していないため）
- durationは0.5sで統一
- 要素幅も統一されている

## 結果

### 合計再レンダリング時間比較

アニメーション開始から終了までに発生した各レンダリングフェーズのdurationを合計した結果

| プロパティ | Layout | Paint | Composite | TOTAL |
| --- | --- | --- | --- | --- | 
| width | 3272 | 10563 | 3306 | 17141 |
| clip-path | 0 | 12127 | 2579 | 14706 |
| background-position | 0 | 5601 | 1768 | 7369 |
| transform | 0 | 0 | 1251 | 1251 |