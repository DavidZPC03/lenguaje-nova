import { Box, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

interface Error {
  line: number;
  type: string;
}

interface Props {
  errores: Error[];
}

export function Errors({ errores }: Props) {
  const getErrorDescription = (type: string) => {
    switch (type) {
      case "1":
        return "Error de sintaxis";
      case "2":
        return "Error de cadena";
      case "3":
        return "Error de constante numérica no válida";
      default:
        return "Error desconocido";
    }
  };

  return (
    <Box flex={0.5} overflowX="auto">
      <Flex justifyContent={'space-between'} alignItems={'center'} mb={4}>
        <Heading fontSize={'2xl'} fontWeight={'semibold'}>
          Tabla de Errores
        </Heading>
      </Flex>
      {errores && errores.length > 0 ? (
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Línea</Th>
              <Th>Tipo de Error</Th>
            </Tr>
          </Thead>
          <Tbody>
            {errores.map((error, index) => (
              <Tr key={index}>
                <Td>{error.line}</Td>
                <Td>{getErrorDescription(error.type)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <p>No hay errores para mostrar.</p>
      )}
    </Box>
  );
}
