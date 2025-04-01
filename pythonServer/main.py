from flask import Flask, request, jsonify
import re
from flask_cors import CORS

# Definición de patrones para el lexer (sin switch, endfor, endif)
patterns = [
    (r"[\+\-]?[0-9]+\.[0-9]+", "NUMDB"),
    (r"[\+\-]?[0-9]+", "NUMINT"),
    (r"\btrue\b", "TRUE"),
    (r"\bfalse\b", "FALSE"),
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
    (r"\b[a-zA-Z_][a-zA-Z0-9_]*\b", "IDEN"),  # Modificado para detectar cualquier identificador
    (r"[;]", "CH;"),
    (r"[,]", "CH,"),
    (r"[.]", "CH."),
    (r"[(]", "CH("),
    (r"[)]", "CH)"),
    (r"[{]", "CH{"),
    (r"[}]", "CH}"),
    (r"[\[]", "CH["),
    (r"[\]]", "CH]"),
    (r"[=]", "ASSGN"),
    (r"[+]", "AOP+"),
    (r"[-]", "AOP-"),
    (r"[*]", "AOP*"),
    (r"[/]", "AOP/"),
    (r"[%]", "AOP%"),  # Operador de módulo (para generar error)
    (r"[<]", "ROP<"),
    (r"[>]", "ROP>"),
    (r"[!]", "LOP!"),
    (r"[&]", "LOP&"),
    (r"[|]", "LOP|"),
    (r"==", "ROP=="),
    (r"!=", "ROP!="),
    (r"<=", "ROP<="),
    (r">=", "ROP>="),
    (r"\+\+", "AOP++"),  # Operador de incremento (para generar error)
    (r"--", "AOP--"),    # Operador de decremento (para generar error)
    (r"\+=", "AOPASSGN"),  # Operador de asignación compuesta (para generar error)
    (r"\n", "BRKLN"),
    (r"//.*", "COMM"),
    (r'".*"', "STR"),
]

app = Flask(__name__)
CORS(app)

# Mensajes de error
error_messages = {
    'INVALID_IDEN': "Identificador no válido (debe comenzar con _)",
    'INVALID_KEYWORD': "Palabra reservada no válida",
    'INVALID_NUMINT': "Constante numérica entera no válida",
    'INVALID_NUMDB': "Constante numérica flotante no válida",
    'INVALID_NUMEXP': "Constante numérica con exponente no válida",
    'INVALID_OPERATOR': "Operador aritmético no válido",
    'INVALID_STRING': "Cadena no válida",
    'INVALID_COMMENT': "Comentario no válido",
    'SYNTAX_ERROR': "Error de sintaxis",
    'TYPE_MISMATCH': "Tipos incompatibles en operación",
    'INCOMPLETE_CONDITION': "Condición incompleta en estructura de control",
    'FUNCTION_RETURN_TYPE_MISMATCH': "Tipo de retorno incompatible con la declaración de función",
    'INCOMPLETE_OUTPUT': "Función output incompleta (faltan paréntesis o comillas)",
    'INCOMPLETE_INPUT': "Función input incompleta (faltan paréntesis)"
}

# Palabras reservadas válidas
valid_keywords = {
    'TRY', 'INP', 'OUT', 'CLEAR', 
    'TPINT', 'TPSTR', 'TPDBL', 'CTCH', 'IF', 'ELSE', 'ELIF', 
    'FOR', 'WHI', 'DO', 'CNTN', 'RTRN', 'FCTN', 'TRUE', 'FALSE'
}

# Mapeo de tipos para normalizar nombres de tipos
type_mapping = {
    'int': 'entero',
    'double': 'decimal',
    'string': 'cadena',
    'boolean': 'booleano',
    'char': 'caracter'
}

# Función para normalizar nombres de tipos
def normalize_type(type_name):
    return type_mapping.get(type_name, type_name)

# Función para verificar compatibilidad de tipos
def are_types_compatible(type1, type2):
    # Normalizar tipos
    type1 = normalize_type(type1)
    type2 = normalize_type(type2)
    
    # Mismo tipo
    if type1 == type2:
        return True
    
    # Conversiones permitidas
    if type1 == 'decimal' and type2 == 'entero':
        return True
    
    if type1 == 'cadena' and type2 == 'caracter':
        return True
    
    return False

