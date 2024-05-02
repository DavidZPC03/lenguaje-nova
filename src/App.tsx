import { Container, Divider, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes } from 'react-router';
import { Link } from 'react-router-dom';
import Home from './Components/Home';

function App() {
  return (
    <AnimatePresence mode='wait'>
      <Container maxW={'7xl'} mt={2}>
        <Flex alignItems={'center'} textAlign={'center'} justifyContent={'center'}>
          <Image src='logo.png' alt='Logo' boxSize={36} />
          <Heading as={'h1'} size={'3xl'} textAlign={'center'} color={'blue.400'}>
            <Link to={'/'}>NOVA</Link>
          </Heading>
        </Flex>
        <Text mt={4} fontWeight={'bold'} fontSize={'lg'}>
          Creado por:
        </Text>
        <Text>David Perez Compean - 21100266</Text>
        <Text>Esdras Daniel Amaya Vela - 21100155</Text>
        <Text>Alexis Sanmiguel Torres - 21100288</Text>

        <Divider mt={4} mb={4} />

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/diagrama' element={<></>} />
        </Routes>
      </Container>
    </AnimatePresence>
  );
}

export default App;
