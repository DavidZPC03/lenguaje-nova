from flask import Flask, request, jsonify
from ast import pattern
import re
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


class lexer:
    def __init__(self, text):
        self.text = text
        self.tokens = []

    def tokenize(self):
        patterns = [
            (r"[0-9]+", "NUMBER"),
            (r"case", "CASE"),
            (r"switch", "SWITCH"),
            (r"break", "BREAK"),
            (r"catch", "CATCH"),
            (r"if", "IF"),
            (r"else", "ELSE"),
            (r"for", "FOR"),
            (r"while", "WHILE"),
            (r"do", "DO"),
            (r"continue", "CONTINUE"),
            (r"return", "RETURN"),
            (r"function", "FUNCTION"),
            (r"var", "VAR"),
            (r"let", "LET"),
            (r"const", "CONST"),
            (r"new", "NEW"),
            (r"[a-zA-Z_][a-zA-Z0-9_]*", "IDENTIFIER"),
            (r"[ \t\n]+", "WHITESPACE"),
            (r"[;]", "SEMICOLON"),
            (r"[,]", "COMMA"),
            (r"[.]", "DOT"),
            (r"[()]", "PARENTHESIS"),
            (r"[{}]", "BRACES"),
            (r"[=]", "ASSIGNMENT"),
            (r"[+]", "PLUS"),
            (r"[-]", "MINUS"),
            (r"[*]", "MULTIPLICATION"),
            (r"[/]", "DIVISION"),
            (r"[<]", "LESS_THAN"),
            (r"[>]", "GREATER_THAN"),
            (r"[!]", "NOT"),
            (r"[&]", "AND"),
            (r"[|]", "OR"),
            (r"[?]", "TERNARY"),
            (r"[:]", "COLON"),
            (r"==", "EQUALS"),
            (r"!=", "NOT_EQUALS"),
            (r"<=", "LESS_THAN_OR_EQUAL"),
            (r">=", "GREATER_THAN_OR_EQUAL"),
            (r"\+\+", "INCREMENT"),
            (r"--", "DECREMENT"),
            (r"\+\=", "PLUS_ASSIGNMENT"),
            (r"\-=", "MINUS_ASSIGNMENT"),
            (r"\*=", "MULTIPLICATION_ASSIGNMENT"),
            (r"/=", "DIVISION_ASSIGNMENT"),
            (r"&&", "AND"),
            (r"\|\|", "OR"),
            (r"\+\+", "INCREMENT"),
            (r"--", "DECREMENT"),
            (r"===", "STRICT_EQUALS"),
            (r"\n", "BREAKLINE"),
        ]

        combined_patterns = "|".join(f"({pattern})" for pattern, _ in patterns)

       # Procesar todo el texto y no solo línea por línea para mantener indentación
        current_indent = 0
        for line in self.text.split('\n'):
            indent = len(line) - len(line.lstrip())
            if indent > current_indent:
                self.tokens.append(("INDENT", indent))
            elif indent < current_indent:
                self.tokens.append(("DEDENT", indent))
            current_indent = indent

            for match in re.finditer(combined_patterns, line.strip()):
                for i, group in enumerate(match.groups()):
                    if group is not None:
                        self.tokens.append((patterns[i][1], current_indent))
                        break

    def get_tokens(self):
        return self.tokens


@app.route("/tokenize", methods=["POST"])
def tokenize():
    data = request.get_json()
    text = data["code"]
    lex = lexer(text)
    lex.tokenize()
    tokens = lex.get_tokens()
    return jsonify({"tokens": [{"type": token[0], "indent": token[1]} for token in tokens]})

if __name__ == "__main__":
    app.run(debug=True)
