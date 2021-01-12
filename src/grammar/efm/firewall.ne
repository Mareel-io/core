MAIN -> 
  STMT
  | MAIN SECTIONS

STMT ->
  null
  | STMT LINE {% (arr) => { return [...arr[0], ...arr[1]]}%}
  | STMT [\r\n] {% (arr) => arr[0] %}

LINE ->
  _ KVP {% (arr) => [arr[1]] %}
  | _ COMMENT {% (arr) => [] %}

SECTIONS ->
  SECTIONMARK
  | SECTIONS LINE {% (arr) => [...arr[0], arr[1]] %}
  | SECTIONS "{" STMT "}" {% (arr) => [arr[0], [arr[2]]] %}
  | SECTIONS [\r\n] {% arr=> arr[0] %}

SECTIONMARK -> "[" KEY "]" {% (arr) => {return {section: arr[1]}} %}

KVP -> KEY _ "=" _ VALUE {% (arr) => {return {type: 'kvp', key: arr[0], value: arr[4]}} %}

# Key and value
KEY -> [a-zA-Z_]:+ {% (arr) => arr[0].join('') %}
VALUE ->
    VALUECHAR {% arr => arr[0] %}
  | VALUE VALUECHAR {% arr => arr.join('') %}
  | VALUE " " VALUECHAR {% arr => arr.join('') %}
  
VALUECHAR -> [a-zA-Z0-9\.\-] {% arr => arr[0] %}

COMMENT -> "#" [^\r\n]:+ {% (arr) => {return {type: 'comment', value: arr[1].join('')}} %}

_ -> [ \t]:*
