{% macro random_string(len) -%}{% for i in range(0,len) -%}{{ [0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f"]|random }}{% endfor %}{%- endmacro -%}
{% macro random_guid() -%} {{ random_string(8) + "-" + random_string(4) + "-" + random_string(4) + "-" + random_string(4) + "-" + random_string(12) }}{%- endmacro -%}
