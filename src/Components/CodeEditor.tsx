import { Box, Flex, Heading, IconButton } from '@chakra-ui/react';
import { javascript } from '@codemirror/lang-javascript';
import ReactCodeMirror from '@uiw/react-codemirror';
import { FiUpload } from 'react-icons/fi';

interface Props {
  handleCodeChange: (code: string) => void;
  code: string;
}

export function CodeEditor({ code, handleCodeChange }: Props) {
  return (
    <Box flex={0.5}>
      <form>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Heading fontSize={'2xl'} fontWeight={'semibold'}>
            Código
          </Heading>
          <IconButton
            type='submit'
            colorScheme='gray'
            aria-label='Cargar archivo'
            icon={<FiUpload />}
          />
        </Flex>
        <Box
          mt={2}
          fontSize={'18px'}
          border='1px solid'
          rounded='md'
          borderColor={'#4b4d58'}
          boxShadow={'md'}
          p={2}
        >
          <ReactCodeMirror
            extensions={[javascript({ jsx: true })]}
            value={code}
            height='300px'
            onChange={handleCodeChange}
            theme={'dark'}
          />
        </Box>
      </form>
    </Box>
  );
}
