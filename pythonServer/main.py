from flask import Flask, request, jsonify
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


class Lexer:
    def __init__(self, text):
        self.text = text
        self.tokens = []

    def tokenize(self):
        patterns = [
            (r"[0-9]+", "CTNUM"),
            (r"case", "CASE"),
            (r"switch", "SWTCH"),
            (r"break", "BRK"),
            (r"try", "TRY"),
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
            (r"[a-zA-Z_][a-zA-Z0-9_]*", "IDEN"),
            (r"[ \t\n]+", "WHT"),
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
            (r"[/]", "AOP/"),
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
            (r'".*"', "STRING"),
        ]

        line_number = 1  # Contador de líneas
        for line in self.text.split("\n"):
            for match in re.finditer(
                "|".join(f"({pattern})" for pattern, _ in patterns), line
            ):
                for i, group in enumerate(match.groups()):
                    if group is not None:
                        # Añadir el número de línea al token
                        self.tokens.append((patterns[i][1], match.start(), line_number))
                        break
            line_number += 1

    def get_tokens(self):
        return self.tokens


@app.route("/tokenize", methods=["POST"])
def tokenize():
    data = request.get_json()
    text = data["code"]
    lex = Lexer(text)
    lex.tokenize()
    tokens = lex.get_tokens()
    # Modificar la salida para incluir el número de línea
    return jsonify(
        {
            "tokens": [
                {"type": token[0], "position": token[1], "line": token[2]}
                for token in tokens
            ]
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
