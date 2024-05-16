from flask import Flask, request, jsonify
import re
from flask_cors import CORS

patterns = [
    # NUMDB +
    (r"[\+\-]?[0-9]+\.[0-9]+", "NUMDB"),
    (r"[\+\-]?[0-9]+", "NUMINT"),
    (r"case", "CASE"),
    (r"switch", "SWTCH"),
    (r"break", "BRK"),
    (r"try", "TRY"),
    (r"input", "INP"),
    (r"output", "OUT"),
    (r"clear", "CLEAR"),
    (r"int", "TPINT"),
    (r"string", "TPSTR"),
    (r"double", "TPDBL"),
    (r"catch", "CTCH"),
    (r"if", "IF"),
    (r"else", "ELSE"),
    (r"elseif", "ELIF"),
    (r"for", "FOR"),
    (r"while", "WHI"),
    (r"do", "DO"),
    (r"continue", "CNTN"),
    (r"return", "RTRN"),
    (r"function", "FCTN"),
    # identificadores que empiecen con gion bajo
    (r"[_][a-zA-Z_][a-zA-Z0-9_]*", "IDEN"),
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


class Lexer:
    def __init__(self, text):
        self.text = text
        self.tokens = []
        self.identifier_values = {}
        self.identifier_counter = 1  # Inicializa el contador de identificadores
        self.identifier_map = {}  # Mapea identificadores a su ID único

    def tokenize(self):
        line_number = 1
        last_token_type = None  # Almacena el último tipo de token encontrado
        for line in self.text.split("\n"):
            tokens_line = []
            for match in re.finditer(
                "|".join(f"({pattern})" for pattern, _ in patterns), line
            ):
                for i, group in enumerate(match.groups()):
                    if group is not None:
                        token_type = patterns[i][1]
                        # Modifica el tipo de token para identificadores únicos
                        if token_type == "IDEN":
                            if group not in self.identifier_map:
                                # Asigna un ID único al identificador y actualiza el contador
                                self.identifier_map[group] = self.identifier_counter
                                self.identifier_counter += 1
                            token_type = f"IDEN{self.identifier_map[group]}"
                        tokens_line.append((token_type, group, line_number))
                        # Captura el tipo de dato si el token actual es de tipo
                        if token_type.startswith("TP"):
                            last_token_type = group  # Almacena el tipo de dato como el último tipo encontrado
                        break

            for i, token in enumerate(tokens_line):
                if token[0].startswith("IDEN"):
                    # Si el token anterior es un tipo de dato, almacena el tipo y el valor (si está presente)
                    if last_token_type:
                        self.identifier_values[token[1]] = {
                            "type": last_token_type,
                            "value": None,
                        }
                        last_token_type = None  # Restablece el último tipo de dato
                    # Captura el valor si el siguiente token es un asignador
                    if i + 2 < len(tokens_line) and tokens_line[i + 1][0] == "ASSGN":
                        value_token = tokens_line[i + 2]
                        if value_token[0] in ["NUMINT", "STR", "IDEN", "NUMDB"]:
                            if token[1] in self.identifier_values:
                                self.identifier_values[token[1]]["value"] = value_token[
                                    1
                                ]
                            else:
                                self.identifier_values[token[1]] = {
                                    "type": None,
                                    "value": value_token[1],
                                }

            self.tokens.extend(tokens_line)
            line_number += 1

    def get_tokens(self):
        return [
            {"type": token[0], "value": token[1], "line": token[2]}
            for token in self.tokens
        ]

    def get_identifiers_info(self):
        last_identifiers = {}
        for token in self.tokens:
            if token[0].startswith("IDEN") and token[1] in self.identifier_values:
                identifier_info = self.identifier_values[token[1]]
                # Actualiza la información del identificador con la línea actual del token
                identifier_info["line"] = token[2]
                last_identifiers[token[1]] = {
                    "line": identifier_info["line"],
                    "type": identifier_info["type"],
                    "name": token[1],
                    "value": identifier_info["value"],
                }
        return list(last_identifiers.values())


@app.route("/tokenize", methods=["POST"])
def tokenize():
    data = request.get_json()
    text = data["code"]
    lex = Lexer(text)
    lex.tokenize()
    tokens = lex.get_tokens()
    identifiers = lex.get_identifiers_info()

    return jsonify({"identificadores": identifiers, "tokens": tokens, "errores": []})


if __name__ == "__main__":
    app.run(debug=True)
