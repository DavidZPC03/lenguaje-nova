import { Box, Flex, Heading, Text } from '@chakra-ui/react';

interface TokenDisplayProps {
  tokens: { type: string; indent: number }[];
}

export function Tokens({ tokens }: TokenDisplayProps) {
  return (
    <>
      <Box flex={0.5}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Heading fontSize={'2xl'} fontWeight={'semibold'}>
            Tokens
          </Heading>
        </Flex>
        <Box mt={2} fontSize={'18px'} border='1px solid' rounded='md' borderColor={'#4b4d58'} boxShadow={'md'} p={2}>
          {tokens.map((token, index) => (
            <Text key={index} ml={`${token.indent * 8}px`} color="gray.500">
              {token.type}
            </Text>
          ))}
        </Box>
      </Box>
    </>
  );
}