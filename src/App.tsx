import { Container, Divider, Flex, Heading, Image } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes } from 'react-router';
import { Link } from 'react-router-dom';
import Home from './Components/Home';
import './App.css';

function App() {
  return (
    <AnimatePresence mode='wait'>
      <Container maxW={'8xl'} mt={2}>
        <Flex alignItems={'center'} textAlign={'center'} justifyContent={'center'}>
          <Image src='logo.png' alt='Logo' boxSize={44} />
          <Heading as={'h1'} size={'4xl'} textAlign={'center'} color={'blue.400'}>
            <Link to={'/'}>NOVA</Link>
          </Heading>
        </Flex>

        <Divider mb={6} />

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/diagrama' element={<>Diagrama</>} />
        </Routes>
      </Container>
    </AnimatePresence>
  );
}

export default App;
