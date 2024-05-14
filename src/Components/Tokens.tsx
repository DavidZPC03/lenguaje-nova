import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';

interface TokenDisplayProps {
  tokens: {
    type: string;
    value: string;
    line: number;
    indent: number;
  }[];
}

export function Tokens({ tokens }: TokenDisplayProps) {
  const lines = tokens.reduce((acc, token) => {
    // Si no existe la línea, inicializa un array vacío para esa línea
    if (!acc[token.line]) acc[token.line] = [];
    // Añade el token a la línea correspondiente
    acc[token.line].push(token.type);
    return acc;
  }, {});

  // Función para descargar los tokens como archivo .txt
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

  return (
    <>
      <Box flex={0.5}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Heading fontSize={'2xl'} fontWeight={'semibold'}>
            Tokens
          </Heading>
          <Button onClick={downloadTokens} colorScheme='blue'>
            Download Tokens
          </Button>
        </Flex>
        <VStack
          align='start'
          spacing={4}
          mt={2}
          fontSize={'18px'}
          border='1px solid'
          rounded='md'
          borderColor={'#4b4d58'}
          boxShadow={'md'}
          p={2}
        >
          {Object.entries(lines).map(([lineNumber, lineTokens], index) => (
            <Text key={index} color='gray.500'>
              {lineTokens.join(' ')}
            </Text>
          ))}
        </VStack>
      </Box>
    </>
  );
}
