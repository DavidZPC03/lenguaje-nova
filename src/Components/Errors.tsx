import { Box, Flex, Heading } from '@chakra-ui/react';

interface Props {
  errores: unknown[];
}

export function Errors({ errores }: Props) {
  console.log(errores);

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
