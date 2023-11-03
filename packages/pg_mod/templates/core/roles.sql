/*
# Roles.sql

This file contains the `authenticated_roles` declarations.
Skipped when [`include_authenticated_roles`]() is set to false.
*/


{% if include_authenticated_roles %}
{%- for role in authenticated_roles %}
create role {{ role }};
{% endfor %}
{% endif %}

