# 第七小组 · 倾角实验室

在人因工程课程实验中，20 名参与者使用笔记本自带键盘，在 0° 至 70° 的八个档位分别完成短时打字任务。网站根据使用目标提供试用档位、比较依据和智谱生成的试调建议。

[进入实验室](https://ag000-star.github.io/tilt-lab-seven/) · [直接获取推荐](https://ag000-star.github.io/tilt-lab-seven/recommend/) · [实验问答](https://ag000-star.github.io/tilt-lab-seven/ask/)

## 运行与发布

在项目根目录运行 `node build.mjs`。该命令生成 GitHub Pages 使用的 `docs/`，以及可单独部署的云端入口 `dist/worker.mjs`。使用 GitHub Pages 的 `main` 分支和 `/docs` 文件夹发布，更新源码后需重新构建并一起提交。

角度推荐、预生成的智谱建议和常见问题在浏览器本地展示。自由提问通过 HTTPS 调用项目后台，由后台使用私有环境变量 `ZHIPU_API_KEY` 访问智谱。更换托管账号或后台时，同步更新构建脚本中的 API 地址和后台允许的网页来源。

片头沿用原项目授权的视觉与交互，来源见 [原片头项目](https://github.com/yannicksong0106/dsh-550c-boot)、[许可](LICENSE.txt)和[致谢](CREDITS.md)。
