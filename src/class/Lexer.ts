type Pattern = [RegExp, string];
export type Token = [string, string];

export function createLexer(text: string) {
  const tokens: Token[] = [];

  function tokenize() {
    const patterns: Pattern[] = [
      [/[0-9]+/, 'NUMBER'],
      [/case/, 'CASE'],
      [/switch/, 'SWITCH'],
      [/break/, 'BREAK'],
      [/catch/, 'CATCH'],
      [/if/, 'IF'],
      [/else/, 'ELSE'],
      [/for/, 'FOR'],
      [/while/, 'WHILE'],
      [/do/, 'DO'],
      [/continue/, 'CONTINUE'],
      [/return/, 'RETURN'],
      [/function/, 'FUNCTION'],
      [/var/, 'VAR'],
      [/let/, 'LET'],
      [/const/, 'CONST'],
      [/new/, 'NEW'],
      [/[a-zA-Z_][a-zA-Z0-9_]*/, 'IDENTIFIER'],
      [/[ \t\n]+/, 'WHITESPACE'],
      [/;/, 'SEMICOLON'],
      [/[,]/, 'COMMA'],
      [/[.]/, 'DOT'],
      [/[()]/, 'PARENTHESIS'],
      [/[{}]/, 'BRACES'],
      [/=/, 'ASSIGNMENT'],
      [/[+]/, 'PLUS'],
      [/[-]/, 'MINUS'],
      [/[*]/, 'MULTIPLICATION'],
      [/\/]/, 'DIVISION'], // Fixed here
      [/</, 'LESS_THAN'],
      [/>/, 'GREATER_THAN'],
      [/!/, 'NOT'],
      [/&/, 'AND'],
      [/|/, 'OR'],
      [/[?]/, 'TERNARY'],
      [/[:]/, 'COLON'],
      [/==/, 'EQUALS'],
      [/!=/, 'NOT_EQUALS'],
      [/<=/, 'LESS_THAN_OR_EQUAL'],
      [/>=/, 'GREATER_THAN_OR_EQUAL'],
      [/&&/, 'AND'],
      [/||/, 'OR'],
    ];

    const combinedPatterns = new RegExp(
      patterns.map(([pattern, _]) => `(${pattern.source})`).join('|'),
      'g'
    );

    let match;
    while ((match = combinedPatterns.exec(text)) !== null) {
      console.log('aa');

      for (let i = 1; i <= patterns.length; i++) {
        if (match[i] !== undefined) {
          tokens.push([match[i], patterns[i - 1][1]]);
          break;
        }
      }
    }
  }

  function getTokens() {
    return tokens;
  }

  return { tokenize, getTokens };
}

/* const text =
  'case x = 5; switch x { case 5: break; default: break; } catch (e) { if (e) { for (let i = 0; i < 5; i++) { continue; } } else { return; } }';
const lexer = createLexer(text);
lexer.tokenize();

const tokens = lexer.getTokens();
 */
