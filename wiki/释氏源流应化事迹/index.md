---
layout: 释氏源流应化事迹  
title: "目录"
---

# 文集名称

<table>
<tr>
{% for i in (0..190) %}
    {% assign article_id = i | prepend: '00' | slice: -3, 3 %}
    {% assign article_path = "wiki/文集名称/" | append: article_id | append: ".md" %}
    
    {% for doc in site.documents %}
        {% if doc.path == article_path %}
            <td style="padding: 10px; vertical-align: top; width: 25%;">
                <a href="{{ article_id }}">
                    {{ doc.id }}<br>{{ doc.title }}
                </a>
            </td>
            
            {% assign index = forloop.index0 | plus: 1 %}
            {% if index % 4 == 0 %}
                </tr><tr>
            {% endif %}
        {% endif %}
    {% endfor %}
{% endfor %}
</tr>
</table>