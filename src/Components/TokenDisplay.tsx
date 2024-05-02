import React from 'react';
import { Box, List, ListItem, Text } from '@chakra-ui/react';

const TokenDisplay = ({ tokens }) => {
  return (
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
    </Box>
  );
};

export default TokenDisplay;
