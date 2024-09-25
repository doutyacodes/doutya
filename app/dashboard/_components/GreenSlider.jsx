import React from 'react';
import { Slider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

const GreenSlider = ({ choices, selectedChoice, onChange }) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const handleChange = (event, value) => {
    onChange(choices[value]);
  };

  return (
    <div className="flex flex-col items-center">
      <Slider
        defaultValue={0}
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
          color: '#00be61', // Slider color
          height: 30, // Slider height
          '& .MuiSlider-markLabel': {
            color: 'white', // Text color
            fontSize: isSmallScreen ? '10px' : '13px', // Font size adjustment for small screens
            marginTop: '20px', // Margin-top for the text labels
            maxWidth: '80px', // Limit the width of the label
            lineHeight: '1.2', // Adjust line height for multi-line text
            textAlign: 'center', // Center align text
            wordWrap: 'break-word', // Ensure long words break into the next line
            overflow: 'visible', // Allow overflow text to wrap
          },
        }}
      />
    </div>
  );
};

export default GreenSlider;
