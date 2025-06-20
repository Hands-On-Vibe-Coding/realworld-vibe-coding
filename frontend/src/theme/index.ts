import { createTheme } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';

const brand: MantineColorsTuple = [
  '#f0f9ff',
  '#e0f2fe', 
  '#bae6fd',
  '#7dd3fc',
  '#38bdf8',
  '#0ea5e9',
  '#0284c7',
  '#0369a1',
  '#075985',
  '#0c4a6e'
];

export const theme = createTheme({
  primaryColor: 'green',
  colors: {
    brand,
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true,
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
});