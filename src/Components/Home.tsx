import { Box, Button, Flex, IconButton, List, ListItem, Text } from '@chakra-ui/react';
import { javascript } from '@codemirror/lang-javascript';
import ReactCodeMirror from '@uiw/react-codemirror';
import { debounce } from 'lodash';
import { FormEvent, useCallback, useState } from 'react';
import { FiUpload } from 'react-icons/fi';

export default function Home() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  const [value, setValue] = useState('');
  const [tokens, setTokens] = useState<{ [key: string]: string }[]>();

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
                  setTokens(tokens);
                }}
              >
                Confirmar
              </Button>
            </Flex>
          </form>
        </Box>
        <Box flex={0.5}>
          <Text>Tokens</Text>
          <Box
            h={'600px'}
            borderWidth={1}
            borderRadius={8}
            overflow={'auto'}
            px={4}
            p={2}
            mt={6}
          >
            <List spacing={3}>
              {tokens?.map((token, index) => (
                <ListItem key={index}>
                  <Text as='b'>{token[0]}</Text>: <Text as='i'>{token[1]}</Text>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Flex>
    </>
  );
}
