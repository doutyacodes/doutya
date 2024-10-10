import React from 'react';
import { Slider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

const GreenSlider = ({ choices, selectedChoice, onChange, key }) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const isMediumScreen = useMediaQuery('(max-width:1024px)');

  // Calculate the middle index
  const middleIndex = Math.floor((choices.length - 1) / 2);

  const handleChange = (event, value) => {
    onChange(choices[value]);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Slider
        key={key}
        defaultValue={middleIndex}
        min={0}
        max={choices.length - 1}
        step={1}
        onChange={handleChange}
        valueLabelDisplay="off"
        marks={choices.map((choice, index) => ({
          value: index,
          label: choice.choiceText,
        }))}
        sx={{
          color: '#757575',
          height: 4,
          width: '100%', // Ensure slider takes full width
          '& .MuiSlider-rail': {
            opacity: 0.5,
            backgroundColor: '#bfbfbf',
            height: 4,
          },
          '& .MuiSlider-track': {
            height: 4,
            border: 'none',
          },
          '& .MuiSlider-thumb': {
            height: 16,
            width: 16,
            backgroundColor: '#fff',
            border: '2px solid currentColor',
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: 'inherit',
            },
          },
          '& .MuiSlider-markLabel': {
            color: 'white',
            fontSize: isSmallScreen ? '8px' : isMediumScreen ? '10px' : '12px',
            marginTop: '12px',
            maxWidth: isSmallScreen ? '50px' : isMediumScreen ? '70px' : '90px',
            lineHeight: '1.2',
            textAlign: 'center',
            wordWrap: 'break-word',
            overflow: 'visible',
            whiteSpace: 'normal',
            transform: 'translateX(-50%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              fontSize: isSmallScreen ? '9px' : isMediumScreen ? '11px' : '13px',
              zIndex: 1,
            },
          },
          '& .MuiSlider-mark': {
            width: '2px',
            height: '8px',
            backgroundColor: '#bfbfbf',
          },
        }}
      />
    </div>
  );
};

export default GreenSlider;