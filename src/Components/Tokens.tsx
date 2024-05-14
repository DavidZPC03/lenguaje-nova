import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';

interface TokenDisplayProps {
  tokens: {
    type: string;
    value: string;
    line: number;
  }[];
}

export function Tokens({ tokens }: TokenDisplayProps) {
  let currentIndent = 0; // Sigue la indentación actual
  const lines = []; // Almacena líneas de tokens
  let currentLine = []; // Almacena los tokens de la línea actual

  // Procesa cada token para organizarlos por líneas según su indentación
  tokens.forEach((token) => {
    if (token.indent > currentIndent) {
      if (currentLine.length > 0) {
        lines.push({ tokens: currentLine, indent: currentIndent });
        currentLine = [];
      }
      currentIndent = token.indent;
    } else if (token.indent < currentIndent) {
      if (currentLine.length > 0) {
        lines.push({ tokens: currentLine, indent: currentIndent });
        currentLine = [];
      }
      currentIndent = token.indent;
    }
    currentLine.push(token.type);
  });

  // Añade la última línea si hay tokens pendientes
  if (currentLine.length > 0) {
    lines.push({ tokens: currentLine, indent: currentIndent });
  }

  // Función para descargar los tokens como archivo .txt
  const downloadTokens = () => {
    const tokenText = lines
      .map((line) => ' '.repeat(line.indent * 2) + line.tokens.join(' '))
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
          {lines.map((line, index) => (
            <Text key={index} ml={`${line.indent * 8}px`} color='gray.500'>
              {line.tokens.join(' ')}
            </Text>
          ))}
        </VStack>
      </Box>
    </>
  );
}
