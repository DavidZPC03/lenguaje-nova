from flask import Flask, request, jsonify
import re
from flask_cors import CORS

patterns = [
    (r"[\+\-]?[0-9]+\.[0-9]+", "NUMDB"),
    (r"[\+\-]?[0-9]+", "NUMINT"),
    (r"\bcase\b", "CASE"),
    (r"\bswitch\b", "SWTCH"),
    (r"\bbreak\b", "BRK"),
    (r"\btry\b", "TRY"),
    (r"\binput\b", "INP"),
    (r"\boutput\b", "OUT"),
    (r"\bclear\b", "CLEAR"),
    (r"\bint\b", "TPINT"),
    (r"\bstring\b", "TPSTR"),
    (r"\bdouble\b", "TPDBL"),
    (r"\bcatch\b", "CTCH"),
    (r"\bif\b", "IF"),
    (r"\belse\b", "ELSE"),
    (r"\belseif\b", "ELIF"),
    (r"\bfor\b", "FOR"),
    (r"\bwhile\b", "WHI"),
    (r"\bdo\b", "DO"),
    (r"\bcontinue\b", "CNTN"),
    (r"\breturn\b", "RTRN"),
    (r"\bfunction\b", "FCTN"),
    (r"\b[_][a-zA-Z_][a-zA-Z0-9_]*\b", "IDEN"),
    (r"[;]", "CH;"),
    (r"[,]", "CH,"),
    (r"[.]", "CH."),
    (r"[(]", "CH("),
    (r"[)]", "CH)"),
    (r"[{]", "CH{"),
    (r"[}]", "CH}"),
    (r"[=]", "ASSGN"),
    (r"[+]", "AOP+"),
    (r"[-]", "AOP-"),
    (r"[*]", "AOP*"),
    (r"[<]", "ROP<"),
    (r"[>]", "ROP>"),
    (r"[!]", "LOP!"),
    (r"[&]", "LOP&"),
    (r"[|]", "LOP|"),
    (r"[:]", "CH:"),
    (r"==", "ROP=="),
    (r"!=", "ROP!="),
    (r"<=", "ROP<="),
    (r">=", "ROP>="),
    (r"\n", "BRKLN"),
    (r"//.*", "COMM"),
    (r'".*"', "STR"),
]

app = Flask(__name__)
CORS(app)

error_messages = {
    'INVALID_IDEN': "Identificador no válido",
    'INVALID_KEYWORD': "Palabra reservada no válida",
    'INVALID_NUMINT': "Constante numérica entera no válida",
    'INVALID_NUMDB': "Constante numérica flotante no válida",
    'INVALID_NUMEXP': "Constante numérica con exponente no válida",
    'INVALID_OPERATOR': "Operadores aritméticos no válidos",
    'INVALID_STRING': "Cadena no válida",
    'INVALID_COMMENT': "Comentario no válido",
    'SYNTAX_ERROR': "Error de sintaxis"
}

valid_keywords = {
    'CASE', 'SWTCH', 'BRK', 'TRY', 'INP', 'OUT', 'CLEAR', 
    'TPINT', 'TPSTR', 'TPDBL', 'CTCH', 'IF', 'ELSE', 'ELIF', 
    'FOR', 'WHI', 'DO', 'CNTN', 'RTRN', 'FCTN'
}

