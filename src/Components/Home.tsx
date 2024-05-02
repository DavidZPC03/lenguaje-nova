import { Box, Button, Flex, IconButton, Input, Text } from '@chakra-ui/react';
import { FormEvent } from 'react';
import { FiUpload } from 'react-icons/fi';

const exampleTokens = `[
  ('case', 'CASE'),
  (' ', 'WHITESPACE'),
  ('x', 'IDENTIFIER'),
  (' ', 'WHITESPACE'),
  ('=', 'ASSIGNMENT'),
  (' ', 'WHITESPACE'),
  ('5', 'NUMBER'),
  (';', 'SEMICOLON'),
  (' ', 'WHITESPACE'),
  ('switch', 'SWITCH'),
  
  (' ', 'WHITESPACE'),
  ('x', 'IDENTIFIER'),
  (' ', 'WHITESPACE'),
  ('{', 'BRACES'),
  (' ', 'WHITESPACE'),
  ('case', 'CASE'),
  (' ', 'WHITESPACE'),
  ('5', 'NUMBER'),
  (':', 'COLON'),
  (' ', 'WHITESPACE'),
  ('break', 'BREAK'),
  (';', 'SEMICOLON'),
  (' ', 'WHITESPACE'),
  ('default', 'IDENTIFIER'),
  (':', 'COLON'),
  (' ', 'WHITESPACE'),
  ('break', 'BREAK'),
  (';', 'SEMICOLON'),
  (' ', 'WHITESPACE'),
  ('}', 'BRACES'),
  (' ', 'WHITESPACE'),
  ('catch', 'CATCH'),
  (' ', 'WHITESPACE'),
  ('(', 'PARENTHESIS'),
  ('e', 'IDENTIFIER'),
  (')', 'PARENTHESIS'),
  (' ', 'WHITESPACE'),
  ('{', 'BRACES'),
  (' ', 'WHITESPACE'),
  ('if', 'IF'),
  (' ', 'WHITESPACE'),
  ('(', 'PARENTHESIS'),
  ('e', 'IDENTIFIER'),
  (')', 'PARENTHESIS'),
  (' ', 'WHITESPACE'),
  ('{', 'BRACES'),
  (' ', 'WHITESPACE'),
  ('for', 'FOR'),
  (' ', 'WHITESPACE'),
  ('(', 'PARENTHESIS'),
  ('let', 'LET'),
  (' ', 'WHITESPACE'),
  ('i', 'IDENTIFIER'),
  (' ', 'WHITESPACE'),
  ('=', 'ASSIGNMENT'),
  (' ', 'WHITESPACE'),
  ('0', 'NUMBER'),
  (';', 'SEMICOLON'),
  (' ', 'WHITESPACE'),
  ('i', 'IDENTIFIER'),
  (' ', 'WHITESPACE'),
  ('<', 'LESS_THAN'),
  (' ', 'WHITESPACE'),
  ('5', 'NUMBER'),
  (';', 'SEMICOLON'),
  (' ', 'WHITESPACE'),
  ('i', 'IDENTIFIER'),
  ('+', 'PLUS'),
  ('+', 'PLUS'),
  (')', 'PARENTHESIS'),
  (' ', 'WHITESPACE'),
  ('{', 'BRACES'),
  (' ', 'WHITESPACE'),
  ('continue', 'CONTINUE'),
  (';', 'SEMICOLON'),
  (' ', 'WHITESPACE'),
  ('}', 'BRACES'),
  (' ', 'WHITESPACE'),
  ('}', 'BRACES'),
  (' ', 'WHITESPACE'),
  ('else', 'ELSE'),
  (' ', 'WHITESPACE'),
  ('{', 'BRACES'),
  (' ', 'WHITESPACE'),
  ('return', 'RETURN'),
  (';', 'SEMICOLON'),
  (' ', 'WHITESPACE'),
  ('}', 'BRACES'),
  (' ', 'WHITESPACE'),
  ('}', 'BRACES')
`;

export default function Home() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

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
            <Input
              px={4}
              p={2}
              mt={2}
              h={64}
              placeholder='Escribe tu código aquí...'
              rows={20}
              as={'textarea'}
            />
            <Flex gap={4}>
              <Button type='submit' mt={4} colorScheme='blue' width={'100%'}>
                Guardar archivo
              </Button>
            </Flex>
          </form>
        </Box>
        <Box flex={0.5}>
          <Text>Código</Text>
          <Box
            h={64}
            borderWidth={1}
            borderRadius={8}
            overflow={'auto'}
            px={4}
            p={2}
            mt={6}
          >
            <Text>{exampleTokens}</Text>
          </Box>
        </Box>
      </Flex>
    </>
  );
}
