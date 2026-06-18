# V2EX 最新主题 RSS（去推广）

原始 RSS：

```text
https://www.v2ex.com/index.xml
```

本项目会自动生成一个净化版 RSS，仅去掉分类/标签为：

```text
推广
```

的条目。

## 你的 Inoreader 订阅地址

仓库名使用 `v2ex-clean` 时，订阅地址就是：

```text
https://LeonBangla.github.io/v2ex-clean/v2ex-clean.xml
```

## 使用方法

### 1. 新建 GitHub 仓库

仓库名建议用：

```text
v2ex-clean
```

### 2. 上传本项目所有文件

解压 zip 后，把里面的所有文件上传到 GitHub 仓库。

注意必须包含隐藏目录：

```text
.github/workflows/rss.yml
```

### 3. 开启 GitHub Pages

进入仓库：

```text
Settings → Pages
```

Source 选择：

```text
GitHub Actions
```

### 4. 手动运行一次

进入：

```text
Actions → Build V2EX Clean RSS → Run workflow
```

运行成功后，直接订阅：

```text
https://LeonBangla.github.io/v2ex-clean/v2ex-clean.xml
```

## 自动更新

默认每 10 分钟自动更新一次。
