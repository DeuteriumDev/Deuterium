/*
# Roles.sql

This file contains the `authenticated_roles` declarations.
Skipped when [`skip_authenticated_roles`]() is set to true.
*/


{% if not skip_authenticated_roles %}
{%- for role in authenticated_roles %}
create role {{ role }};
{% endfor %}
{% endif %}

