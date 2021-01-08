MAIN -> 
  HEADER
  | MAIN DELIM SECTIONS

HEADER ->
  null
  | LINE {% (arr) => arr[0] %}
  | HEADER DELIM {% (arr) => arr[0] %}
  | HEADER DELIM LINE {% (arr) => [arr[0], arr[2]] %}
  
LINE ->
  _ KVP {% (arr) => arr[1] %}
  | _ COMMENT {% (arr) => arr[1] %}
  | _ KVP _ COMMENT {% (arr) => [arr[1], arr[3]] %}

SECTIONS ->
    SECTIONMARK DELIM HEADER {% (arr) => [arr[0], arr[2]] %}
  | SECTIONS "{" DELIM HEADER DELIM "}" {% (arr) => [arr[0], [arr[3]]] %}

SECTIONMARK -> "[" KEY "]" {% (arr) => {return {section: arr[1]}} %}

KVP -> KEY _ "=" _ VALUE {% (arr) => {return {[arr[0]]: arr[4]}} %}

# Key and value
KEY -> [a-zA-Z_]:+ {% (arr) => arr[0].join('') %}
VALUE ->
    VALUECHAR
  | VALUE VALUECHAR {% arr => arr.join('') %}
  | VALUE " " VALUECHAR {% arr => arr.join('') %}
  
VALUECHAR -> [a-zA-Z0-9\.\-] {% arr => arr[0] %}

COMMENT -> "#" [^\r\n]:+ {% (arr) => {return {comment: arr[1].join('')}} %}

DELIM -> [\r\n]:+

_ ->
    null
  | " " _
  | "\t" _
