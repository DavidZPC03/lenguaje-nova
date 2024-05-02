from ast import pattern
import re


class lexer:
    def __init__(self, text):
        self.text = text
        self.tokens = []

    def tokenize(self):
        patterns = [
            (r"[0-9]+", "CNNUM"),
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
        ]

        combined_patterns = "|".join(f"({pattern})" for pattern, _ in patterns)

        for match in re.finditer(combined_patterns, self.text):
            for i, group in enumerate(match.groups()):
                if group is not None:
                    self.tokens.append((group, patterns[i][1]))
                    break

    def get_tokens(self):
        return self.tokens


text = "case x = 5; switch x { case 5: break; default: break; } catch (e) { if (e) { for (let i = 0; i < 5; i++) { continue; } } else { return; } }"
lx = lexer(text)
lx.tokenize()
tokens = lx.get_tokens()
