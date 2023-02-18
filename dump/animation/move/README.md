# 下に移動するアニメーション

## 前提

### 計測対象デモ

https://tetracalibers.github.io/web-feature-note/demo/compare-pattern/move/

### 比較条件

次の2つのプロパティで同様のアニメーションを実装する。

- top
- transform

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
| top | 1327 | 2753 | 1080 | 5160 |
| transform | 0 | 107 | 174 | 281 |