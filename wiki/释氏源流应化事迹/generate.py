#!/usr/bin/env python3
import yaml
import os
import shutil

# 读取数据
with open('wiki/释氏源流应化事迹/_data/articles.yml', 'r', encoding='utf-8') as f:
    data = yaml.safe_load(f)

# 清空并创建 articles 目录
articles_dir = 'wiki/释氏源流应化事迹/articles'
if os.path.exists(articles_dir):
    shutil.rmtree(articles_dir)
os.makedirs(articles_dir)

# 生成文章文件
for i, article in enumerate(data['articles']):
    filename = f"{articles_dir}/{article['id']}.md"
    
    if article['type'] == 'preface':
        content = f"""---
layout: default
title: "{article['title']}"
id: "{article['id']}"
---

{article['content']}
"""
    else:
        content = f"""---
layout: default
title: "{article['title']}" 
id: "{article['id']}"
---

## 白话译文

{article['translation']}

## 古文原文

{article['original']}
"""
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"生成: {filename}")

print(f"完成! 共生成 {len(data['articles'])} 篇文章")