import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { javascript } from '@codemirror/lang-javascript';
import ReactCodeMirror from '@uiw/react-codemirror';

interface TokenDisplayProps {
  tokens: {
    type: string;
    value: string;
    line: number;
  }[];
}

export function Tokens({ tokens }: TokenDisplayProps) {
  const lines = tokens.reduce((acc, token) => {
    if (!acc[token.line]) acc[token.line] = [];
    acc[token.line].push(token.type);
    return acc;
  }, {});

  const downloadTokens = () => {
    const tokenText = Object.values(lines)
      .map((lineTokens) => lineTokens.join(' '))
      .join('\n');
    const blob = new Blob([tokenText], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'tokens.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tokensDisplay = Object.entries(lines)
    .map(([lineNumber, lineTokens]) => `${lineNumber}: ${lineTokens.join(' ')}`)
    .join('\n');

  return (
    <>
      <Box flex={0.5}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Heading fontSize={'2xl'} fontWeight={'semibold'}>
            Tokens
          </Heading>
          <Button onClick={downloadTokens} colorScheme='blue'>
            Descargar tokens
          </Button>
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
            extensions={[javascript()]}
            value={tokensDisplay}
            height='300px'
            theme='dark'
            contentEditable={false}
            readOnly={true}
            basicSetup={{
              lineNumbers: false,
            }}
          />
        </Box>
      </Box>
    </>
  );
}
