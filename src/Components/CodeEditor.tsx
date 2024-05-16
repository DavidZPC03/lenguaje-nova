import { Box, Flex, Heading, IconButton, useToast } from '@chakra-ui/react';
import { javascript } from '@codemirror/lang-javascript';
import ReactCodeMirror from '@uiw/react-codemirror';
import React from 'react';
import { FiDownload, FiUpload } from 'react-icons/fi';

interface Props {
  handleCodeChange: (code: string) => void;
  code: string;
}

export function CodeEditor({ code, handleCodeChange }: Props) {
  const toast = useToast();

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'code.nova');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        handleCodeChange(text?.toString() || '');
      };
      reader.readAsText(file);
    } else {
      toast({
        title: 'Error',
        description: 'No file was selected.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box flex={0.5}>
      <form onSubmit={(e) => e.preventDefault()}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Heading fontSize={'2xl'} fontWeight={'semibold'}>
            Código
          </Heading>
          <Flex>
            <input
              type='file'
              id='fileInput'
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept='.nova'
            />
            <label htmlFor='fileInput'>
              <IconButton
                as='span'
                colorScheme='gray'
                aria-label='Cargar archivo'
                icon={<FiUpload />}
                mr={2}
              />
            </label>
            <IconButton
              type='button'
              onClick={downloadCode}
              colorScheme='blue'
              aria-label='Descargar código'
              icon={<FiDownload />}
            />
          </Flex>
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
            onChange={handleCodeChange}
            height='300px'
            theme={'dark'}
          />
        </Box>
      </form>
    </Box>
  );
}
