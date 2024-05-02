import { Box, Button, Flex, IconButton, Text } from '@chakra-ui/react';
import ReactCodeMirror from '@uiw/react-codemirror';
import { FormEvent, useCallback, useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { javascript } from '@codemirror/lang-javascript';
import { createLexer } from '../class/Lexer';
import { debounce } from 'lodash';
import TokenDisplay from './TokenDisplay'; // Importamos el nuevo componente

export default function Home() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  const [value, setValue] = useState('');
  const [tokens, setTokens] = useState([]);

  const onChange = useCallback(
    debounce((val: string) => {
      setValue(val);
      fetch('http://127.0.0.1:5000/tokenize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: val }),
      })
        .then((res) => res.json())
        .then((data) => {
          setTokens(data);
        });
    }, 300),
    [setValue]
  );

  return (
    <>
      <Flex justifyContent={'space-between'} alignItems={'flex-start'} gap={8}>
        <Box flex={0.5}>
          <form onSubmit={handleSubmit}>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Text>Código</Text>
              <IconButton
                type='submit'
                colorScheme='gray'
                aria-label='Cargar archivo'
                icon={<FiUpload />}
              />
            </Flex>
            <Box mt={2} fontSize={'18px'}>
              <ReactCodeMirror
                extensions={[javascript({ jsx: true })]}
                value={value}
                height='600px'
                onChange={onChange}
                theme={'dark'}
              />
            </Box>
            <Flex gap={4}>
              <Button
                type='submit'
                mt={4}
                colorScheme='blue'
                width={'100%'}
                onClick={() => {
                  const lexer = createLexer(value);
                  lexer.tokenize();
                  setTokens(lexer.getTokens());
                }}
              >
                Confirmar
              </Button>
            </Flex>
          </form>
        </Box>
        <TokenDisplay tokens={tokens} /> {/* Utilizamos el componente TokenDisplay */}
      </Flex>
    </>
  );
}
