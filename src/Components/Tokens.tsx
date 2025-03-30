import { Box, Button, Flex, Heading, IconButton, Text } from '@chakra-ui/react';
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
  syntaxResults?: {
    line: number;
    valid: boolean;
    message?: string;
  }[];
  handleCodeChange: (code: string) => void;
}

// Definición de reglas sintácticas
const syntaxRules = [
  {
    name: "Declaración de variable sin asignación",
    pattern: ["TPINT", "IDEN", "CH;"],
    message: "Error en declaración de variable",
  },
  {
    name: "Declaración de variable con asignación",
    pattern: ["TPINT", "IDEN", "ASSGN", "NUMINT", "CH;"],
    message: "Error en declaración de variable con asignación",
  },
  {
    name: "Declaración de variable con asignación (flotante)",
    pattern: ["TPINT", "IDEN", "ASSGN", "NUMDB", "CH;"],
    message: "Error en declaración de variable con asignación (flotante)",
  },
  {
    name: "Declaración de variable con asignación (cadena)",
    pattern: ["TPSTR", "IDEN", "ASSGN", "STR", "CH;"],
    message: "Error en declaración de variable con asignación (cadena)",
  },
  {
    name: "If statement",
    pattern: ["IF", "CH(", "IDEN", "ROP>", "NUMINT", "CH)", "CH{"],
    message: "Error en estructura if",
  },
  {
    name: "Output",
    pattern: ["OUT", "CH(", "STR", "CH)", "CH;"],
    message: "Error en llamada a output",
  },
  {
    name: "For loop",
    pattern: ["FOR", "CH(", "IDEN", "ASSGN", "NUMINT", "CH;", "IDEN", "ROP<", "NUMINT", "CH;", "IDEN", "AOP+", "AOP+", "CH)", "CH{"],
    message: "Error en estructura for",
  },
  {
    name: "While loop",
    pattern: ["WHI", "CH(", "IDEN", "ROP<", "NUMINT", "CH)", "CH{"],
    message: "Error en estructura while",
  },
  {
    name: "Bloque vacío",
    pattern: ["CH}"],
    message: "Error en bloque vacío",
  },
  {
    name: "Asignación de variable",
    pattern: ["IDEN", "ASSGN", "NUMINT", "CH;"],
    message: "Error en asignación de variable",
  },
  {
    name: "Asignación de variable (flotante)",
    pattern: ["IDEN", "ASSGN", "NUMDB", "CH;"],
    message: "Error en asignación de variable (flotante)",
  },
  {
    name: "Asignación de variable (cadena)",
    pattern: ["IDEN", "ASSGN", "STR", "CH;"],
    message: "Error en asignación de variable (cadena)",
  },
];

// Función para validar una línea de código
const validateLine = (lineTokens: Array<{ type: string, value: string }>) => {
  const tokenTypes = lineTokens.map(t => t.type);

  for (const rule of syntaxRules) {
    if (rule.pattern.length !== tokenTypes.length) continue; // Saltar si no coinciden en longitud

    let match = true;
    for (let i = 0; i < rule.pattern.length; i++) {
      if (rule.pattern[i] !== tokenTypes[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      return { valid: true };
    }
  }

  return { valid: false, message: "Estructura no reconocida" };
};

export function Tokens({ tokens, errores, syntaxResults = [], handleCodeChange }: TokenDisplayProps) {
  const lines = tokens.reduce((acc: { [key: number]: Array<{ type: string, value: string }> }, token) => {
    if (!acc[token.line]) acc[token.line] = [];
    acc[token.line].push({ type: token.type, value: token.value });
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
    }
  };

  const downloadTokens = () => {
    if (errores.length > 0) {
      alert('No puedes descargar los tokens debido a errores en el código.');
      return;
    }

    const tokenText = Object.values(lines)
      .map((lineTokens) => lineTokens.map(t => `${t.value} -> ${t.type}`).join(', '))
      .join('\n');
    const blob = new Blob([tokenText], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'tokens.nova';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar errores sintácticos para evitar que se muestren en la tabla de errores
  const filteredErrores = errores.filter(error => error.type !== 'SYNTAX_ERROR');

  return (
    <>
      <Box flex={0.5}>
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
            <Button onClick={onOpen}>Mostrar análisis sintáctico</Button>
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
            value={Object.entries(lines)
              .map(([lineNumber, lineTokens]) =>
                `linea#${lineNumber}: ${lineTokens.map(t => `${t.value} -> ${t.type}`).join(', ')}`
              )
              .join('\n')}
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

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent
          bg="rgba(0, 0, 0, 0.9)"
          color="white"
          borderRadius="md"
          maxW="800px"
          width="90%"
        >
          <ModalHeader>Análisis Sintáctico</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {Object.entries(lines)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([lineNumber, lineTokens]) => {
                const line = parseInt(lineNumber);
                
                // Validar la línea usando las reglas sintácticas
                const syntaxResult = syntaxResults.find(r => r.line === line) || validateLine(lineTokens);
                
                const isValid = syntaxResult.valid;
                const errorMessage = syntaxResult.message || 'Error sintáctico';

                return (
                  <Box key={line} fontFamily="monospace" mb={3}>
                    <Text color="gray.300">
                      linea#{line}: {lineTokens.map(t => `${t.value} -> ${t.type}`).join(', ')}
                    </Text>
                    {isValid ? (
                      <Text color="green.400">✓ Estructura válida</Text>
                    ) : (
                      <Text color="red.400">
                        {errorMessage}
                      </Text>
                    )}
                  </Box>
                );
              })}
            <Button
              onClick={onClose}
              colorScheme="red"
              mt={4}
              width="full"
            >
              Cerrar
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}