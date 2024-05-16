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
      console.log(response);

      setTokens(response.tokens);
      setErrores(response.errores);
      setIdentificadores(response.identificadores);
    }, 300),
    [setCode]
  );

  return (
    <>
      <Flex justifyContent={'space-between'} gap={4}>
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
