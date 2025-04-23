import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.fontSize.medium};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background};
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: ${theme.spacing.md};
    font-weight: ${theme.typography.fontWeight.medium};
  }

  h1 {
    font-size: ${theme.typography.fontSize.xxlarge};
  }

  h2 {
    font-size: ${theme.typography.fontSize.xlarge};
  }

  h3 {
    font-size: ${theme.typography.fontSize.large};
  }

  p {
    margin-bottom: ${theme.spacing.md};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.short};
    
    &:hover {
      color: ${theme.colors.secondary};
    }
  }

  button {
    cursor: pointer;
  }

  .card {
    background: ${theme.colors.surface};
    border-radius: ${theme.borderRadius.medium};
    box-shadow: ${theme.shadows.small};
    padding: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.lg};
  }
`;

export default GlobalStyles;
