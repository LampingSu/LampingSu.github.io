---
layout: default
title: "文集目录"
---

# {{ site.data.articles.config.title }}

{% assign articles = site.data.articles.articles %}

<table>
<tr>
{% for article in articles %}
    <td style="padding: 10px; vertical-align: top;">
        <a href="articles/{{ article.id }}">
            {{ article.id }}<br>{{ article.title }}
        </a>
    </td>
    
    <!-- 每4个换行 -->
    {% assign index = forloop.index0 | plus: 1 %}
    {% if index % 4 == 0 %}
        </tr><tr>
    {% endif %}
{% endfor %}
</tr>
</table>