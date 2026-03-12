# Markdown Power Tools

VS Code用のMarkdown作業効率化拡張。画像貼り付けの自動化と構文テンプレートの即時挿入。

## 機能

### 画像貼り付け（Ctrl+V）

Markdownファイルでクリップボードに画像があるとき、自動で保存しリンクを挿入する。画像以外は標準の貼り付け動作。

ファイル名形式: `YYYYMMdd-HHmmss-SSS.png`（ミリ秒タイムスタンプ、衝突時は連番付与）

### テンプレート挿入

コマンドパレットまたは右クリックメニューから呼び出し可能。

**Markdown構文:**
- テーブル
- コードブロック（言語選択付き）
- チェックリスト
- details/summary
- 引用

**Mermaid図:**
- フローチャート
- シーケンス図
- ER図
- ステート図

### その他

- 日本語 / 英語 i18n対応

## 設定

| 設定キー | 説明 | 選択肢 | デフォルト |
|---|---|---|---|
| `mdPowerTools.image.saveLocationMode` | 画像の保存先モード | `relative` / `workspace` | `relative` |
| `mdPowerTools.image.saveFolder` | 保存先フォルダ名 | 任意の文字列 | `assets` |
| `mdPowerTools.image.altTextMode` | alt textの設定方法 | `prompt` / `empty` / `filename` | `prompt` |

## 開発

```sh
npm install
npm run build
npm run package    # .vsix 生成
npm test           # テスト実行
```

VS Codeの「VSIXからインストール」で `.vsix` をインストール。

## 動作環境

VS Code 1.97.0 以上（Document Paste API を使用）

## ライセンス

MIT


ライセンス
