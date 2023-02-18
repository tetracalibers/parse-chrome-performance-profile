# 影がつくアニメーション

## 前提

### 計測対象デモ

https://tetracalibers.github.io/web-feature-note/demo/compare-pattern/box-shadow-border-radius/

### 比較条件

次の6つの条件を比較する。

- box-shadow（ぼかし半径10px）を直接アニメーション
- box-shadow（ぼかし半径10px）を直接アニメーション + border-radius指定
- clip-pathのinsetをアニメーション
- clip-pathのinsetとbox-shadowのspreadをアニメーション
- box-shadow（ぼかし半径0px）を直接アニメーション
- box-shadowを適用した擬似要素のopacityをアニメーション

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
| clip-path | 0 | 6226 | 1841 | 8067 |
| box-shadow + border-radius | 0 | 5669 | 1652 | 7321 |
| clip-path + spread | 0 | 5617 | 1457 | 7074 |
| box-shadow | 0 | 4536 | 2102 | 6638 |
| box-shadow（ぼかしなし） | 0 | 4290 | 1848 | 6138 |
| opacity | 0 | 148 | 492 | 640 |