class Lexer:
    def __init__(self, text):
        self.text = text
        self.tokens = []
        self.errors = []
        self.identifier_values = {}
        self.identifier_counter = 1
        self.identifier_map = {}

    def tokenize(self):
        line_number = 1
        last_token_type = None
        for line in self.text.split("\n"):
            tokens_line = []
            last_end = 0
            for match in re.finditer("|".join(f"({pattern})" for pattern, _ in patterns), line):
                start, end = match.span()
                if start > last_end:
                    # Capturar errores no reconocidos
                    unrecognized_text = line[last_end:start].strip()
                    if unrecognized_text:
                        self.errors.append({
                            'line': line_number,
                            'type': 'ERROR',
                            'message': f"Token o identificador inesperado: {unrecognized_text}"
                        })
                last_end = end
                for i, group in enumerate(match.groups()):
                    if group is not None:
                        token_type = patterns[i][1]
                        if token_type == "IDEN":
                            if group not in self.identifier_map:
                                self.identifier_map[group] = self.identifier_counter
                                self.identifier_counter += 1
                            token_type = f"IDEN{self.identifier_map[group]}"
                        tokens_line.append({"type": token_type, "value": group, "line": line_number})
                        if token_type.startswith("TP"):
                            last_token_type = group
                        break

            # Detectar cualquier texto no reconocido después del último token
            if last_end < len(line):
                unrecognized_text = line[last_end:].strip()
                if unrecognized_text:
                    self.errors.append({
                        'line': line_number,
                        'type': 'SYNTAX_ERROR',
                        'message': f"Texto no reconocido: {unrecognized_text}"
                    })

            for i, token in enumerate(tokens_line):
                if token["type"].startswith("IDEN"):
                    if last_token_type:
                        self.identifier_values[token["value"]] = {
                            "type": last_token_type,
                            "value": None,
                        }
                        last_token_type = None
                    if i + 2 < len(tokens_line) and tokens_line[i + 1]["type"] == "ASSGN":
                        value_token = tokens_line[i + 2]
                        if value_token["type"] in ["NUMINT", "STR", "IDEN", "NUMDB"]:
                            if token["value"] in self.identifier_values:
                                self.identifier_values[token["value"]]["value"] = value_token["value"]
                            else:
                                self.identifier_values[token["value"]] = {
                                    "type": None,
                                    "value": value_token["value"],
                                }

            self.tokens.extend(tokens_line)
            line_number += 1

    def get_tokens(self):
        return self.tokens

    def get_identifiers_info(self):
        last_identifiers = {}
        for token in self.tokens:
            if token["type"].startswith("IDEN") and token["value"] in self.identifier_values:
                identifier_info = self.identifier_values[token["value"]]
                identifier_info["line"] = token["line"]
                last_identifiers[token["value"]] = {
                    "line": identifier_info["line"],
                    "type": identifier_info["type"],
                    "name": token["value"],
                    "value": identifier_info["value"],
                }
        return list(last_identifiers.values())

    def detect_errors(self):
        for token in self.tokens:
            if token['type'].startswith('IDEN') and not token['value'].startswith('_'):
                self.errors.append({
                    'line': token['line'],
                    'type': 'INVALID_IDEN',
                    'message': error_messages['INVALID_IDEN']
                })
            elif token['type'] not in valid_keywords and not token['type'].startswith('IDEN'):
                if re.match(r'^[a-zA-Z_]\w*$', token['value']) and token['value'] not in valid_keywords:
                    self.errors.append({
                        'line': token['line'],
                        'type': 'INVALID_KEYWORD',
                        'message': error_messages['INVALID_KEYWORD']
                    })
            elif token['type'] == 'NUMINT' and re.search(r'[a-zA-Z]', token['value']):
                self.errors.append({
                    'line': token['line'],
                    'type': 'INVALID_NUMINT',
                    'message': error_messages['INVALID_NUMINT']
                })
            elif token['type'] == 'NUMDB' and re.search(r'[a-zA-Z]', token['value']):
                self.errors.append({
                    'line': token['line'],
                    'type': 'INVALID_NUMDB',
                    'message': error_messages['INVALID_NUMDB']
                })
            elif token['type'].startswith('AOP') and re.search(r'[^\+\-\*/]', token['value']):
                self.errors.append({
                    'line': token['line'],
                    'type': 'INVALID_OPERATOR',
                    'message': error_messages['INVALID_OPERATOR']
                })
            elif token['type'] == 'STR' and re.search(r'\b(case|switch|break|try|input|output|clear|int|string|double|catch|if|else|elseif|for|while|do|continue|return|function)\b', token['value']):
                self.errors.append({
                    'line': token['line'],
                    'type': 'INVALID_STRING',
                    'message': error_messages['INVALID_STRING']
                })
            elif token['type'] == 'COMM' and not re.match(r'//.*', token['value']):
                self.errors.append({
                    'line': token['line'],
                    'type': 'INVALID_COMMENT',
                    'message': error_messages['INVALID_COMMENT']
                })
        return self.errors


@app.route("/tokenize", methods=["POST"])
def tokenize():
    data = request.get_json()
    text = data["code"]
    lex = Lexer(text)
    lex.tokenize()
    tokens = lex.get_tokens()
    identifiers = lex.get_identifiers_info()
    errors = lex.detect_errors()
    print("Errors detected: ", errors)
    return jsonify({"identificadores": identifiers, "tokens": tokens, "errores": errors})


if __name__ == "__main__":
    app.run(debug=True)
