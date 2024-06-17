{% if include_authenticated_roles %}
{%- for role in authenticated_roles %}
drop role if exists {{ role }};
{% endfor %}
{% endif %}
