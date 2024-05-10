import { Box, Flex, Heading, IconButton } from '@chakra-ui/react';
import { javascript } from '@codemirror/lang-javascript';
import ReactCodeMirror from '@uiw/react-codemirror';
import { FiUpload } from 'react-icons/fi';

interface TokenDisplayProps {
  tokens: Token[];
}

export function Tokens({ tokens }: TokenDisplayProps) {
  return (
    <>
      <Box flex={0.5}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Heading fontSize={'2xl'} fontWeight={'semibold'}>
            Tokens
          </Heading>
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
            value={tokens?.map((token) => `${token[0]}: ${token[1]}`).join('\n') ?? ''}
            editable={false}
            height='300px'
            theme={'dark'}
          />
        </Box>
      </Box>
    </>
  );
}
