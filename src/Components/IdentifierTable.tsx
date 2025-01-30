import { Box, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, IconButton } from '@chakra-ui/react';
import { FiDownload, FiUpload } from 'react-icons/fi';

interface Identifier {
  type: string;
  name: string;
  value: number;
  line: string;
}

interface IdentifierProps {
  identificadores: Identifier[];
}

export function IdentifierTable({ identificadores }: IdentifierProps) {
  if (!identificadores || identificadores.length === 0) {
    return (
      <Box flex={0.5} overflowX='auto'>
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
    <Box flex={0.5} overflowX='auto'>
      <Flex justifyContent={'space-between'} alignItems={'center'} mb={4}>
        <Heading fontSize={'2xl'} fontWeight={'semibold'}>
          Tabla de Símbolos
        </Heading>
        <IconButton aria-label='Descargar tabla de símbolos' icon={<FiDownload />} colorScheme='blue'  
          onClick={() => {
        const identificadoresJson = JSON.stringify(identificadores, null, 2);
        const blob = new Blob([identificadoresJson], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        if(identificadores.length === 0)
          alert('No hay identificadores para descargar');
        else{
        link.href = href;
        link.download = 'identificadores.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
          }}}        
        />
      </Flex>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Tipo</Th>
            <Th>Valor</Th>
            <Th>Línea</Th>
          </Tr>
        </Thead>
        <Tbody>
          {identificadores.map((id, index) => (
            <Tr key={index}>
              <Td>{id.name}</Td>
              <Td>{id.type}</Td>
              <Td>{id.value}</Td>
              <Td>{id.line}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
