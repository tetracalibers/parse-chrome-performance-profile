# parse Chrome Performance Profile

Chromeのパフォーマンス計測で取得できるProfile.jsonを解析し、CSSのレンダリング各フェーズごとにかかっている時間を抽出するスクリプト。

## ディレクトリ構成

- `dump`：抽出結果JSON置き場
- `data`：解析対象のProfile.json置き場
- `script`：解析スクリプト置き場

## parse-animation.js

アニメーション記録が含まれるProfile.jsonを解析し、アニメーションに伴う再レンダリング時間を抽出するスクリプト。

### Profile.jsonの取得方法

1. 計測したいアニメーションを実行するページをChromeで開く
2. devToolsのパフォーマンスタブを開く
3. `command + E`で測定開始
4. hover等でアニメーション実行
5. `command + E`で測定終了
6. プロファイルを保存

![Chrome開発者ツールのパフォーマンスタブにあるプロファイル保存ボタンのスクショ](/images/chrome-save-profile.png)

### スクリプトの実行方法

1. `data/animation`配下にProfile.jsonを設置
2. （初回のみ）`yarn`で依存をインストール
3. `yarn parse:animation`を実行
4. `dump/animation`内に解析結果が出力される

### 使用上の注意

現時点では、複数回のアニメーション実行が含まれるProfile.jsonには対応していません。

transitionの往復も2回としてカウントされるため、次のように、transitionの実行は片方向だけの状態で測定してください。

```css
.target {
  width: 0;
  /** 元に戻る際のアニメーションはなし */
  transition: none;
}
.target:hover {
  width: 100%;
  transition-property: width;
  transition-duration: 0.5s;
  transition-timing-function: ease-out;
}
```