import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  styles: {
    global: {
      body: {
        color: 'white',
        bg: '#111827',
      },
    },
  },
});

export default theme;
