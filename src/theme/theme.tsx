import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  styles: {
    global: {
      body: {
        color: 'white',
        bg: '#2a2c33',
      },
    },
  },
});

export default theme;
