import { Box, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

interface Identifier {
  name: string;  // Nombre del identificador
  type: string;  // Tipo del identificador
  value: any;    // Valor asignado al identificador
}

interface IdentifierProps {
  identificadores: Identifier[];
}

export function IdentifierTable({ identificadores }: IdentifierProps) {
  // Verificación para asegurarnos de que hay identificadores antes de intentar renderizarlos
  if (!identificadores || identificadores.length === 0) {
    return (
      <Box flex={0.5} overflowX="auto">
        <Flex justifyContent={'space-between'} alignItems={'center'} mb={4}>
          <Heading fontSize={'2xl'} fontWeight={'semibold'}>
            Tabla de Símbolos
          </Heading>
        </Flex>
        <p>No hay identificadores para mostrar.</p>
      </Box>
    );
  }

  return (
    <Box flex={0.5} overflowX="auto">
      <Flex justifyContent={'space-between'} alignItems={'center'} mb={4}>
        <Heading fontSize={'2xl'} fontWeight={'semibold'}>
          Tabla de Símbolos
        </Heading>
      </Flex>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Tipo</Th>
            <Th>Valor</Th>
          </Tr>
        </Thead>
        <Tbody>
          {identificadores.map((id, index) => (
            <Tr key={index}>
              <Td>{id.name}</Td>
              <Td>{id.type}</Td>
              <Td>{JSON.stringify(id.value)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
