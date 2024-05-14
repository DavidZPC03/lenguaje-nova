// Componente Home
import { Flex } from '@chakra-ui/react';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';
import { tokenizeCode } from '../services/api';
import { CodeEditor } from './CodeEditor';
import { Errors } from './Errors';
import { IdentifierTable } from './IdentifierTable';
import { Tokens } from './Tokens';

export default function Home() {
  const [code, setCode] = useState('');
  const [tokens, setTokens] = useState([]);
  const [errores, setErrores] = useState([]);
  const [identificadores, setIdentificadores] = useState([]);

  const handleCodeChange = useCallback(
    debounce(async (val: string) => {
      setCode(val);
      const response = await tokenizeCode(val);
      setTokens(response.tokens);
      setErrores(response.errores);

      // Filtrar y transformar identificadores para que se ajusten al componente IdentifierTable
      const filteredIdentifiers = response.tokens
        .filter((token) => token.type === 'IDEN')
        .map((token) => ({
          name: token.type, // Esta debería ser una propiedad más descriptiva del token, si disponible
          type: token.type,
          value: `Línea ${token.line}`, // Asumiendo que quieres mostrar la línea como 'valor'
        }));
      setIdentificadores(filteredIdentifiers);
    }, 300),
    [setCode]
  );

  return (
    <>
      <Flex justifyContent={'space-between'} gap={8}>
        <CodeEditor code={code} handleCodeChange={handleCodeChange} />
        <Tokens tokens={tokens} />
      </Flex>

      <Flex justifyContent={'space-between'} gap={8} mt={6}>
        <IdentifierTable identificadores={identificadores} />
        <Errors errores={errores} />
      </Flex>
    </>
  );
}
