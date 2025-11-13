---
title: "目录"
---
# 释氏源流应化事迹

{% include 释氏源流应化事迹-nav.html %}

<table>
<tr>
{% for i in (0..190) %}
    {% assign article_id = i | prepend: '00' | slice: -3, 3 %}
    {% assign article_path = "/wiki/释氏源流应化事迹/" | append: article_id | append: ".md" %}
    
    {% for doc in site.documents %}
        {% if doc.path == article_path %}
            <td style="padding: 10px; vertical-align: top; width: 25%;">
                <a href="{{ article_id }}">
                    {{ doc.id }}  {{ doc.title }}
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