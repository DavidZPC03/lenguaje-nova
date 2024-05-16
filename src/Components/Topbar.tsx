import { Flex, IconButton } from '@chakra-ui/react';
import { FiCopy, FiDownload, FiUpload } from 'react-icons/fi';

export function Topbar() {
  return (
    <Flex
      bg={'#282c34'}
      w={'full'}
      mb={4}
      py={4}
      gap={8}
      alignItems='center'
      justifyContent='center'
    >
      <IconButton
        aria-label='Download code'
        icon={<FiDownload />}
        bg={'transparent'}
        color={'gray.500'}
        p={2}
        _hover={{ color: 'white' }}
        fontSize={48}
      />
      <IconButton
        aria-label='Copy code'
        icon={<FiCopy />}
        bg={'transparent'}
        color={'gray.500'}
        p={2}
        size={'lg'}
        _hover={{ color: 'white' }}
        fontSize={48}
      />
      <IconButton
        aria-label='Download tokens'
        icon={<FiDownload />}
        bg={'transparent'}
        color={'gray.500'}
        p={2}
        _hover={{ color: 'white' }}
        fontSize={48}
      />
      <IconButton
        aria-label='Upload code'
        icon={<FiUpload />}
        bg={'transparent'}
        color={'gray.500'}
        p={2}
        _hover={{ color: 'white' }}
        fontSize={48}
      />
    </Flex>
  );
}
