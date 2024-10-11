// // import React from 'react';
// // import { Slider } from '@mui/material';
// // import useMediaQuery from '@mui/material/useMediaQuery';

// // const GreenSlider = ({ choices, selectedChoice, onChange, key }) => {
// //   const isSmallScreen = useMediaQuery('(max-width:600px)');

// //   const handleChange = (event, value) => {
// //     onChange(choices[value]);
// //   };

// //   return (
// //     <div className="flex flex-col items-center">
// //       <Slider
// //         key={key}
// //         defaultValue={null}
// //         min={0}
// //         max={choices.length - 1}
// //         step={1}
// //         onChange={handleChange}
// //         valueLabelDisplay="off"
// //         marks={choices.map((choice, index) => ({
// //           value: index,
// //           label: choice.choiceText,
// //         }))}
// //         sx={{
// //           color: '#00be61', // Slider color
// //           height: 30, // Slider height
// //           '& .MuiSlider-markLabel': {
// //             color: 'white', // Text color
// //             fontSize: isSmallScreen ? '10px' : '13px', // Font size adjustment for small screens
// //             marginTop: '20px', // Margin-top for the text labels
// //             maxWidth: '80px', // Limit the width of the label
// //             lineHeight: '1.2', // Adjust line height for multi-line text
// //             textAlign: 'center', // Center align text
// //             wordWrap: 'break-word', // Ensure long words break into the next line
// //             overflow: 'visible', // Allow overflow text to wrap
// //           },
// //         }}
// //       />
// //     </div>
// //   );
// // };

// // export default GreenSlider;



// import React from 'react';
// import { Slider } from '@mui/material';
// import useMediaQuery from '@mui/material/useMediaQuery';

// const GreenSlider = ({ choices, selectedChoice, onChange, key }) => {
//   const isSmallScreen = useMediaQuery('(max-width:600px)');

//   // Calculate the middle index
//   const middleIndex = Math.floor((choices.length - 1) / 2);

//   const handleChange = (event, value) => {
//     onChange(choices[value]);
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <Slider
//         key={key}
//         defaultValue={middleIndex}
//         min={0}
//         max={choices.length - 1}
//         step={1}
//         onChange={handleChange}
//         valueLabelDisplay="off"
//         marks={choices.map((choice, index) => ({
//           value: index,
//           label: choice.choiceText,
//         }))}
//         sx={{
//           color: '#00be61',
//           height: 30,
//           '& .MuiSlider-markLabel': {
//             color: 'white',
//             fontSize: isSmallScreen ? '10px' : '13px',
//             marginTop: '20px',
//             maxWidth: '80px',
//             lineHeight: '1.2',
//             textAlign: 'center',
//             wordWrap: 'break-word',
//             overflow: 'visible',
//           },
//         }}
//       />
//     </div>
//   );
// };

// export default GreenSlider;
import React from 'react';
import { Slider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

const GreenSlider = ({ choices, selectedChoice, onChange, key }) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  // Calculate the middle index
  const middleIndex = Math.floor((choices.length - 1) / 2);

  const handleChange = (event, value) => {
    onChange(choices[value]);
  };

  return (
    <div className="flex flex-col items-center">
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
          color: '#757575', // Neutral gray color
          height: 4,
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
            fontSize: isSmallScreen ? '7px' : '13px',
            marginTop: '12px',
            maxWidth: '80px',
            lineHeight: '1.2',
            textAlign: 'center',
            wordWrap: 'break-word',
            overflow: 'visible',
          },
        }}
      />
    </div>
  );
};

export default GreenSlider;