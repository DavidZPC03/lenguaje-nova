import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  styles: {
    global: {
      body: {
        color: 'white',
        bg: '#191a1f',
      },
    },
  },
});

export default theme;
