import { Box, Button, Flex, Heading, IconButton} from '@chakra-ui/react';
import { FiDownload, FiUpload } from 'react-icons/fi';
import { javascript } from '@codemirror/lang-javascript';
import ReactCodeMirror from '@uiw/react-codemirror';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure } from '@chakra-ui/react';


interface TokenDisplayProps {
  tokens: {
    type: string;
    value: string;
    line: number;
  }[];
  errores: {
    line: number;
    type: string;
    message: string;
  }[];
  //Card
  handleCodeChange: (code: string) => void;
}


export function Tokens({ tokens, errores, handleCodeChange }: TokenDisplayProps) {
  const lines = tokens.reduce((acc, token) => {
    if (!acc[token.line]) acc[token.line] = [];
    acc[token.line].push(token.type);
    return acc;
  }, {});

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        handleCodeChange(text?.toString() || '');
      };
      reader.readAsText(file);
    } else {
      toast({
        title: 'Error',
        description: 'No file was selected.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const downloadTokens = () => {
    if (errores.length > 0) {
      alert('No puedes descargar los tokens debido a errores en el código.');
      return;
    }

    const tokenText = Object.values(lines)
      .map((lineTokens) => lineTokens.join(' '))
      .join('\n');
    const blob = new Blob([tokenText], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'tokens.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tokensDisplay = Object.entries(lines)
    .map(([lineNumber, lineTokens]) => `${lineNumber}: ${lineTokens.join(' ')}`)
    .join('\n');

  return (
    <>
      <Box flex={0.5} >
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Heading fontSize={'2xl'} fontWeight={'semibold'}>
            Tokens
          </Heading>
          <Box flex={0.5} textAlign={'right'}> 
          <Button onClick={downloadTokens} colorScheme='blue' isDisabled={errores.length > 0}>
            Descargar tokens
          </Button>
          <input
              type='file'
              id='fileInput'
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept='.nova'
            />
            <label htmlFor='fileInput'>
              <IconButton
                as='span'
                colorScheme='gray'
                aria-label='Cargar archivo'
                icon={<FiUpload />}
                mr={2}
              />
            </label>
            <Button onClick={onOpen}>Mostrar carta</Button>
          </Box>

        </Flex>
        <Box
          mt={2}
          fontSize={'18px'}
          border='1px solid'
          rounded='md'
          borderColor={'#4b4d58'}
          boxShadow={'md'}
          p={2}
        >
          <ReactCodeMirror
            extensions={[javascript()]}
            value={tokensDisplay}
            height='300px'
            theme='dark'
            contentEditable={false}
            readOnly={true}
            basicSetup={{
              lineNumbers: false,
            }}
          />
        </Box>
      </Box>

            {/* Modal para la carta */}
            <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent 
       bg="rgba(0, 0, 0, 0.8)" // Fondo transparente
       color="white" // Color del texto
       borderRadius="md" // Bordes redondeados
        maxW="800px" // Cambia este valor para hacerla más ancha
        width="90%" // Para que se ajuste mejor en pantallas pequeñas
        >
          <ModalHeader>Carta Informativa</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Este es el contenido de la carta con fondo transparente.</p>
            <Button onClick={onClose} colorScheme='red' mt={4}>
              Cerrar
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
function toast(arg0: { title: string; description: string; status: string; duration: number; isClosable: boolean; }) {
  throw new Error('Function not implemented.');
}

