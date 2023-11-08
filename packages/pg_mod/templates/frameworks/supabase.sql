{% include 'templates/core/schemas.sql' %}
{% include 'templates/core/tables.sql' %}
{% include 'templates/core/functions.sql' %}

-- supabase
create or replace function private.get_user_id() returns uuid as $$
  select auth.uid()
$$ language sql stable;

comment on function private.get_user_id () is '**SUPABASE** Returns framework user id.';

{% include 'templates/core/views.sql' %}
{% include 'templates/core/policies.sql' %}
