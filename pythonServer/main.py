from flask import Flask, request, jsonify
import re
from flask_cors import CORS

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
    (r'".*"', "STR"),
    (r"input", "INP"),
    (r"output", "OUT"),
    (r"clear", "CLEAR"),
]

app = Flask(__name__)
CORS(app)


class Lexer:
    def __init__(self, text):
        self.text = text
        self.tokens = []
        self.identifier_values = {}

    def tokenize(self):
        line_number = 1
        for line in self.text.split("\n"):
            tokens_line = []
            for match in re.finditer(
                "|".join(f"({pattern})" for pattern, _ in patterns), line
            ):
                for i, group in enumerate(match.groups()):
                    if group is not None:
                        token_type = patterns[i][1]
                        tokens_line.append((token_type, group, line_number))
                        break

            for i, token in enumerate(tokens_line):
                if (
                    token[0] == "IDEN"
                    and i + 2 < len(tokens_line)
                    and tokens_line[i + 1][0] == "ASSGN"
                ):
                    value_token = tokens_line[i + 2]
                    if value_token[0] in ["CTNUM", "STR", "IDEN"]:
                        self.identifier_values[token[1]] = value_token[1]

            self.tokens.extend(tokens_line)
            line_number += 1

    def get_tokens(self):
        return [
            {"type": token[0], "value": token[1], "line": token[2]}
            for token in self.tokens
        ]

    def get_identifiers_info(self):
        return [
            {
                "line": token[2],
                "type": token[0],
                "name": token[1],
                "value": self.identifier_values.get(token[1], None),
            }
            for token in self.tokens
            if token[0] == "IDEN"
        ]


@app.route("/tokenize", methods=["POST"])
def tokenize():
    data = request.get_json()
    text = data["code"]
    lex = Lexer(text)
    lex.tokenize()
    tokens = lex.get_tokens()
    identifiers = lex.get_identifiers_info()
    return jsonify(
        {
            "tokens": [
                {
                    "type": token["type"],
                    "value": token["value"],
                    "line": token["line"],
                }
                for token in tokens
            ],
            "identificadores": identifiers,
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
