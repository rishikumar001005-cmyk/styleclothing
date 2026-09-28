import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  light?: boolean;
}

export function Logo({ className = "h-16", showText = true, light = false }: LogoProps) {
  const color = light ? "#ffffff" : "#111111";
  
  
  const viewBox = showText ? "65 20 545 180" : "65 20 170 180";

  return (
    <div className={`flex items-center justify-center ${className}`} id="brand-logo-container">
      <svg
        viewBox={viewBox}
        className="w-full h-full object-contain"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="brand-logo-svg"
      >
        <g id="monogram-group">
          <text
            x="125"
            y="142"
            fontFamily="'Times New Roman', Georgia, serif"
            fontSize="155"
            fontWeight="normal"
            fill={color}
            textAnchor="middle"
            id="logo-text-s"
          >
            S
          </text>
          
          <text
            x="182"
            y="182"
            fontFamily="'Times New Roman', Georgia, serif"
            fontSize="145"
            fontWeight="normal"
            fill={color}
            textAnchor="middle"
            id="logo-text-c"
          >
            C
          </text>
        </g>

        {showText && (
          <>
            <line
              x1="245"
              y1="50"
              x2="245"
              y2="170"
              stroke={color}
              strokeWidth="1.5"
              opacity="0.85"
              id="vertical-divider"
            />

            <g id="brand-text-group">
              <text
                x="285"
                y="112"
                fontFamily="'Times New Roman', Georgia, serif"
                fontSize="58"
                fontWeight="normal"
                letterSpacing="16"
                fill={color}
                textAnchor="start"
                id="brand-text-style"
              >
                STYLE
              </text>
              
              <line
                x1="285"
                y1="148"
                x2="350"
                y2="148"
                stroke={color}
                strokeWidth="1"
                opacity="0.75"
                id="flanking-line-left"
              />
              
              <text
                x="442"
                y="153"
                fontFamily="'Inter', sans-serif"
                fontSize="12.5"
                fontWeight="bold"
                letterSpacing="11"
                fill={color}
                textAnchor="middle"
                id="brand-text-clothing"
              >
                CLOTHING
              </text>
              
              <line
                x1="535"
                y1="148"
                x2="600"
                y2="148"
                stroke={color}
                strokeWidth="1"
                opacity="0.75"
                id="flanking-line-right"
              />
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
