import React from 'react';
import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';

interface TokenDisplayProps {
  tokens: { type: string; indent: number }[];
}

export function Tokens({ tokens }: TokenDisplayProps) {
  // Crear una representación visual de cada línea de tokens
  let currentIndent = 0;
  let lines = [];
  let currentLine = [];

  tokens.forEach(token => {
    if (token.indent > currentIndent) {
      // Iniciar una nueva línea con mayor indentación
      if (currentLine.length > 0) {
        lines.push({ tokens: currentLine, indent: currentIndent });
        currentLine = [];
      }
      currentIndent = token.indent;
    } else if (token.indent < currentIndent) {
      // Finalizar la línea actual y ajustar la indentación
      if (currentLine.length > 0) {
        lines.push({ tokens: currentLine, indent: currentIndent });
        currentLine = [];
      }
      currentIndent = token.indent;
    }
    currentLine.push(token.type);
  });

  // Asegurarse de agregar la última línea
  if (currentLine.length > 0) {
    lines.push({ tokens: currentLine, indent: currentIndent });
  }

  return (
    <>
      <Box flex={0.5}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Heading fontSize={'2xl'} fontWeight={'semibold'}>
            Tokens
          </Heading>
        </Flex>
        <VStack align="start" spacing={4} mt={2} fontSize={'18px'} border='1px solid' rounded='md' borderColor={'#4b4d58'} boxShadow={'md'} p={2}>
          {lines.map((line, index) => (
            <Text key={index} ml={`${line.indent * 8}px`} color="gray.500">
              {line.tokens.join(' ')}
            </Text>
          ))}
        </VStack>
      </Box>
    </>
  );
}
