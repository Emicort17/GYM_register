import React from 'react';

interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
}

export const PersonasIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <circle cx="12" cy="6" r="4" stroke={color} strokeWidth="1.5" />
    <path
      d="M18 9C19.6569 9 21 7.88071 21 6.5C21 5.11929 19.6569 4 18 4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6 9C4.34315 9 3 7.88071 3 6.5C3 5.11929 4.34315 4 6 4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M17.1973 15C17.7078 15.5883 18 16.2714 18 17C18 19.2091 15.3137 21 12 21C8.68629 21 6 19.2091 6 17C6 14.7909 8.68629 13 12 13C12.3407 13 12.6748 13.0189 13 13.0553"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M20 19C21.7542 18.6153 23 17.6411 23 16.5C23 15.3589 21.7542 14.3847 20 14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M4 19C2.24575 18.6153 1 17.6411 1 16.5C1 15.3589 2.24575 14.3847 4 14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const UsuariosIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path
      d="M14.2084 13.5521C16.3025 13.5521 18 11.8615 18 9.77606C18 7.6906 16.3025 6 14.2084 6C12.1144 6 10.4169 7.6906 10.4169 9.77606C10.4169 10.742 10.8578 11.4446 10.8578 11.4446L6.27264 16.011C6.0669 16.2159 5.77886 16.7486 6.27264 17.2404L6.8017 17.7673C7.00743 17.9429 7.52471 18.1888 7.94796 17.7673L8.56519 17.1526C9.18242 17.7673 9.88782 17.416 10.1523 17.0647C10.5932 16.45 10.0642 15.8353 10.0642 15.8353L10.2405 15.6597C11.087 16.5027 11.8277 16.011 12.0922 15.6597C12.5331 15.045 12.0922 14.4303 12.0922 14.4303C11.9159 14.079 11.5632 14.079 12.004 13.64L12.5331 13.113C12.9564 13.4643 13.8264 13.5521 14.2084 13.5521Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const BitacoraIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path
      d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235"
      stroke={color}
      strokeWidth="1.5"
    />
    <path d="M8 7H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 10.5H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M13 16V19.5309C13 19.8065 13 19.9443 12.9051 20C12.8103 20.0557 12.6806 19.9941 12.4211 19.8708L11.1789 19.2808C11.0911 19.2391 11.0472 19.2182 11 19.2182C10.9528 19.2182 10.9089 19.2391 10.8211 19.2808L9.57889 19.8708C9.31943 19.9941 9.18971 20.0557 9.09485 20C9 19.9443 9 19.8065 9 19.5309V16.45"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 22C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8M14 22C16.8284 22 18.2426 22 19.1213 21.1213C20 20.2426 20 18.8284 20 16V12"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({
  size = 20,
  color = 'currentColor',
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path
      d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.3531 21.8897 19.1752 21.9862 17 21.9983M9.00195 17C9.01406 19.175 9.11051 20.3529 9.87889 21.1213C10.5202 21.7626 11.4467 21.9359 13 21.9827"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