# Clase Lexer
class Lexer:
    def __init__(self, text):
        self.text = text
        self.tokens = []
        self.errors = []
        self.identifier_values = {}
        self.identifier_counter = 1
        self.identifier_map = {}
        self.function_return_types = {}  # Para almacenar tipos de retorno de funciones

    def tokenize(self):
        line_number = 1
        last_token_type = None
        for line in self.text.split("\n"):
            tokens_line = []
            last_end = 0
            for match in re.finditer("|".join(f"({pattern})" for pattern, _ in patterns), line):
                start, end = match.span()
                if start > last_end:
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
                            tokens_line.append({
                                "type": "IDEN", 
                                "id": self.identifier_map[group], 
                                "value": group, 
                                "line": line_number
                            })
                        else:
                            tokens_line.append({"type": token_type, "value": group, "line": line_number})
                        if token_type.startswith("TP"):
                            last_token_type = group
                        break

            if last_end < len(line):
                unrecognized_text = line[last_end:].strip()
                if unrecognized_text:
                    self.errors.append({
                        'line': line_number,
                        'type': 'SYNTAX_ERROR',
                        'message': f"Texto no reconocido: {unrecognized_text}"
                    })

            for i, token in enumerate(tokens_line):
                if token["type"] == "IDEN":
                    if last_token_type:
                        self.identifier_values[token["value"]] = {
                            "type": last_token_type,
                            "value": None,
                        }
                        last_token_type = None
                    if i + 2 < len(tokens_line) and tokens_line[i + 1]["type"] == "ASSGN":
                        value_token = tokens_line[i + 2]
                        if value_token["type"] in ["NUMINT", "STR", "IDEN", "NUMDB", "TRUE", "FALSE"]:
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
            if token["type"] == "IDEN" and token["value"] in self.identifier_values:
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
        errors = []
        
        # Verificar operadores no válidos
        for i, token in enumerate(self.tokens):
            # Detectar operadores no soportados de forma individual
            if token['type'] == 'AOP%':
                errors.append({
                    'line': token['line'],
                    'type': 'INVALID_OPERATOR',
                    'message': f"Operador {token['value']} no soportado",
                })
            elif token['type'] == 'AOP++':
                errors.append({
                    'line': token['line'],
                    'type': 'INVALID_OPERATOR',
                    'message': f"Operador {token['value']} no soportado",
                })
            elif token['type'] == 'AOP--':
                errors.append({
                    'line': token['line'],
                    'type': 'INVALID_OPERATOR',
                    'message': f"Operador {token['value']} no soportado",
                })
            elif token['type'] == 'AOPASSGN':
                errors.append({
                    'line': token['line'],
                    'type': 'INVALID_OPERATOR',
                    'message': f"Operador {token['value']} no soportado",
                })
            
            # Verificar operaciones aritméticas con tipos incompatibles
            if token['type'].startswith('AOP') and i > 0 and i + 1 < len(self.tokens):
                left_operand = self.tokens[i-1]
                right_operand = self.tokens[i+1]
                
                left_type = None
                right_type = None
                
                # Determinar tipo del operando izquierdo
                if left_operand['type'] == 'NUMINT':
                    left_type = 'entero'
                elif left_operand['type'] == 'NUMDB':
                    left_type = 'decimal'
                elif left_operand['type'] == 'STR':
                    left_type = 'cadena'
                elif left_operand['type'] == 'IDEN':
                    var_name = left_operand['value']
                    if var_name in self.identifier_values and self.identifier_values[var_name]['type']:
                        left_type = normalize_type(self.identifier_values[var_name]['type'])
                
                # Determinar tipo del operando derecho
                if right_operand['type'] == 'NUMINT':
                    right_type = 'entero'
                elif right_operand['type'] == 'NUMDB':
                    right_type = 'decimal'
                elif right_operand['type'] == 'STR':
                    right_type = 'cadena'
                elif right_operand['type'] == 'IDEN':
                    var_name = right_operand['value']
                    if var_name in self.identifier_values and self.identifier_values[var_name]['type']:
                        right_type = normalize_type(self.identifier_values[var_name]['type'])
                
                # Verificar compatibilidad de tipos
                if left_type and right_type and not are_types_compatible(left_type, right_type):
                    errors.append({
                        'line': token['line'],
                        'type': 'TYPE_MISMATCH',
                        'message': f"Tipos incompatibles en operación aritmética: '{left_type}' {token['value']} '{right_type}'",
                    })
        
        # Verificar asignaciones a variables
        for i, token in enumerate(self.tokens):
            if token['type'] == 'IDEN' and i + 1 < len(self.tokens) and self.tokens[i + 1]['type'] == 'ASSGN':
                var_name = token['value']
                
                # Buscar el tipo de la variable
                var_type = None
                if var_name in self.identifier_values and self.identifier_values[var_name]['type']:
                    var_type = normalize_type(self.identifier_values[var_name]['type'])
                
                # Verificar tipo de asignación
                if var_type and i + 2 < len(self.tokens):
                    value_token = self.tokens[i + 2]
                    value_type = None
                    
                    # Determinar tipo del valor asignado
                    if value_token['type'] == 'NUMINT':
                        value_type = 'entero'
                    elif value_token['type'] == 'NUMDB':
                        value_type = 'decimal'
                    elif value_token['type'] == 'STR':
                        value_type = 'cadena'
                    elif value_token['type'] == 'IDEN':
                        other_var = value_token['value']
                        if other_var in self.identifier_values and self.identifier_values[other_var]['type']:
                            value_type = normalize_type(self.identifier_values[other_var]['type'])
                    
                    # Verificar compatibilidad de tipos
                    if var_type and value_type and not are_types_compatible(var_type, value_type):
                        errors.append({
                            'line': token['line'],
                            'type': 'TYPE_MISMATCH',
                            'message': f"Tipo incompatible: variable '{var_name}' es de tipo '{var_type}' pero se le asigna un valor de tipo '{value_type}'",
                        })
        
        # Verificar variables y otros errores
        for token in self.tokens:
            if token['type'] == 'IDEN' and not token['value'].startswith('_'):
                # Verificar si ya existe un error para esta variable en esta línea
                existing_error = any(
                    e['type'] == 'INVALID_IDEN' and 
                    e['line'] == token['line'] and 
                    e.get('variable') == token['value'] 
                    for e in errors
                )
            
                if not existing_error:
                    errors.append({
                        'line': token['line'],
                        'type': 'INVALID_IDEN',
                        'message': error_messages['INVALID_IDEN'],
                        'variable': token['value']
                    })
            elif token['type'] not in valid_keywords and token['type'] != 'IDEN':
                if re.match(r'^[a-zA-Z_]\w*$', token['value']) and token['value'] not in valid_keywords:
                    errors.append({
                        'line': token['line'],
                        'type': 'INVALID_KEYWORD',
                        'message': error_messages['INVALID_KEYWORD']
                    })
            elif token['type'] == 'NUMINT' and re.search(r'[a-zA-Z]', token['value']):
                errors.append({
                    'line': token['line'],
                    'type': 'INVALID_NUMINT',
                    'message': error_messages['INVALID_NUMINT']
                })
            elif token['type'] == 'NUMDB' and re.search(r'[a-zA-Z]', token['value']):
                errors.append({
                    'line': token['line'],
                    'type': 'INVALID_NUMDB',
                    'message': error_messages['INVALID_NUMDB']
                })
            elif token['type'].startswith('AOP') and re.search(r'[^\+\-\*/]', token['value']):
                errors.append({
                    'line': token['line'],
                    'type': 'INVALID_OPERATOR',
                    'message': error_messages['INVALID_OPERATOR']
                })
            elif token['type'] == 'STR' and re.search(r'\b(try|input|output|clear|int|string|double|catch|if|else|elseif|for|while|do|continue|return|function)\b', token['value']):
                errors.append({
                    'line': token['line'],
                    'type': 'INVALID_STRING',
                    'message': error_messages['INVALID_STRING']
                })
            elif token['type'] == 'COMM' and not re.match(r'//.*', token['value']):
                errors.append({
                    'line': token['line'],
                    'type': 'INVALID_COMMENT',
                    'message': error_messages['INVALID_COMMENT']
                })

        # Verificar estructuras de control incompletas
        i = 0
        while i < len(self.tokens):
            token = self.tokens[i]
            
            # Verificar estructura IF
            if token['type'] == 'IF':
                # Verificar si hay una condición completa
                if i + 3 >= len(self.tokens) or self.tokens[i+1]['type'] != 'CH(' or 'CH)' not in [t['type'] for t in self.tokens[i+1:i+10]]:
                    errors.append({
                        'line': token['line'],
                        'type': 'INCOMPLETE_CONDITION',
                        'message': "Condición incompleta en estructura IF"
                    })
            
            # Verificar estructura FOR
            elif token['type'] == 'FOR':
                # Verificar si tiene los tres componentes: inicialización, condición, incremento
                if i + 5 >= len(self.tokens) or self.tokens[i+1]['type'] != 'CH(' or 'CH)' not in [t['type'] for t in self.tokens[i+1:i+20]]:
                    errors.append({
                        'line': token['line'],
                        'type': 'INCOMPLETE_CONDITION',
                        'message': "Estructura FOR incompleta (debe tener inicialización, condición e incremento)"
                    })
                else:
                    # Buscar los dos puntos y coma que separan las tres partes
                    semicolons = 0
                    for j in range(i+2, i+20):
                        if j < len(self.tokens) and self.tokens[j]['type'] == 'CH;':
                            semicolons += 1
                    
                    if semicolons < 2:
                        errors.append({
                            'line': token['line'],
                            'type': 'INCOMPLETE_CONDITION',
                            'message': "Estructura FOR incompleta (faltan componentes)"
                        })
            
            # Verificar estructura WHILE
            elif token['type'] == 'WHI':
                if i + 3 >= len(self.tokens) or self.tokens[i+1]['type'] != 'CH(' or 'CH)' not in [t['type'] for t in self.tokens[i+1:i+10]]:
                    errors.append({
                        'line': token['line'],
                        'type': 'INCOMPLETE_CONDITION',
                        'message': "Condición incompleta en estructura WHILE"
                    })
            
            # Verificar funciones con retorno
            elif token['type'] == 'FCTN' and i + 3 < len(self.tokens):
                # Verificar si la función tiene tipo de retorno
                if self.tokens[i+1]['type'].startswith('TP'):
                    return_type = self.tokens[i+1]['value']
                    if i + 2 < len(self.tokens) and self.tokens[i+2]['type'] == 'IDEN':
                        function_name = self.tokens[i+2]['value']
                        self.function_return_types[function_name] = return_type
                
                # Verificar si hay paréntesis para los parámetros
                if i + 4 >= len(self.tokens) or self.tokens[i+3]['type'] != 'CH(' or 'CH)' not in [t['type'] for t in self.tokens[i+3:i+15]]:
                    errors.append({
                        'line': token['line'],
                        'type': 'SYNTAX_ERROR',
                        'message': "Declaración de función incompleta (faltan paréntesis para parámetros)"
                    })
            
            # Verificar instrucciones RETURN
            elif token['type'] == 'RTRN' and i + 1 < len(self.tokens):
                # Buscar en qué función estamos
                current_function = None
                current_function_type = None
                
                # Buscar hacia atrás para encontrar la función actual
                for j in range(i-1, -1, -1):
                    if self.tokens[j]['type'] == 'FCTN' and j + 2 < len(self.tokens) and self.tokens[j+2]['type'] == 'IDEN':
                        current_function = self.tokens[j+2]['value']
                        if self.tokens[j+1]['type'].startswith('TP'):
                            current_function_type = self.tokens[j+1]['value']
                        break
                
                # Verificar si el tipo de retorno coincide con el tipo de la función
                if current_function and current_function_type:
                    return_value_token = self.tokens[i+1]
                    return_value_type = None
                    
                    if return_value_token['type'] == 'NUMINT':
                        return_value_type = 'entero'
                    elif return_value_token['type'] == 'NUMDB':
                        return_value_type = 'decimal'
                    elif return_value_token['type'] == 'STR':
                        return_value_type = 'cadena'
                    elif return_value_token['type'] == 'TRUE' or return_value_token['type'] == 'FALSE':
                        return_value_type = 'booleano'
                    elif return_value_token['type'] == 'IDEN':
                        # Buscar el tipo de la variable
                        var_name = return_value_token['value']
                        if var_name in self.identifier_values and self.identifier_values[var_name]['type']:
                            return_value_type = normalize_type(self.identifier_values[var_name]['type'])
                    
                    if return_value_type and not are_types_compatible(normalize_type(current_function_type), return_value_type):
                        errors.append({
                            'line': token['line'],
                            'type': 'FUNCTION_RETURN_TYPE_MISMATCH',
                            'message': f"Tipo de retorno '{return_value_type}' incompatible con el tipo de función '{normalize_type(current_function_type)}'"
                        })
            
            # Verificar funciones output e input
            elif token['type'] == 'OUT':
                # Verificar si hay paréntesis de apertura
                if i + 1 >= len(self.tokens) or self.tokens[i+1]['type'] != 'CH(':
                    errors.append({
                        'line': token['line'],
                        'type': 'INCOMPLETE_OUTPUT',
                        'message': "Función output incompleta (falta paréntesis de apertura)"
                    })
                else:
                    # Verificar si hay paréntesis de cierre
                    has_closing_paren = False
                    has_string = False
                    for j in range(i+2, min(i+10, len(self.tokens))):
                        if self.tokens[j]['type'] == 'CH)':
                            has_closing_paren = True
                            break
                        if self.tokens[j]['type'] == 'STR':
                            has_string = True
                    
                    if not has_closing_paren:
                        errors.append({
                            'line': token['line'],
                            'type': 'INCOMPLETE_OUTPUT',
                            'message': "Función output incompleta (falta paréntesis de cierre)"
                        })
                    elif not has_string and i + 2 < len(self.tokens) and self.tokens[i+2]['type'] != 'STR' and self.tokens[i+2]['type'] != 'IDEN':
                        errors.append({
                            'line': token['line'],
                            'type': 'INCOMPLETE_OUTPUT',
                            'message': "Función output debe recibir una cadena o variable"
                        })
            
            elif token['type'] == 'INP':
                # Verificar si hay paréntesis de apertura
                if i + 1 >= len(self.tokens) or self.tokens[i+1]['type'] != 'CH(':
                    errors.append({
                        'line': token['line'],
                        'type': 'INCOMPLETE_INPUT',
                        'message': "Función input incompleta (falta paréntesis de apertura)"
                    })
                else:
                    # Verificar si hay paréntesis de cierre
                    has_closing_paren = False
                    for j in range(i+2, min(i+10, len(self.tokens))):
                        if self.tokens[j]['type'] == 'CH)':
                            has_closing_paren = True
                            break
                    
                    if not has_closing_paren:
                        errors.append({
                            'line': token['line'],
                            'type': 'INCOMPLETE_INPUT',
                            'message': "Función input incompleta (falta paréntesis de cierre)"
                        })
            
            i += 1

        # Verificar equilibrio de símbolos
        symbol_counts = {
            'llave': {'open': 0, 'close': 0},
            'paréntesis': {'open': 0, 'close': 0},
            'corchete': {'open': 0, 'close': 0}
        }
        
        for token in self.tokens:
            if token['type'] == 'CH{':
                symbol_counts['llave']['open'] += 1
            elif token['type'] == 'CH}':
                symbol_counts['llave']['close'] += 1
            elif token['type'] == 'CH(':
                symbol_counts['paréntesis']['open'] += 1
            elif token['type'] == 'CH)':
                symbol_counts['paréntesis']['close'] += 1
            elif token['type'] == 'CH[':
                symbol_counts['corchete']['open'] += 1
            elif token['type'] == 'CH]':
                symbol_counts['corchete']['close'] += 1
        
        for symbol, counts in symbol_counts.items():
            if counts['open'] != counts['close']:
                errors.append({
                    'line': 0,  # Error global
                    'type': 'SYMBOL_IMBALANCE',
                    'message': f"Desequilibrio de {symbol}s: {counts['open']} abiertos, {counts['close']} cerrados"
                })

        # Eliminar errores duplicados
        unique_errors = []
        for error in errors:
            if not any(
                e['type'] == error['type'] and 
                e['line'] == error['line'] and 
                e.get('variable') == error.get('variable') and
                e.get('message') == error.get('message')
                for e in unique_errors
            ):
                unique_errors.append(error)

        self.errors = unique_errors
        return unique_errors

    def check_syntax(self):
        syntax_results = []
        code_lines = self.text.split('\n')
        
        for line_number in range(1, len(code_lines) + 1):
            line_tokens = [token for token in self.tokens if token['line'] == line_number]
            is_valid, message = self.parse_line(line_tokens, line_number)
            syntax_results.append({
                'line': line_number,
                'valid': is_valid,
                'message': message
            })
        
        return syntax_results

    def parse_line(self, tokens, line_number):
        if not tokens:
            return True, ''  # Línea vacía es válida

        # Convertir tokens a tipos
        token_types = [token['type'] for token in tokens]
        token_values = [token['value'] for token in tokens]

        # Validación básica de estructuras comunes
        try:
            # Declaración de variable
            if token_types[0] in ['TPINT', 'TPSTR', 'TPDBL']:
                if len(token_types) >= 2 and token_types[1] == 'IDEN':
                    return True, ''
                else:
                    return False, 'Error en declaración de variable'

            # Asignación
            if len(token_types) >= 3 and token_types[0] == 'IDEN' and token_types[1] == 'ASSGN':
                return True, ''

            # Estructura if
            if len(token_types) >= 3 and token_types[0] == 'IF':
                return True, ''
            
            # Estructura else
            if len(token_types) >= 1 and token_types[0] == 'ELSE':
                return True, ''
            
            # Estructura for
            if len(token_types) >= 3 and token_types[0] == 'FOR':
                return True, ''

            # Estructura while
            if len(token_types) >= 3 and token_types[0] == 'WHI':
                return True, ''
            
            # Estructura do
            if len(token_types) >= 1 and token_types[0] == 'DO':
                return True, ''
            
            # Estructura do-while (cierre)
            if len(token_types) >= 3 and token_types[0] == 'CH}' and token_types[1] == 'WHI':
                return True, ''

            # Función output
            if len(token_types) >= 3 and token_types[0] == 'OUT':
                return True, ''
                
            # Función input
            if len(token_types) >= 3 and token_types[0] == 'INP':
                return True, ''

            # Función con retorno de valor
            if len(token_types) >= 3 and token_types[0] == 'FCTN':
                return True, ''
            
            # Return statement
            if len(token_types) >= 2 and token_types[0] == 'RTRN':
                return True, ''

            # Bloque vacío o cierre de bloque
            if len(token_types) == 1 and (token_types[0] == 'CH}' or token_types[0] == 'CH{'):
                return True, ''
                
            # Cierre de bloque con else
            if len(token_types) >= 2 and token_types[0] == 'CH}' and token_types[1] == 'ELSE':
                return True, ''
                
            # Cierre de bloque con else if
            if len(token_types) >= 3 and token_types[0] == 'CH}' and token_types[1] == 'ELSE' and token_types[2] == 'IF':
                return True, ''
                
            # Cierre de bloque general (cualquier token después de llave de cierre)
            if len(token_types) >= 1 and token_types[0] == 'CH}':
                return True, ''

        except IndexError:
            return False, f"Error sintáctico en línea {line_number}: Estructura incompleta"

        return False, f"Error sintáctico en línea {line_number}: Estructura no reconocida"

