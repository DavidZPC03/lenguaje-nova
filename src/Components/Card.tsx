// Card.tsx
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure } from '@chakra-ui/react';

export function Card() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>


      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="rgba(0, 0, 0, 0.5)" borderRadius="md" p={4}>
          <ModalHeader>Mi Carta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <p>Este es el contenido de la carta.</p>
              {/* Puedes agregar más contenido aquí */}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
