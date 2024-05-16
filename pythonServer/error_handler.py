# error_handler.py

def detect_errors(tokens):
    errors = []
    last_token = None

    for index, token in enumerate(tokens):
        if last_token:
            if last_token['type'] == 'IF' and token['type'] != 'CH(':
                errors.append({
                    'line': token['line'],
                    'message': "Expected '(' after 'if'"
                })
            elif last_token['type'] in ['FOR', 'WHILE'] and token['type'] != 'CH(':
                errors.append({
                    'line': token['line'],
                    'message': f"Expected '(' after {last_token['type'].lower()}"
                })

        if token['type'] == 'IDEN' and (index + 1 < len(tokens) and tokens[index + 1]['type'] == 'IDEN'):
            errors.append({
                'line': token['line'],
                'message': "Unexpected identifier after another identifier"
            })

        last_token = token

    return errors
