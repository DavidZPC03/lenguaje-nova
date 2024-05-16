import re

def detect_errors(tokens):
    errors = []

    error_messages = {
        'INVALID_IDEN': "Identificador no válido",
        'INVALID_KEYWORD': "Palabra reservada no válida",
        'INVALID_NUMINT': "Constante numérica entera no válida",
        'INVALID_NUMDB': "Constante numérica flotante no válida",
        'INVALID_NUMEXP': "Constante numérica con exponente no válido",
        'INVALID_OPERATOR': "Operadores aritméticos no válidos",
        'INVALID_STRING': "Cadena no válida",
        'INVALID_COMMENT': "Comentario no válido"
    }

    valid_keywords = {
        'CASE', 'SWTCH', 'BRK', 'TRY', 'INP', 'OUT', 'CLEAR', 
        'TPINT', 'TPSTR', 'TPDBL', 'CTCH', 'IF', 'ELSE', 'ELIF', 
        'FOR', 'WHI', 'DO', 'CNTN', 'RTRN', 'FCTN'
    }

    for index, token in enumerate(tokens):
        # Verificar identificadores no válidos
        if token['type'].startswith('IDEN') and not token['value'].startswith('_'):
            errors.append({
                'line': token['line'],
                'message': error_messages['INVALID_IDEN'],
                'type': 'INVALID_IDEN'
            })

        # Verificar palabras reservadas no válidas
        if token['type'] not in valid_keywords and not token['type'].startswith('IDEN'):
            if re.match(r'^[a-zA-Z_]\w*$', token['value']) and token['value'] not in valid_keywords:
                errors.append({
                    'line': token['line'],
                    'message': error_messages['INVALID_KEYWORD'],
                    'type': 'INVALID_KEYWORD'
                })

        # Verificar constantes numéricas enteras no válidas
        if token['type'] == 'NUMINT' and re.search(r'[a-zA-Z]', token['value']):
            errors.append({
                'line': token['line'],
                'message': error_messages['INVALID_NUMINT'],
                'type': 'INVALID_NUMINT'
            })

        # Verificar constantes numéricas flotantes no válidas
        if token['type'] == 'NUMDB' and re.search(r'[a-zA-Z]', token['value']):
            errors.append({
                'line': token['line'],
                'message': error_messages['INVALID_NUMDB'],
                'type': 'INVALID_NUMDB'
            })

        # Verificar constantes numéricas con exponente no válidas
        if token['type'] == 'NUMEXP' and re.search(r'[a-zA-Z]', token['value']):
            errors.append({
                'line': token['line'],
                'message': error_messages['INVALID_NUMEXP'],
                'type': 'INVALID_NUMEXP'
            })

        # Verificar operadores aritméticos no válidos
        if token['type'].startswith('AOP') and re.search(r'[^\+\-\*/]', token['value']):
            errors.append({
                'line': token['line'],
                'message': error_messages['INVALID_OPERATOR'],
                'type': 'INVALID_OPERATOR'
            })

        # Verificar cadena no válida
        if token['type'] == 'STR' and re.search(r'\b(case|switch|break|try|input|output|clear|int|string|double|catch|if|else|elseif|for|while|do|continue|return|function)\b', token['value']):
            errors.append({
                'line': token['line'],
                'message': error_messages['INVALID_STRING'],
                'type': 'INVALID_STRING'
            })

        # Verificar comentario no válido
        if token['type'] == 'COMM' and not re.match(r'//.*', token['value']):
            errors.append({
                'line': token['line'],
                'message': error_messages['INVALID_COMMENT'],
                'type': 'INVALID_COMMENT'
            })

    return errors
