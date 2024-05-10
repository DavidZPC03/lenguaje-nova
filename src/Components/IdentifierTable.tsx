import { Box, Flex, Heading } from '@chakra-ui/react';

interface Props {
  identificadores: unknown[];
}

export function IdentifierTable({ identificadores }: Props) {
  console.log(identificadores);

  return (
    <Box flex={0.5}>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Heading fontSize={'2xl'} fontWeight={'semibold'}>
          Tabla de símbolos
        </Heading>
      </Flex>
    </Box>
  );
}
