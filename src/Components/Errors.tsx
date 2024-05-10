import { Box, Flex, Heading } from '@chakra-ui/react';

export function Errors() {
  return (
    <Box flex={0.5}>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Heading fontSize={'2xl'} fontWeight={'semibold'}>
          Tabla de errores
        </Heading>
      </Flex>
    </Box>
  );
}
