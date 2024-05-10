import { Flex } from '@chakra-ui/react';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';
import { tokenizeCode } from '../services/api';
import { CodeEditor } from './CodeEditor';
import { Errors } from './Errors';
import { Tokens } from './Tokens';
import { IdentifierTable } from './IdentifierTable';

export default function Home() {
  const [code, setCode] = useState('');
  const [tokens, setTokens] = useState([]);

  const handleCodeChange = useCallback(
    debounce(async (val: string) => {
      setCode(val);

      const tokens = await tokenizeCode(val);
      setTokens(tokens);
    }, 300),
    [setCode]
  );

  return (
    <>
      <Flex justifyContent={'space-between'} gap={8}>
        <CodeEditor code={code} handleCodeChange={handleCodeChange} />
        <Tokens tokens={tokens} />
      </Flex>
      <Flex justifyContent={'space-between'} gap={8}>
        <IdentifierTable />
        <Errors />
      </Flex>
    </>
  );
}
