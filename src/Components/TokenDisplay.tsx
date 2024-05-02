import { Box, Text } from '@chakra-ui/react';

interface TokenDisplayProps {
  tokens: Token[];
}

const TokenDisplay = ({ tokens }: TokenDisplayProps) => {
  return (
    <Box h={64} borderWidth={1} borderRadius={8} overflow={'auto'} px={4} p={2} mt={6}>
      {tokens.map((token, index) => (
        <Text key={index}>{`(${token[0]}, '${token[1]}')`}</Text>
      ))}
    </Box>
  );
};

export default TokenDisplay;
