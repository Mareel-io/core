MAIN -> 
  STMT
  | MAIN SECTIONS

STMT ->
  null
  | STMT LINE {% (arr) => arr[0].concat(arr[1]) %}
  | STMT [\r\n] {% (arr) => arr[0] %}

LINE ->
  _ KVP {% (arr) => arr[1] %}
  | _ COMMENT {% (arr) => arr[1] %}

SECTIONS ->
  SECTIONMARK STMT {% (arr) => [arr[0], arr[2]] %}
  | SECTIONS "{" STMT "}" {% (arr) => [arr[0], [arr[2]]] %}

SECTIONMARK -> "[" KEY "]" {% (arr) => {return {section: arr[1]}} %}

KVP -> KEY _ "=" _ VALUE {% (arr) => {return {[arr[0]]: arr[4]}} %}

# Key and value
KEY -> [a-zA-Z_]:+ {% (arr) => arr[0].join('') %}
VALUE ->
    VALUECHAR {% arr => arr[0] %}
  | VALUE VALUECHAR {% arr => arr.join('') %}
  | VALUE " " VALUECHAR {% arr => arr.join('') %}
  
VALUECHAR -> [a-zA-Z0-9\.\-] {% arr => arr[0] %}

COMMENT -> "#" [^\r\n]:+ {% (arr) => {return {comment: arr[1].join('')}} %}

DELIM -> [\r\n]:+

_ -> [ \t]:*
