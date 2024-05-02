<<<<<<< HEAD
import React from 'react';
import { Box, List, ListItem, Text } from '@chakra-ui/react';
=======
import { Box, Text } from '@chakra-ui/react';
>>>>>>> 3d6f291db46b49640eea682697b2f5b5672b5a6d

interface TokenDisplayProps {
  tokens: Token[];
}

const TokenDisplay = ({ tokens }: TokenDisplayProps) => {
  return (
<<<<<<< HEAD
    <Box
      flex={0.5}
      h={64}
      borderWidth={1}
      borderRadius={8}
      overflow={'auto'}
      px={4}
      p={2}
      mt={6}
    >
      <Text>Tokens</Text>
      <List spacing={3}>
        {tokens?.map((token, index) => (
          <ListItem key={index}>
            <Text as='b'>{token[0]}</Text>: <Text as='i'>{token[1]}</Text>
          </ListItem>
        ))}
      </List>
=======
    <Box h={64} borderWidth={1} borderRadius={8} overflow={'auto'} px={4} p={2} mt={6}>
      {tokens.map((token, index) => (
        <Text key={index}>{`(${token[0]}, '${token[1]}')`}</Text>
      ))}
>>>>>>> 3d6f291db46b49640eea682697b2f5b5672b5a6d
    </Box>
  );
};

export default TokenDisplay;