# Ruta para tokenizar
@app.route("/tokenize", methods=["POST"])
def tokenize():
    data = request.get_json()
    text = data["code"]
    lex = Lexer(text)
    lex.tokenize()
    tokens = lex.get_tokens()
    identifiers = lex.get_identifiers_info()
    errors = lex.detect_errors()
    syntax_results = lex.check_syntax()
    
    # Combinar errores léxicos y sintácticos, evitando duplicados
    syntax_errors = [
        {'line': res['line'], 'type': 'SYNTAX_ERROR', 'message': res['message']} 
        for res in syntax_results if not res['valid']
    ]
    
    # Eliminar errores duplicados y errores sintácticos para líneas con errores semánticos
    unique_errors = []
    error_lines = set()

    # Primero, agregar errores semánticos
    for error in errors:
        if not any(
            e['type'] == error['type'] and 
            e['line'] == error['line'] and 
            e.get('variable') == error.get('variable') and
            e.get('message') == error.get('message')
            for e in unique_errors
        ):
            unique_errors.append(error)
            error_lines.add(error['line'])

    # Luego, agregar errores sintácticos solo para líneas sin errores semánticos
    for error in syntax_errors:
        if error['line'] not in error_lines and not any(
            e['type'] == error['type'] and 
            e['line'] == error['line'] and 
            e['message'] == error['message']
            for e in unique_errors
        ):
            unique_errors.append(error)
    
    return jsonify({
        "identificadores": identifiers,
        "tokens": tokens,
        "errores": unique_errors,
        "syntaxResults": [{'line': res['line'], 'valid': res['valid'], 'message': res['message']} for res in syntax_results]
    })

if __name__ == "__main__":
    app.run(debug=True)

